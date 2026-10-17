using System.Reflection;
using System.Text.Json;

namespace Nzt.Cli.Mods;

/// <summary>
/// Los mods de NZT, leídos del marketplace del repo embebido en el ejecutable:
/// la misma lista que ve quien los instala a mano, sin una segunda copia que
/// mantener en el código.
/// </summary>
public sealed class ModCatalog
{
    /// <summary>El nombre que declara `.claude-plugin/marketplace.json`; un mod es `&lt;mod&gt;@nzt`.</summary>
    public const string MarketplaceName = "nzt";

    /// <summary>De donde se agrega el marketplace si no está: el repo publicado, su rama por defecto.</summary>
    public const string MarketplaceSource = "Ezefeola/nzt-ai";

    private const string ResourceName = "content/marketplace.json";

    public IReadOnlyList<string> Names { get; }

    private ModCatalog(List<string> names)
    {
        Names = names;
    }

    public static ModCatalog From(IEnumerable<string> names) => new([.. names]);

    public static ModCatalog Load()
    {
        using var stream = Assembly.GetExecutingAssembly().GetManifestResourceStream(ResourceName)
            ?? throw new InvalidOperationException($"Falta '{ResourceName}' en el contenido embebido.");
        return Parse(new StreamReader(stream).ReadToEnd());
    }

    public static ModCatalog Parse(string marketplaceJson)
    {
        using var document = JsonDocument.Parse(marketplaceJson);
        var names = new List<string>();

        if (document.RootElement.TryGetProperty("plugins", out var plugins))
            foreach (var plugin in plugins.EnumerateArray())
                if (plugin.TryGetProperty("name", out var name) && name.GetString() is { Length: > 0 } value)
                    names.Add(value);

        return new ModCatalog(names);
    }

    public static string IdOf(string name) => $"{name}@{MarketplaceName}";

    /// <summary>Lo que se escribe en una sesión de Claude Code para instalar uno a mano.</summary>
    public static string ManualCommand(string name) =>
        $"/plugin install {name} --marketplace {MarketplaceSource}";
}
