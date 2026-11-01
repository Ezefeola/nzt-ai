using System.Text.Json;
using Nzt.Cli.Providers;

namespace Nzt.Cli.Install;

/// <summary>
/// Los proyectos donde instaló este CLI (RN-proy-registro), en `projects.json`
/// junto a los manifiestos de usuario. Es un índice, no la verdad: la verdad es
/// el manifiesto de cada proyecto, así que una entrada sin él, o cuya carpeta ya
/// no existe, se descarta al leer.
/// </summary>
public static class ProjectRegistry
{
    private static readonly JsonSerializerOptions Options = new() { WriteIndented = true };

    public static string PathFor(string? manifestDirectory) =>
        Path.Combine(manifestDirectory ?? Manifest.DirectoryPath, "projects.json");

    public static IReadOnlyList<ProjectRoot> Load(string? manifestDirectory)
    {
        var path = PathFor(manifestDirectory);
        if (!File.Exists(path)) return [];

        List<string>? stored;
        try { stored = JsonSerializer.Deserialize<List<string>>(File.ReadAllText(path), Options); }
        catch (JsonException) { return []; }

        return (stored ?? [])
            .Where(HasNzt)
            .Select(ProjectRoot.Find)
            .ToList();
    }

    /// <summary>Lo anota si tiene NZT y lo saca si ya no. Se llama después de escribir.</summary>
    public static void Sync(ProjectRoot project, string? manifestDirectory)
    {
        var paths = Load(manifestDirectory).Select(p => p.Path)
            .Where(p => !ProjectRoot.SamePath(p, project.Path))
            .ToList();
        if (HasNzt(project.Path)) paths.Add(project.Path);

        var path = PathFor(manifestDirectory);
        if (paths.Count == 0)
        {
            if (File.Exists(path)) File.Delete(path);
            return;
        }

        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        File.WriteAllText(path, JsonSerializer.Serialize(paths.OrderBy(p => p, StringComparer.Ordinal), Options));
    }

    public static bool HasNzt(string projectPath) =>
        Directory.Exists(projectPath)
        && Provider.Ids.Any(id => File.Exists(Manifest.PathFor(id, Path.Combine(projectPath, ".nzt", "manifests"))));
}
