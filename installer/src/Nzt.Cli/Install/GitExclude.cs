using Nzt.Cli.Providers;

namespace Nzt.Cli.Install;

/// <summary>
/// *Solo para mí* no deja nada en el diff (RN-proy-modos): lo que el CLI crea se
/// anota en el `info/exclude` del repo, el ignore local que git no versiona,
/// dentro de un bloque que es lo único que el CLI toca de ese archivo. El bloque
/// se recalcula de los manifiestos del proyecto cada vez, así que instalar,
/// cambiar de modo y desinstalar lo dejan siempre al día.
/// </summary>
public static class GitExclude
{
    public const string Begin = "# nzt:start";
    public const string End = "# nzt:end";

    /// <summary>Las líneas que tendría el bloque: rutas ancladas a la raíz, con `/`.</summary>
    public static IReadOnlyList<string> Entries(ProjectRoot project)
    {
        var lines = new List<string>();

        foreach (var id in Provider.Ids)
        {
            var manifest = Manifest.Load(id, project.Combine(".nzt", "manifests"), project.Path);
            if (manifest is null) continue;

            // El backup es del usuario en los dos modos (RN-proy-backup).
            lines.Add("/.nzt/backup/");
            if (!manifest.Personal) continue;

            var provider = Provider.ById(id, project, personal: true)!;
            var skills = Manifest.Relative(project.Path, provider.SkillsDirectory) + "/";

            lines.Add($"/.nzt/manifests/{id}.json");
            foreach (var file in manifest.Files)
            {
                // De un archivo de instrucciones que ya existía, solo es nuestro el
                // bloque: excluirlo escondería el archivo del usuario.
                if (file.ManagedBlock && !file.Created) continue;

                var relative = Manifest.Relative(project.Path, file.Path);
                lines.Add("/" + (relative.StartsWith(skills, StringComparison.Ordinal)
                    ? skills + relative[skills.Length..].Split('/')[0] + "/"
                    : relative));
            }
        }

        return lines.Distinct(StringComparer.Ordinal).ToList();
    }

    /// <summary>Deja el bloque como dicen los manifiestos. Fuera de un repo no hace nada.</summary>
    public static void Sync(ProjectRoot project)
    {
        if (project.ExcludeFile is not { } path) return;

        var entries = Entries(project);
        var text = File.Exists(path) ? File.ReadAllText(path).Replace("\r\n", "\n") : "";
        var lines = text.Length == 0 ? [] : text.TrimEnd('\n').Split('\n').ToList();

        var start = lines.IndexOf(Begin);
        var end = lines.IndexOf(End);
        if (start >= 0 && end > start) lines.RemoveRange(start, end - start + 1);
        else start = lines.Count;

        if (entries.Count > 0)
            lines.InsertRange(Math.Min(start, lines.Count), [Begin, .. entries, End]);

        var updated = lines.Count == 0 ? "" : string.Join('\n', lines) + "\n";
        if (updated == text) return;

        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        File.WriteAllText(path, updated);
    }
}
