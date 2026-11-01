using Nzt.Cli.Providers;

namespace Nzt.Cli.Project;

public enum McpFormat { ClaudeJson, CodexToml }

/// <summary>
/// Dónde deja un proveedor lo que es de un proyecto, relativo a su raíz: las skills
/// de los packs, el archivo donde se habilitan sus MCP y el registro de `nzt-ai`
/// (<see cref="ProjectFile"/>), al lado de las skills que describe. Lo global de
/// NZT —kernel y skills del marco— sigue en la carpeta de usuario (<see cref="Provider"/>).
/// </summary>
public sealed record ProjectTarget(string ProviderId, string DisplayName, string SkillsDirectory,
    string McpFile, McpFormat McpFormat, string RecordFile)
{
    // Claude Code: skills de proyecto en .claude/skills y MCP de proyecto en .mcp.json.
    public static ProjectTarget ClaudeCode { get; } = new(Provider.ClaudeCodeId, "Claude Code",
        ".claude/skills", ".mcp.json", McpFormat.ClaudeJson, ".claude/nzt.json");

    // Codex: skills de repositorio en .agents/skills y MCP en .codex/config.toml,
    // que Codex lee solo si el proyecto es de confianza.
    public static ProjectTarget Codex { get; } = new("codex", "Codex",
        ".agents/skills", ".codex/config.toml", McpFormat.CodexToml, ".agents/nzt.json");

    public static IReadOnlyList<ProjectTarget> All => [ClaudeCode, Codex];

    public static ProjectTarget? ById(string id) =>
        All.FirstOrDefault(t => string.Equals(t.ProviderId, id, StringComparison.OrdinalIgnoreCase));
}
