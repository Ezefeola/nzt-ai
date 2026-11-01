using System.Reflection;
using System.Runtime.InteropServices;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Nzt.Cli.Content;

/// <summary>
/// Un servidor MCP que un pack habilita en el proyecto. Es remoto (`Url`) o local
/// (`Command` por plataforma, con `{home}` resuelto al instalar).
/// </summary>
public sealed record McpServer
{
    [JsonPropertyName("name")] public required string Name { get; init; }
    [JsonPropertyName("url")] public string? Url { get; init; }
    [JsonPropertyName("command")] public Dictionary<string, string>? Command { get; init; }
    [JsonPropertyName("args")] public List<string>? Args { get; init; }

    /// <summary>El comando de esta máquina, o `null` si el pack no trae uno para ella.</summary>
    public string? CommandFor(string home, string? platform = null)
    {
        if (Command is null) return null;
        return Command.TryGetValue(platform ?? CurrentPlatform, out var template)
            ? template.Replace("{home}", home)
            : null;
    }

    public static string CurrentPlatform =>
        OperatingSystem.IsWindows() ? "windows"
        : OperatingSystem.IsMacOS() ? (RuntimeInformation.OSArchitecture == Architecture.Arm64 ? "macos-arm64" : "macos-x64")
        : "linux";
}

/// <summary>
/// Un pack: lo que se instala por proyecto cuando el documento técnico lo elige.
/// Trae a lo sumo una skill (`nzt-<pack>`, con sus referencias) y los MCP que
/// necesita. `Requires` son otros packs que se instalan con él.
/// </summary>
public sealed record Pack
{
    public required string Name { get; init; }
    public required string Description { get; init; }
    public IReadOnlyList<string> Requires { get; init; } = [];
    public IReadOnlyList<McpServer> Mcp { get; init; } = [];
    public SkillFile? Skill { get; init; }

    public string SkillName => $"nzt-{Name}";
}

/// <summary>
/// Los packs embebidos en el ejecutable, leídos de `content/packs/<pack>/`:
/// `pack.json`, `SKILL.md` y `references/*.md`.
/// </summary>
public sealed class PackCatalog
{
    private static readonly JsonSerializerOptions Options = new() { PropertyNameCaseInsensitive = true };

    public IReadOnlyList<Pack> Packs { get; }

    private PackCatalog(IEnumerable<Pack> packs) =>
        Packs = [.. packs.OrderBy(p => p.Name, StringComparer.Ordinal)];

    public static PackCatalog From(IEnumerable<Pack> packs) => new(packs);

    public Pack? ByName(string name) =>
        Packs.FirstOrDefault(p => string.Equals(p.Name, name, StringComparison.OrdinalIgnoreCase));

    /// <summary>
    /// Los packs pedidos más todo lo que requieren, en orden de dependencia. Un
    /// nombre desconocido se devuelve en `Unknown` y no corta el resto.
    /// </summary>
    public (IReadOnlyList<Pack> Packs, IReadOnlyList<string> Unknown) Resolve(IEnumerable<string> names)
    {
        var ordered = new List<Pack>();
        var unknown = new List<string>();
        var visiting = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        void Visit(string name)
        {
            var pack = ByName(name);
            if (pack is null) { if (!unknown.Contains(name)) unknown.Add(name); return; }
            if (ordered.Contains(pack) || !visiting.Add(pack.Name)) return;
            foreach (var required in pack.Requires) Visit(required);
            ordered.Add(pack);
        }

        foreach (var name in names) Visit(name);
        return (ordered, unknown);
    }

    public static PackCatalog Load()
    {
        var assembly = Assembly.GetExecutingAssembly();
        var files = new Dictionary<string, Dictionary<string, string>>(StringComparer.Ordinal);

        foreach (var resource in assembly.GetManifestResourceNames())
        {
            var path = resource.Replace('\\', '/');
            if (!path.StartsWith("content/packs/", StringComparison.Ordinal)) continue;

            var relative = path["content/packs/".Length..];
            var slash = relative.IndexOf('/');
            if (slash <= 0) continue;

            using var stream = assembly.GetManifestResourceStream(resource);
            if (stream is null) continue;
            using var reader = new StreamReader(stream);

            var pack = relative[..slash];
            if (!files.TryGetValue(pack, out var contents)) files[pack] = contents = new(StringComparer.Ordinal);
            contents[relative[(slash + 1)..]] = reader.ReadToEnd();
        }

        return new PackCatalog(files.Select(entry => Parse(entry.Key, entry.Value)));
    }

    /// <summary>Un pack a partir de sus archivos, con la ruta relativa a su carpeta.</summary>
    public static Pack Parse(string name, IReadOnlyDictionary<string, string> files)
    {
        if (!files.TryGetValue("pack.json", out var json))
            throw new InvalidOperationException($"packs/{name}/ no tiene pack.json.");

        var definition = JsonSerializer.Deserialize<Definition>(json, Options)
                         ?? throw new InvalidOperationException($"packs/{name}/pack.json está vacío.");

        SkillFile? skill = null;
        if (files.TryGetValue("SKILL.md", out var text))
            skill = new SkillFile($"nzt-{name}", $"packs/{name}", text)
            {
                References = [.. files
                    .Where(f => f.Key.StartsWith("references/", StringComparison.Ordinal))
                    .Select(f => new ReferenceFile(f.Key["references/".Length..], f.Value))
                    .OrderBy(r => r.FileName, StringComparer.Ordinal)]
            };

        return new Pack
        {
            Name = name,
            Description = definition.Description ?? "",
            Requires = definition.Requires ?? [],
            Mcp = definition.Mcp ?? [],
            Skill = skill
        };
    }

    private sealed record Definition(
        [property: JsonPropertyName("description")] string? Description,
        [property: JsonPropertyName("requires")] List<string>? Requires,
        [property: JsonPropertyName("mcp")] List<McpServer>? Mcp);
}
