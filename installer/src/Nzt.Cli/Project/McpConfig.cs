using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using Nzt.Cli.Content;

namespace Nzt.Cli.Project;

public enum McpAction { Added, Unchanged, Removed, KeptUsers, Unsupported }

public sealed record McpOutcome(string Name, McpAction Action);

/// <summary>
/// El archivo de MCP de un proveedor, editado sin pisar lo del usuario: se agregan
/// y se sacan solo los servidores que anotó `nzt-ai`. Uno con el mismo nombre que
/// ya estaba es del usuario, y se queda como está.
/// </summary>
public static class McpConfig
{
    public const string TomlBegin = "# nzt:start — lo administra nzt-ai project; no edites adentro";
    public const string TomlEnd = "# nzt:end";

    /// <summary>
    /// Aplica `desired` sobre el contenido actual (`null` si no existe). Devuelve el
    /// contenido nuevo (`null` si el archivo tiene que dejar de existir), qué pasó
    /// con cada servidor y cuáles quedan siendo de NZT.
    /// </summary>
    public static (string? Content, IReadOnlyList<McpOutcome> Outcomes, List<string> Owned) Apply(
        McpFormat format, string? current, IReadOnlyList<McpServer> desired, IReadOnlyList<string> owned,
        string home, string? platform = null) => format switch
    {
        McpFormat.ClaudeJson => ApplyJson(current, desired, owned, home, platform),
        _ => ApplyToml(current, desired, owned, home, platform)
    };

    // ── Claude Code: .mcp.json ───────────────────────────────────────────────────

    private static (string?, IReadOnlyList<McpOutcome>, List<string>) ApplyJson(string? current,
        IReadOnlyList<McpServer> desired, IReadOnlyList<string> owned, string home, string? platform)
    {
        var root = (string.IsNullOrWhiteSpace(current) ? null : JsonNode.Parse(current) as JsonObject)
                   ?? new JsonObject();
        if (root["mcpServers"] is not JsonObject servers)
            root["mcpServers"] = servers = new JsonObject();

        var outcomes = new List<McpOutcome>();
        var stillOwned = new List<string>();

        foreach (var server in desired)
        {
            var entry = JsonEntry(server, home, platform);
            if (entry is null) { outcomes.Add(new McpOutcome(server.Name, McpAction.Unsupported)); continue; }

            var ours = owned.Contains(server.Name, StringComparer.Ordinal);
            if (servers.ContainsKey(server.Name) && !ours)
            {
                outcomes.Add(new McpOutcome(server.Name, McpAction.KeptUsers));
                continue;
            }

            var same = servers[server.Name] is { } node && JsonNode.DeepEquals(node, entry);
            if (!same) servers[server.Name] = entry;
            outcomes.Add(new McpOutcome(server.Name, same ? McpAction.Unchanged : McpAction.Added));
            stillOwned.Add(server.Name);
        }

        foreach (var name in owned.Where(n => desired.All(d => d.Name != n)))
        {
            if (servers.Remove(name)) outcomes.Add(new McpOutcome(name, McpAction.Removed));
        }

        if (servers.Count == 0 && root.Count == 1)
            return (null, outcomes, stillOwned);

        var text = root.ToJsonString(new JsonSerializerOptions { WriteIndented = true }) + "\n";
        return (text, outcomes, stillOwned);
    }

    private static JsonObject? JsonEntry(McpServer server, string home, string? platform)
    {
        if (server.Url is { } url) return new JsonObject { ["type"] = "http", ["url"] = url };

        var command = server.CommandFor(home, platform);
        if (command is null) return null;

        var entry = new JsonObject { ["type"] = "stdio", ["command"] = command };
        if (server.Args is { Count: > 0 } args)
            entry["args"] = new JsonArray([.. args.Select(a => (JsonNode)JsonValue.Create(a)!)]);
        return entry;
    }

    // ── Codex: .codex/config.toml ────────────────────────────────────────────────
    // Sin parser TOML: los servidores de NZT viven en un bloque delimitado, y uno
    // del usuario se reconoce por su tabla `[mcp_servers.<nombre>]` fuera de él.

    private static (string?, IReadOnlyList<McpOutcome>, List<string>) ApplyToml(string? current,
        IReadOnlyList<McpServer> desired, IReadOnlyList<string> owned, string home, string? platform)
    {
        var text = (current ?? "").Replace("\r\n", "\n");
        var (outside, block) = SplitBlock(text);

        var outcomes = new List<McpOutcome>();
        var stillOwned = new List<string>();
        var body = new StringBuilder();

        foreach (var server in desired)
        {
            var table = TomlTable(server, home, platform);
            if (table is null) { outcomes.Add(new McpOutcome(server.Name, McpAction.Unsupported)); continue; }

            if (outside.Contains($"[mcp_servers.{server.Name}]", StringComparison.Ordinal))
            {
                outcomes.Add(new McpOutcome(server.Name, McpAction.KeptUsers));
                continue;
            }

            var same = block.Contains(table, StringComparison.Ordinal);
            outcomes.Add(new McpOutcome(server.Name, same ? McpAction.Unchanged : McpAction.Added));
            stillOwned.Add(server.Name);
            body.Append(table).Append('\n');
        }

        foreach (var name in owned.Where(n => !stillOwned.Contains(n)
                                               && outcomes.All(o => o.Name != n)))
            outcomes.Add(new McpOutcome(name, McpAction.Removed));

        var rest = outside.Trim('\n');
        if (stillOwned.Count == 0)
            return (rest.Length == 0 ? null : rest + "\n", outcomes, stillOwned);

        var newBlock = $"{TomlBegin}\n{body.ToString().TrimEnd('\n')}\n{TomlEnd}\n";
        return (rest.Length == 0 ? newBlock : $"{rest}\n\n{newBlock}", outcomes, stillOwned);
    }

    private static (string Outside, string Block) SplitBlock(string text)
    {
        var start = text.IndexOf(TomlBegin, StringComparison.Ordinal);
        var end = start < 0 ? -1 : text.IndexOf(TomlEnd, start, StringComparison.Ordinal);
        if (start < 0 || end < 0) return (text, "");

        var after = end + TomlEnd.Length;
        return (text[..start] + text[after..], text[start..after]);
    }

    private static string? TomlTable(McpServer server, string home, string? platform)
    {
        var lines = new StringBuilder($"[mcp_servers.{server.Name}]\n");

        if (server.Url is { } url)
            lines.Append($"url = {Quote(url)}\n");
        else if (server.CommandFor(home, platform) is { } command)
        {
            lines.Append($"command = {Quote(command)}\n");
            if (server.Args is { Count: > 0 } args)
                lines.Append($"args = [{string.Join(", ", args.Select(Quote))}]\n");
        }
        else return null;

        return lines.ToString();
    }

    private static string Quote(string value) =>
        "\"" + value.Replace("\\", "\\\\").Replace("\"", "\\\"") + "\"";
}
