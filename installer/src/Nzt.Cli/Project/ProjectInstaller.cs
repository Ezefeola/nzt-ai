using Nzt.Cli.Content;
using Nzt.Cli.Install;

namespace Nzt.Cli.Project;

public sealed record ProviderMcp(ProjectTarget Target, IReadOnlyList<McpOutcome> Outcomes);

public sealed record ProjectResult(
    IReadOnlyList<Pack> Packs,
    IReadOnlyList<string> Unknown,
    IReadOnlyList<Conflict> Conflicts,
    IReadOnlyList<FileOutcome> Files,
    IReadOnlyList<ProviderMcp> Mcp)
{
    public bool Aborted => Unknown.Count > 0 || Conflicts.Count > 0;
    public int Count(FileAction action) => Files.Count(o => o.Action == action);
}

/// <summary>
/// Instala en un proyecto los packs que eligió: la skill de cada uno en la carpeta
/// de skills del proveedor, y sus MCP en el archivo de MCP del proveedor. Todo
/// sale de un estado deseado —packs y proveedores— y se reconcilia contra
/// su registro (<see cref="ProjectFile"/>), así agregar, sacar y sincronizar son la misma operación.
/// Como el instalador global, nunca pisa un archivo que no escribió él.
/// </summary>
public static class ProjectInstaller
{
    public static ProjectResult Apply(string projectDirectory, IReadOnlyList<string> packs,
        IReadOnlyList<ProjectTarget> targets, PackCatalog catalog, string version, bool dryRun = false,
        string? home = null, string? platform = null)
    {
        home ??= Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
        var previous = ProjectFile.Load(projectDirectory);
        var (resolved, unknown) = catalog.Resolve(packs);
        if (unknown.Count > 0) return new ProjectResult(resolved, unknown, [], [], []);

        var planned = Plan(resolved, targets);

        // ── Pre-scan: con un solo archivo ajeno no se escribe nada ───────────────
        var conflicts = planned
            .Where(p => File.Exists(Full(projectDirectory, p.Path)) && previous?.HashOf(p.Path) is null)
            .Select(p => new Conflict(p.Path, "ya existe y no lo escribió nzt-ai project"))
            .ToList();
        if (conflicts.Count > 0) return new ProjectResult(resolved, [], conflicts, [], []);

        var outcomes = new List<FileOutcome>();
        var entries = new List<ProjectEntry>();

        foreach (var (path, content) in planned)
        {
            var full = Full(projectDirectory, path);
            var newHash = Manifest.Hash(content);

            if (!File.Exists(full))
            {
                if (!dryRun) Write(full, content);
                outcomes.Add(new FileOutcome(path, FileAction.Created));
                entries.Add(new ProjectEntry(path, newHash));
                continue;
            }

            var installed = previous!.HashOf(path)!;
            var currentHash = Manifest.HashFile(full);

            if (currentHash != installed)
            {
                outcomes.Add(new FileOutcome(path, FileAction.SkippedLocallyEdited));
                entries.Add(new ProjectEntry(path, installed));
                continue;
            }

            var action = currentHash == newHash ? FileAction.Unchanged : FileAction.Updated;
            if (!dryRun && action == FileAction.Updated) Write(full, content);
            outcomes.Add(new FileOutcome(path, action));
            entries.Add(new ProjectEntry(path, newHash));
        }

        // ── Lo que se instaló antes y ya no corresponde ──────────────────────────
        var stillPlanned = planned.Select(p => p.Path).ToHashSet(StringComparer.OrdinalIgnoreCase);
        foreach (var old in previous?.Files.Where(f => !stillPlanned.Contains(f.Path)) ?? [])
        {
            var full = Full(projectDirectory, old.Path);
            if (!File.Exists(full)) continue;

            if (Manifest.HashFile(full) != old.Sha256)
            {
                outcomes.Add(new FileOutcome(old.Path, FileAction.SkippedLocallyEdited));
                entries.Add(old);
                continue;
            }

            if (!dryRun)
            {
                File.Delete(full);
                RemoveEmptyParents(projectDirectory, full);
            }
            outcomes.Add(new FileOutcome(old.Path, FileAction.Removed));
        }

        // ── MCP: los de los packs, en cada proveedor elegido; nada en los demás ──
        var servers = resolved.SelectMany(p => p.Mcp).DistinctBy(s => s.Name).ToList();
        var mcp = new List<ProviderMcp>();
        var owned = new Dictionary<string, List<string>>(StringComparer.Ordinal);

        foreach (var target in ProjectTarget.All)
        {
            var desired = targets.Contains(target) ? servers : [];
            var before = previous?.McpOf(target.ProviderId) ?? [];
            if (desired.Count == 0 && before.Count == 0) continue;

            var file = Full(projectDirectory, target.McpFile);
            var current = File.Exists(file) ? File.ReadAllText(file) : null;
            var (content, results, nowOwned) =
                McpConfig.Apply(target.McpFormat, current, desired, before, home, platform);

            if (!dryRun && content != current)
            {
                if (content is null) { File.Delete(file); RemoveEmptyParents(projectDirectory, file); }
                else Write(file, content);
            }

            mcp.Add(new ProviderMcp(target, results));
            if (nowOwned.Count > 0) owned[target.ProviderId] = nowOwned;
        }

        if (!dryRun)
        {
            var project = new ProjectFile
            {
                Version = version,
                Packs = [.. packs.Select(p => catalog.ByName(p)!.Name).Distinct()],
                Providers = [.. targets.Select(t => t.ProviderId)],
                Files = entries,
                Mcp = owned
            };

            if (project.Packs.Count == 0 && entries.Count == 0 && owned.Count == 0)
                ProjectFile.Delete(projectDirectory);
            else
                project.Save(projectDirectory);
        }

        return new ProjectResult(resolved, [], [], outcomes, mcp);
    }

    /// <summary>Cada archivo de cada pack con skill, en la carpeta de skills de cada proveedor.</summary>
    public static IReadOnlyList<(string Path, string Content)> Plan(IReadOnlyList<Pack> packs,
        IReadOnlyList<ProjectTarget> targets)
    {
        var planned = new List<(string, string)>();
        foreach (var target in targets)
        foreach (var skill in packs.Select(p => p.Skill).OfType<SkillFile>())
        {
            var folder = $"{target.SkillsDirectory}/{skill.Name}";
            planned.Add(($"{folder}/SKILL.md", skill.Text));
            foreach (var reference in skill.References)
                planned.Add(($"{folder}/references/{reference.FileName}", reference.Text));
        }
        return planned;
    }

    private static string Full(string projectDirectory, string relative) =>
        Path.GetFullPath(Path.Combine(projectDirectory, relative.Replace('/', Path.DirectorySeparatorChar)));

    private static void Write(string path, string content)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        File.WriteAllText(path, content);
    }

    /// <summary>Borra las carpetas que quedaron vacías, sin salir nunca de la raíz del proyecto.</summary>
    private static void RemoveEmptyParents(string projectDirectory, string filePath)
    {
        var root = Path.GetFullPath(projectDirectory).TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
        for (var parent = Path.GetDirectoryName(filePath);
             parent is not null && parent.StartsWith(root, StringComparison.OrdinalIgnoreCase);
             parent = Path.GetDirectoryName(parent))
        {
            if (!Directory.Exists(parent) || Directory.EnumerateFileSystemEntries(parent).Any()) return;
            Directory.Delete(parent);
        }
    }
}
