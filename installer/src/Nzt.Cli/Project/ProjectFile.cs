using System.Text.Json;
using System.Text.Json.Serialization;

namespace Nzt.Cli.Project;

public sealed record ProjectEntry(
    [property: JsonPropertyName("path")] string Path,
    [property: JsonPropertyName("sha256")] string Sha256);

/// <summary>
/// `.nzt/project.json`: qué packs eligió el proyecto, para qué proveedores, y lo
/// que `nzt-ai` escribió por ellos. Se versiona con el repo: las rutas son
/// relativas a la raíz, así `project sync` reproduce lo mismo en otra máquina.
/// </summary>
public sealed record ProjectFile
{
    public const string RelativePath = ".nzt/project.json";

    [JsonPropertyName("nztVersion")] public required string Version { get; init; }

    /// <summary>Los packs que se pidieron. Los que requieren se resuelven al instalar.</summary>
    [JsonPropertyName("packs")] public required List<string> Packs { get; init; }

    [JsonPropertyName("providers")] public required List<string> Providers { get; init; }
    [JsonPropertyName("files")] public required List<ProjectEntry> Files { get; init; }

    /// <summary>Los MCP que agregó `nzt-ai`, por proveedor. Uno que no está acá es del usuario.</summary>
    [JsonPropertyName("mcp")] public required Dictionary<string, List<string>> Mcp { get; init; }

    private static readonly JsonSerializerOptions Options = new() { WriteIndented = true };

    public static string PathIn(string projectDirectory) =>
        System.IO.Path.Combine(projectDirectory, ".nzt", "project.json");

    public static ProjectFile? Load(string projectDirectory)
    {
        var path = PathIn(projectDirectory);
        if (!File.Exists(path)) return null;
        try
        {
            return JsonSerializer.Deserialize<ProjectFile>(File.ReadAllText(path), Options);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    public void Save(string projectDirectory)
    {
        var path = PathIn(projectDirectory);
        Directory.CreateDirectory(System.IO.Path.GetDirectoryName(path)!);
        File.WriteAllText(path, JsonSerializer.Serialize(this, Options) + "\n");
    }

    public static void Delete(string projectDirectory)
    {
        var path = PathIn(projectDirectory);
        if (File.Exists(path)) File.Delete(path);
        var folder = System.IO.Path.GetDirectoryName(path)!;
        if (Directory.Exists(folder) && !Directory.EnumerateFileSystemEntries(folder).Any())
            Directory.Delete(folder);
    }

    public string? HashOf(string relativePath) =>
        Files.FirstOrDefault(f => string.Equals(f.Path, relativePath, StringComparison.OrdinalIgnoreCase))?.Sha256;

    public IReadOnlyList<string> McpOf(string providerId) =>
        Mcp.TryGetValue(providerId, out var names) ? names : [];
}
