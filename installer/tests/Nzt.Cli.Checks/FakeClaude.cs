using System.Text.Json;
using Nzt.Cli.Mods;

namespace Nzt.Cli.Checks;

/// <summary>
/// Un Claude Code de mentira, con estado: responde a los mismos comandos que el
/// real y con la misma forma de JSON (leída de Claude Code 2.1.301). Ningún caso
/// toca los plugins reales de la máquina.
/// </summary>
public sealed class FakeClaude : ICommandRunner
{
    /// <summary>Lo que imprime `claude --version`; `null` es que no hay comando claude.</summary>
    public string? VersionOutput { get; set; } = "2.1.301 (Claude Code)";

    /// <summary>Marketplace por nombre, con su fuente.</summary>
    public Dictionary<string, string> Marketplaces { get; } = [];

    /// <summary>Mod del marketplace nzt instalado para toda la máquina, con su versión.</summary>
    public Dictionary<string, string> Installed { get; } = [];

    /// <summary>La versión que queda al instalar o actualizar un mod; sin entrada, 1.0.0.</summary>
    public Dictionary<string, string> Latest { get; } = [];

    public HashSet<string> Failing { get; } = [];

    public List<string> Calls { get; } = [];

    public IEnumerable<string> Changes => Calls.Where(c =>
        c.StartsWith("plugin install", StringComparison.Ordinal)
        || c.StartsWith("plugin update", StringComparison.Ordinal)
        || c.StartsWith("plugin uninstall", StringComparison.Ordinal)
        || c.StartsWith("plugin marketplace add", StringComparison.Ordinal)
        || c.StartsWith("plugin marketplace remove", StringComparison.Ordinal));

    public CommandResult? Run(string executable, IReadOnlyList<string> arguments)
    {
        if (VersionOutput is null) return null;

        var line = string.Join(' ', arguments);
        Calls.Add(line);

        return arguments switch
        {
            ["--version"] => Ok(VersionOutput),
            ["plugin", "marketplace", "list", "--json"] => Ok(JsonSerializer.Serialize(
                Marketplaces.Select(m => new { name = m.Key, source = "github", repo = m.Value }))),
            ["plugin", "list", "--json"] => Ok(JsonSerializer.Serialize(
                Installed.Select(p => new { id = $"{p.Key}@nzt", version = p.Value, scope = "user", enabled = true }))),
            ["plugin", "marketplace", "add", var source] => Add(source),
            ["plugin", "marketplace", "update", _] => Ok(""),
            ["plugin", "install", var id, ..] => Change(id, mod => Installed[mod] = Latest.GetValueOrDefault(mod, "1.0.0")),
            ["plugin", "update", var id, ..] => Change(id, mod => Installed[mod] = Latest.GetValueOrDefault(mod, Installed[mod])),
            ["plugin", "uninstall", var id, ..] => Change(id, mod => Installed.Remove(mod)),
            _ => new CommandResult(1, "", $"comando no esperado: {line}")
        };
    }

    private CommandResult Add(string source)
    {
        Marketplaces["nzt"] = source;
        return Ok("");
    }

    private CommandResult Change(string id, Action<string> apply)
    {
        var mod = id.Split('@')[0];
        if (Failing.Contains(mod)) return new CommandResult(1, "", $"falla de prueba en {mod}");
        apply(mod);
        return Ok("{\"ok\":true}");
    }

    private static CommandResult Ok(string output) => new(0, output, "");
}
