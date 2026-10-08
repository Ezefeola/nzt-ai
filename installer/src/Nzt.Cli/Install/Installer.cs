using Nzt.Cli.Content;
using Nzt.Cli.Providers;

namespace Nzt.Cli.Install;

public enum FileAction { Created, Updated, Unchanged, SkippedLocallyEdited, Removed }

public sealed record PlannedFile(string TargetPath, string Content, bool ManagedBlock = false);

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
    public static IReadOnlyList<PlannedFile> Plan(Provider provider, ContentCatalog catalog)
    {
        var planned = new List<PlannedFile>
        {
            new(provider.InstructionsFile,
                InstructionBlock.Render(catalog.Kernel, catalog.Adapter(provider.AdapterFile)),
                ManagedBlock: true)
        };

        // El nombre plano es toda la ruta relativa a skills/ unida con guiones (9.1).
        // Es la misma identidad que valida el build y que nombran los routers.
        // Las referencias van dentro de la carpeta plana de su skill, donde los
        // routers las nombran por ruta relativa.
        foreach (var skill in catalog.Skills)
        {
            planned.Add(new PlannedFile(
                Path.Combine(provider.SkillsDirectory, skill.Name, "SKILL.md"),
                skill.Text));
            foreach (var reference in skill.References)
                planned.Add(new PlannedFile(
                    Path.Combine(provider.SkillsDirectory, skill.Name, "references", reference.FileName),
                    reference.Text));
        }

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
            // Un CLAUDE.md propio del usuario no es conflicto: le agregamos el
            // bloque y le dejamos su texto. Sí lo es si ya tiene marcadores
            // nuestros sin manifiesto, porque entonces no sabemos de quién son.
            if (file.ManagedBlock && !InstructionBlock.HasMarkers(File.ReadAllText(file.TargetPath))) continue;

            conflicts.Add(new Conflict(file.TargetPath,
                file.ManagedBlock
                    ? "tiene marcadores nzt pero no figura en el manifiesto — no lo instaló este CLI"
                    : "ya existe y no figura en el manifiesto — no lo instaló este CLI"));
        }

        if (conflicts.Count > 0)
            return new InstallResult(provider, conflicts, []);

        // ── Escritura ──────────────────────────────────────────────────────────
        var outcomes = new List<FileOutcome>();
        var entries = new List<ManifestEntry>();

        foreach (var file in planned)
        {
            var newHash = Manifest.Hash(file.Content);

            if (file.ManagedBlock)
            {
                var exists = File.Exists(file.TargetPath);
                var current = exists ? File.ReadAllText(file.TargetPath) : "";
                var previous = manifest?.Files.FirstOrDefault(f =>
                    string.Equals(f.Path, file.TargetPath, StringComparison.OrdinalIgnoreCase));

                // Primera vez sobre un archivo del usuario: el bloque va arriba y
                // su contenido queda abajo, intacto.
                var replacement = file.Content + current;

                if (exists && previous is not null)
                {
                    if (!previous.ManagedBlock
                        || !InstructionBlock.Matches(current, previous.Sha256, out var start, out var length))
                    {
                        // Lo editaron o lo rompieron: se conserva y se informa.
                        outcomes.Add(new FileOutcome(file.TargetPath, FileAction.SkippedLocallyEdited));
                        entries.Add(previous);
                        continue;
                    }
                    replacement = current.Remove(start, length).Insert(start, file.Content);
                }

                var action = !exists ? FileAction.Created
                    : replacement == current ? FileAction.Unchanged : FileAction.Updated;

                if (!dryRun && action != FileAction.Unchanged)
                {
                    Directory.CreateDirectory(Path.GetDirectoryName(file.TargetPath)!);
                    Backup(file.TargetPath, exists, previous is null);
                    File.WriteAllText(file.TargetPath, replacement);
                }

                outcomes.Add(new FileOutcome(file.TargetPath, action));
                entries.Add(new ManifestEntry(file.TargetPath, newHash, ManagedBlock: true));
                continue;
            }

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
                Files = entries
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
        if (manifest is null)
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
            if (retained.Count == 0) Manifest.Delete(provider.Id, manifestDirectory);
            else (manifest with { Files = retained }).Save(manifestDirectory);
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
    /// Copia de seguridad la primera vez que se toca un archivo de instrucciones
    /// que ya existía y no es nuestro. Una sola: no se pisa un backup previo.
    /// </summary>
    private static void Backup(string path, bool exists, bool firstTime)
    {
        if (!exists || !firstTime) return;
        var backup = path + ".nzt-backup";
        if (!File.Exists(backup)) File.Copy(path, backup);
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
