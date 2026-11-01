using System.Text.Json;
using System.Text.Json.Serialization;

namespace Nzt.Cli.Project;

public sealed record ProjectEntry(
    [property: JsonPropertyName("path")] string Path,
    [property: JsonPropertyName("sha256")] string Sha256);

/// <summary>
/// El registro de `nzt-ai` en un proyecto: qué packs eligió, para qué proveedores, y
/// lo que `nzt-ai` escribió por ellos. Vive en la carpeta de cada proveedor elegido
/// (`.claude/nzt.json`, `.agents/nzt.json`), el mismo en cada una. Se versiona con el
/// repo: las rutas son relativas a la raíz, así `project sync` reproduce lo mismo en
/// otra máquina. Uno viejo en `.nzt/project.json` se lee, y el próximo guardado lo mueve.
/// </summary>
public sealed record ProjectFile
{
    public const string LegacyPath = ".nzt/project.json";

    /// <summary>Dónde se busca, para los mensajes: los de cada proveedor.</summary>
    public static string Locations => string.Join(" o ", ProjectTarget.All.Select(t => t.RecordFile));

    [JsonPropertyName("nztVersion")] public required string Version { get; init; }

    /// <summary>Los packs que se pidieron. Los que requieren se resuelven al instalar.</summary>
    [JsonPropertyName("packs")] public required List<string> Packs { get; init; }

    [JsonPropertyName("providers")] public required List<string> Providers { get; init; }
    [JsonPropertyName("files")] public required List<ProjectEntry> Files { get; init; }

    /// <summary>Los MCP que agregó `nzt-ai`, por proveedor. Uno que no está acá es del usuario.</summary>
    [JsonPropertyName("mcp")] public required Dictionary<string, List<string>> Mcp { get; init; }

    private static readonly JsonSerializerOptions Options = new() { WriteIndented = true };

    /// <summary>Todas las rutas posibles, en el orden en que se leen: las de cada proveedor y la vieja.</summary>
    private static IEnumerable<string> Candidates =>
        [.. ProjectTarget.All.Select(t => t.RecordFile), LegacyPath];

    private static string Full(string projectDirectory, string relativePath) =>
        System.IO.Path.Combine(projectDirectory, relativePath.Replace('/', System.IO.Path.DirectorySeparatorChar));

    public static ProjectFile? Load(string projectDirectory)
    {
        foreach (var relative in Candidates)
        {
            var path = Full(projectDirectory, relative);
            if (!File.Exists(path)) continue;
            try
            {
                if (JsonSerializer.Deserialize<ProjectFile>(File.ReadAllText(path), Options) is { } project)
                    return project;
            }
            catch (JsonException)
            {
                // Roto: se prueba el siguiente.
            }
        }
        return null;
    }

    /// <summary>
    /// Lo escribe en la carpeta de cada proveedor del registro y lo saca de las demás,
    /// la vieja incluida.
    /// </summary>
    public void Save(string projectDirectory)
    {
        var text = JsonSerializer.Serialize(this, Options) + "\n";
        var wanted = ProjectTarget.All
            .Where(t => Providers.Contains(t.ProviderId, StringComparer.OrdinalIgnoreCase))
            .Select(t => t.RecordFile)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        foreach (var relative in Candidates)
        {
            var path = Full(projectDirectory, relative);
            if (wanted.Contains(relative))
            {
                Directory.CreateDirectory(System.IO.Path.GetDirectoryName(path)!);
                File.WriteAllText(path, text);
            }
            else
            {
                Remove(path);
            }
        }
    }

    public static void Delete(string projectDirectory)
    {
        foreach (var relative in Candidates)
            Remove(Full(projectDirectory, relative));
    }

    /// <summary>Borra el archivo y su carpeta si quedó vacía (`.claude/`, `.agents/`, `.nzt/`).</summary>
    private static void Remove(string path)
    {
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
