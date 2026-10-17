using System.Text.Json;
using System.Text.RegularExpressions;

namespace Nzt.Cli.Mods;

public sealed record ClaudeAvailability(bool Usable, string? Version, string? Problem);

public sealed record MarketplaceInfo(string Name, string Source);

public sealed record InstalledPlugin(string Id, string Version);

/// <summary>
/// Los comandos de Claude Code que usa el instalador, los mismos que correría el
/// usuario: `claude plugin …` desde la terminal, sin abrir una sesión. Formatos
/// leídos de Claude Code 2.1.301 (`--help` y `--json` de cada comando).
/// </summary>
public sealed partial class ClaudePlugins
{
    public const string Executable = "claude";

    /// <summary>La primera versión que corre mods en la terminal.</summary>
    public static readonly Version MinimumVersion = new(2, 1, 287);

    private const string UserScope = "user";

    private readonly ICommandRunner _runner;

    public ClaudePlugins(ICommandRunner runner)
    {
        _runner = runner;
    }

    public ClaudeAvailability Probe()
    {
        var result = _runner.Run(Executable, ["--version"]);
        if (result is null)
            return new ClaudeAvailability(false, null, "no se encontró el comando claude en esta terminal");

        var match = VersionPattern().Match(result.Output);
        if (!result.Ok || !match.Success || !Version.TryParse(match.Value, out var version))
            return new ClaudeAvailability(false, null, "claude --version no devolvió una versión");

        return version < MinimumVersion
            ? new ClaudeAvailability(false, match.Value,
                $"Claude Code {match.Value} no corre mods; hace falta {MinimumVersion} o posterior")
            : new ClaudeAvailability(true, match.Value, null);
    }

    /// <summary>`null` si no se pudo leer la lista.</summary>
    public IReadOnlyList<MarketplaceInfo>? Marketplaces()
    {
        var result = _runner.Run(Executable, ["plugin", "marketplace", "list", "--json"]);
        if (result is not { Ok: true }) return null;

        return ParseArray(result.Output, item => new MarketplaceInfo(
            Text(item, "name") ?? "",
            Text(item, "repo") ?? Text(item, "url") ?? Text(item, "path") ?? Text(item, "source") ?? "?"));
    }

    /// <summary>Los plugins instalados para toda la máquina. `null` si no se pudo leer la lista.</summary>
    public IReadOnlyList<InstalledPlugin>? Installed()
    {
        var result = _runner.Run(Executable, ["plugin", "list", "--json"]);
        if (result is not { Ok: true }) return null;

        return ParseArray(result.Output, item => Text(item, "scope") == UserScope
                ? new InstalledPlugin(Text(item, "id") ?? "", Text(item, "version") ?? "?")
                : null);
    }

    public CommandResult AddMarketplace(string source) =>
        Run(["plugin", "marketplace", "add", source]);

    public CommandResult RefreshMarketplace(string name) =>
        Run(["plugin", "marketplace", "update", name]);

    public CommandResult Install(string id) =>
        Run(["plugin", "install", id, "--scope", UserScope, "--json"]);

    public CommandResult Update(string id) =>
        Run(["plugin", "update", id, "--scope", UserScope, "--json"]);

    public CommandResult Uninstall(string id) =>
        Run(["plugin", "uninstall", id, "--scope", UserScope, "--json"]);

    private CommandResult Run(string[] arguments) =>
        _runner.Run(Executable, arguments)
        ?? new CommandResult(-1, "", "no se encontró el comando claude en esta terminal");

    private static List<T>? ParseArray<T>(string json, Func<JsonElement, T?> map) where T : class
    {
        try
        {
            using var document = JsonDocument.Parse(json);
            if (document.RootElement.ValueKind != JsonValueKind.Array) return null;

            var items = new List<T>();
            foreach (var element in document.RootElement.EnumerateArray())
                if (map(element) is { } item) items.Add(item);
            return items;
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static string? Text(JsonElement element, string property) =>
        element.TryGetProperty(property, out var value) && value.ValueKind == JsonValueKind.String
            ? value.GetString()
            : null;

    [GeneratedRegex(@"\d+\.\d+\.\d+")]
    private static partial Regex VersionPattern();
}
