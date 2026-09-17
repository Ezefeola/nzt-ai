namespace Nzt.Cli.Providers;

/// <summary>
/// Un destino de instalación. NZT instala global (nivel usuario) en los dos
/// proveedores que tienen adapter: el archivo de instrucciones que el proveedor
/// lee siempre, y la carpeta plana de skills.
/// </summary>
public sealed class Provider
{
    public required string Id { get; init; }
    public required string DisplayName { get; init; }

    /// <summary>El archivo que el proveedor carga en toda sesión. NZT escribe un bloque adentro.</summary>
    public required string InstructionsFile { get; init; }

    public required string SkillsDirectory { get; init; }

    /// <summary>El adapter que se concatena al kernel para este proveedor.</summary>
    public required string AdapterFile { get; init; }

    public required string Usage { get; init; }

    /// <summary>Aviso antes de escribir, cuando la ruta global no es certera.</summary>
    public string? PathWarning { get; init; }

    public static IReadOnlyList<Provider> All => [ClaudeCode(), Codex()];

    public static Provider? ById(string id) =>
        All.FirstOrDefault(p => string.Equals(p.Id, id, StringComparison.OrdinalIgnoreCase));

    private static string Home =>
        Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);

    // ── Claude Code ────────────────────────────────────────────────────────────
    // Global de usuario: ~/.claude/CLAUDE.md y ~/.claude/skills/<nombre>/SKILL.md.
    // Sin plugin y sin subagente: el CLAUDE.md de usuario se carga en todo
    // proyecto, y las skills sueltas en ~/.claude/skills son el mecanismo
    // documentado para el alcance personal.
    public static Provider ClaudeCode(string? homeDirectory = null)
    {
        var root = Path.Combine(homeDirectory ?? Home, ".claude");
        return new Provider
        {
            Id = "claude-code",
            DisplayName = "Claude Code",
            InstructionsFile = Path.Combine(root, "CLAUDE.md"),
            SkillsDirectory = Path.Combine(root, "skills"),
            AdapterFile = "adapter-claude.md",
            Usage = "Abrí claude en cualquier proyecto: el CLAUDE.md de usuario se carga solo."
        };
    }

    // ── Codex ──────────────────────────────────────────────────────────────────
    // Las instrucciones van en $CODEX_HOME/AGENTS.md (por defecto ~/.codex), y
    // las skills NO van ahí: el scope de usuario documentado es ~/.agents/skills.
    // Cambiar CODEX_HOME mueve las instrucciones, no las skills.
    public static Provider Codex(string? homeDirectory = null, string? codexHome = null)
    {
        var home = homeDirectory ?? Home;
        var configured = codexHome ?? Environment.GetEnvironmentVariable("CODEX_HOME");
        var root = string.IsNullOrWhiteSpace(configured)
            ? Path.Combine(home, ".codex")
            : Path.GetFullPath(configured);

        var skills = Path.Combine(home, ".agents", "skills");
        var legacy = Path.Combine(root, "skills");

        return new Provider
        {
            Id = "codex",
            DisplayName = "Codex",
            InstructionsFile = Path.Combine(root, "AGENTS.md"),
            SkillsDirectory = skills,
            AdapterFile = "adapter-codex.md",
            Usage = "Iniciá codex: el hilo principal carga NZT desde el AGENTS.md global.",
            // Hay guías de terceros que ubican las skills en ~/.codex/skills. Si esa
            // carpeta existe en la máquina, el usuario tiene que saber cuál elegimos.
            PathWarning = Directory.Exists(legacy)
                ? $"Existe {legacy}, que algunas guías usan para skills. NZT instala en la ruta "
                  + $"documentada, {skills}. Si Codex no las ve, ese es el primer lugar a mirar."
                : null
        };
    }
}
