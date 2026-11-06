using Nzt.Cli.Content;
using Nzt.Cli.Providers;

namespace Nzt.Cli.Install;

public enum FileAction { Created, Updated, Unchanged, SkippedLocallyEdited, Removed }

public sealed record PlannedFile(string TargetPath, string Content);

public sealed record FileOutcome(string TargetPath, FileAction Action);

public sealed record Conflict(string TargetPath, string Reason);

public sealed record InstallResult(
    Provider Provider,
    IReadOnlyList<Conflict> Conflicts,
    IReadOnlyList<FileOutcome> Outcomes)
{
    public bool Aborted => Conflicts.Count > 0;
    public int Count(FileAction action) => Outcomes.Count(o => o.Action == action);
}

public sealed record UninstallResult(
    Provider Provider,
    bool HadManifest,
    IReadOnlyList<FileOutcome> Outcomes)
{
    public int Count(FileAction action) => Outcomes.Count(o => o.Action == action);
}

public static class Installer
{
    /// <summary>El frontmatter de la skill `nzt`, el mismo en el plugin y en cada proveedor (D95).</summary>
    public const string NztFrontmatterFile = "skill-nzt.md";

    /// <summary>
    /// La skill `nzt` de un proveedor (D95), byte por byte lo que emite el build en
    /// `dist/&lt;proveedor&gt;/nzt/`: el frontmatter común, el kernel y el adapter son su
    /// `SKILL.md`, y el cuerpo de `skills/nzt/SKILL.md` pasa a `references/entry.md`.
    /// </summary>
    public static (string Skill, string Entry) NztSkill(ContentCatalog catalog, string adapterFile, string entrySource)
    {
        static string Lf(string text) => text.Replace("\r\n", "\n");
        var skill = Lf(catalog.Adapter(NztFrontmatterFile)).TrimEnd() + "\n\n"
                    + Lf(catalog.Kernel).TrimEnd() + "\n\n"
                    + Lf(catalog.Adapter(adapterFile)).TrimEnd() + "\n";
        var source = Lf(entrySource);
        var close = source.IndexOf("\n---\n", 3, StringComparison.Ordinal);
        var entry = close < 0 ? source : source[(close + "\n---\n".Length)..];
        return (skill, entry);
    }

    public static IReadOnlyList<PlannedFile> Plan(Provider provider, ContentCatalog catalog)
    {
        // Desde D95 nada va a CLAUDE.md ni AGENTS.md: el kernel viaja en la skill `nzt`.
        // El bloque de una instalación anterior sale como huérfano.
        var planned = new List<PlannedFile>();

        // El nombre plano es toda la ruta relativa a skills/ unida con guiones (9.1).
        // Es la misma identidad que valida el build y que nombran los routers.
        // Las referencias van dentro de la carpeta plana de su skill, donde los
        // routers las nombran por ruta relativa.
        foreach (var skill in catalog.Skills)
        {
            if (skill.Name == "nzt")
            {
                var (text, entry) = NztSkill(catalog, provider.AdapterFile, skill.Text);
                planned.Add(new PlannedFile(Path.Combine(provider.SkillsDirectory, "nzt", "SKILL.md"), text));
                planned.Add(new PlannedFile(
                    Path.Combine(provider.SkillsDirectory, "nzt", "references", "entry.md"), entry));
            }
            else
                planned.Add(new PlannedFile(
                    Path.Combine(provider.SkillsDirectory, skill.Name, "SKILL.md"),
                    skill.Text));
            foreach (var reference in skill.References)
                planned.Add(new PlannedFile(
                    Path.Combine(provider.SkillsDirectory, skill.Name, "references", reference.FileName),
                    reference.Text));
            foreach (var script in skill.Scripts)
                planned.Add(new PlannedFile(
                    Path.Combine(provider.SkillsDirectory, skill.Name, "scripts", script.FileName),
                    script.Text));
        }

        foreach (var agent in catalog.Agents.Where(a =>
                     string.Equals(Path.GetExtension(a.FileName), provider.AgentExtension,
                         StringComparison.OrdinalIgnoreCase)))
            planned.Add(new PlannedFile(Path.Combine(provider.AgentsDirectory, agent.FileName), agent.Text));

        return planned;
    }

    public static InstallResult Install(
        Provider provider, ContentCatalog catalog, string version, bool dryRun = false,
        string? manifestDirectory = null)
    {
        var planned = Plan(provider, catalog);
        var manifest = Manifest.Load(provider.Id, manifestDirectory);

        // ── Pre-scan: nunca sobrescribe un archivo que no instaló él ────────────
        // Las carpetas son globales y las comparte con lo que el usuario tenga.
        // Con un solo conflicto no se escribe nada: se corta y se informa.
        var conflicts = new List<Conflict>();
        foreach (var file in planned)
        {
            if (!File.Exists(file.TargetPath)) continue;
            if (manifest?.HashOf(file.TargetPath) is not null) continue;
            conflicts.Add(new Conflict(file.TargetPath,
                "ya existe y no figura en el manifiesto — no lo instaló este CLI"));
        }

        if (conflicts.Count > 0)
            return new InstallResult(provider, conflicts, []);

        // ── Escritura ──────────────────────────────────────────────────────────
        var outcomes = new List<FileOutcome>();
        var entries = new List<ManifestEntry>();

        foreach (var file in planned)
        {
            var newHash = Manifest.Hash(file.Content);

            if (!File.Exists(file.TargetPath))
            {
                if (!dryRun)
                {
                    Directory.CreateDirectory(Path.GetDirectoryName(file.TargetPath)!);
                    File.WriteAllText(file.TargetPath, file.Content);
                }
                outcomes.Add(new FileOutcome(file.TargetPath, FileAction.Created));
                entries.Add(new ManifestEntry(file.TargetPath, newHash));
                continue;
            }

            var currentHash = Manifest.HashFile(file.TargetPath);
            var installedHash = manifest!.HashOf(file.TargetPath)!;

            if (currentHash != installedHash)
            {
                // El usuario lo editó: no se pisa. Sigue siendo suyo, y el
                // manifiesto conserva el último hash instalado, no el editado.
                outcomes.Add(new FileOutcome(file.TargetPath, FileAction.SkippedLocallyEdited));
                entries.Add(new ManifestEntry(file.TargetPath, installedHash));
                continue;
            }

            if (currentHash == newHash)
            {
                outcomes.Add(new FileOutcome(file.TargetPath, FileAction.Unchanged));
                entries.Add(new ManifestEntry(file.TargetPath, newHash));
                continue;
            }

            if (!dryRun) File.WriteAllText(file.TargetPath, file.Content);
            outcomes.Add(new FileOutcome(file.TargetPath, FileAction.Updated));
            entries.Add(new ManifestEntry(file.TargetPath, newHash));
        }

        // ── Huérfanos: lo que instalamos antes y ya no está en el set ───────────
        // Un rename en el árbol dejaría la versión vieja instalada compitiendo
        // por el ruteo; por eso se borra, pero sólo si sigue siendo nuestra.
        if (manifest is not null)
        {
            var stillPlanned = planned.Select(p => p.TargetPath).ToHashSet(StringComparer.OrdinalIgnoreCase);

            foreach (var old in manifest.Files.Where(f => !stillPlanned.Contains(f.Path)))
            {
                if (!File.Exists(old.Path)) continue;

                if (old.ManagedBlock)
                {
                    RemoveManagedBlock(old, dryRun, outcomes, entries);
                    continue;
                }

                if (Manifest.HashFile(old.Path) != old.Sha256)
                {
                    outcomes.Add(new FileOutcome(old.Path, FileAction.SkippedLocallyEdited));
                    entries.Add(old);
                    continue;
                }

                if (!dryRun)
                {
                    File.Delete(old.Path);
                    RemoveEmptyParent(old.Path, provider);
                }
                outcomes.Add(new FileOutcome(old.Path, FileAction.Removed));
            }
        }

        if (!dryRun)
            new Manifest
            {
                Provider = provider.Id,
                Version = version,
                InstalledAt = DateTimeOffset.Now,
                Files = entries,
                Mods = manifest?.Mods
            }.Save(manifestDirectory);

        return new InstallResult(provider, [], outcomes);
    }

    /// <summary>
    /// Saca exactamente lo que dice el manifiesto. Lo que el usuario editó queda,
    /// y el manifiesto se borra sólo cuando ya no administra nada.
    /// </summary>
    public static UninstallResult Uninstall(Provider provider, bool dryRun = false,
        string? manifestDirectory = null)
    {
        var manifest = Manifest.Load(provider.Id, manifestDirectory);
        // Un manifiesto que solo anota mods no es una instalación del método.
        if (manifest is null || manifest.Files.Count == 0)
            return new UninstallResult(provider, HadManifest: false, []);

        var outcomes = new List<FileOutcome>();
        var retained = new List<ManifestEntry>();

        foreach (var entry in manifest.Files)
        {
            if (!File.Exists(entry.Path)) continue;

            if (entry.ManagedBlock)
            {
                RemoveManagedBlock(entry, dryRun, outcomes, retained);
                continue;
            }

            if (Manifest.HashFile(entry.Path) != entry.Sha256)
            {
                outcomes.Add(new FileOutcome(entry.Path, FileAction.SkippedLocallyEdited));
                retained.Add(entry);
                continue;
            }

            if (!dryRun)
            {
                File.Delete(entry.Path);
                RemoveEmptyParent(entry.Path, provider);
            }
            outcomes.Add(new FileOutcome(entry.Path, FileAction.Removed));
        }

        if (!dryRun)
        {
            var remaining = manifest with { Files = retained };
            if (remaining.IsEmpty) Manifest.Delete(provider.Id, manifestDirectory);
            else remaining.Save(manifestDirectory);
        }

        return new UninstallResult(provider, HadManifest: true, outcomes);
    }

    private static void RemoveManagedBlock(ManifestEntry entry, bool dryRun,
        List<FileOutcome> outcomes, List<ManifestEntry> retained)
    {
        var current = File.ReadAllText(entry.Path);
        if (!InstructionBlock.Matches(current, entry.Sha256, out var start, out var length))
        {
            outcomes.Add(new FileOutcome(entry.Path, FileAction.SkippedLocallyEdited));
            retained.Add(entry);
            return;
        }
        if (!dryRun) InstructionBlock.Remove(entry.Path, current, start, length);
        outcomes.Add(new FileOutcome(entry.Path, FileAction.Removed));
    }

    /// <summary>
    /// Borra las carpetas que quedaron vacías, de `references/` hacia arriba hasta
    /// `<skills>/<nombre>/`: el orden del manifiesto puede borrar el SKILL.md antes
    /// que sus referencias. Nunca sube más allá de la carpeta de skills del proveedor.
    /// </summary>
    private static void RemoveEmptyParent(string filePath, Provider provider)
    {
        var skillsRoot = Path.GetFullPath(provider.SkillsDirectory);
        var inside = skillsRoot.TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;

        for (var parent = Path.GetDirectoryName(Path.GetFullPath(filePath));
             parent is not null && parent.StartsWith(inside, StringComparison.OrdinalIgnoreCase);
             parent = Path.GetDirectoryName(parent))
        {
            if (!Directory.Exists(parent) || Directory.EnumerateFileSystemEntries(parent).Any()) return;
            Directory.Delete(parent);
        }
    }
}
