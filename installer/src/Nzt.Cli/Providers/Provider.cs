using Nzt.Cli.Install;

namespace Nzt.Cli.Providers;

/// <summary>Dónde se instala: el de siempre, para toda la máquina, o un proyecto (sección 13).</summary>
public enum Scope { User, Project }

/// <summary>
/// Un destino de instalación. NZT instala en los dos proveedores que tienen
/// adapter: el archivo de instrucciones que el proveedor lee siempre, y la
/// carpeta plana de skills. Global (nivel usuario) por defecto, o en un proyecto.
/// </summary>
public sealed class Provider
{
    /// <summary>El único proveedor con mods.</summary>
    public const string ClaudeCodeId = "claude-code";

    public required string Id { get; init; }
    public required string DisplayName { get; init; }

    /// <summary>El archivo que el proveedor carga en toda sesión. NZT escribe un bloque adentro.</summary>
    public required string InstructionsFile { get; init; }

    public required string SkillsDirectory { get; init; }

    /// <summary>Donde el proveedor busca los subagentes de usuario (D71).</summary>
    public required string AgentsDirectory { get; init; }

    /// <summary>Qué archivos de `agents/` son de este proveedor: su formato sale de la extensión.</summary>
    public required string AgentExtension { get; init; }

    /// <summary>El adapter que se concatena al kernel para este proveedor.</summary>
    public required string AdapterFile { get; init; }

    public required string Usage { get; init; }

    /// <summary>Aviso antes de escribir, cuando la ruta global no es certera.</summary>
    public string? PathWarning { get; init; }

    public Scope Scope { get; init; } = Scope.User;

    /// <summary>El proyecto, solo con alcance de proyecto.</summary>
    public ProjectRoot? Project { get; init; }

    /// <summary>*Solo para mí* (RN-proy-modos). Solo con alcance de proyecto y dentro de un repo.</summary>
    public bool Personal { get; init; }

    /// <summary>
    /// Dónde va su manifiesto cuando no es el de usuario: en el proyecto, con rutas
    /// relativas a la raíz (RN-proy-manifiesto). `null` es el de usuario.
    /// </summary>
    public string? ManifestDirectory => Project?.Combine(".nzt", "manifests");

    /// <summary>Dónde va el backup del archivo de instrucciones; `null` es al lado (RN-proy-backup).</summary>
    public string? BackupDirectory => Project?.Combine(".nzt", "backup");

    /// <summary>
    /// Lo que sigue al bloque cuando el archivo de instrucciones se crea: el
    /// `@AGENTS.md` que evita que Claude Code deje de leer el del repo (RN-proy-agents-md).
    /// </summary>
    public string? CreatedSuffix { get; init; }

    /// <summary>Lo que el reporte dice del `AGENTS.md` del repo antes de escribir.</summary>
    public string? AgentsWarning { get; init; }

    /// <summary>"global" o "proyecto, solo para mí": cómo lo nombran el reporte y el estado.</summary>
    public string ScopeLabel => Scope == Scope.User ? "global"
        : Project!.IsGitRepo ? (Personal ? "proyecto, solo para mí" : "proyecto, compartido")
        : "proyecto";

    public static IReadOnlyList<Provider> All => [ClaudeCode(), Codex()];

    public const string CodexId = "codex";

    public static IReadOnlyList<string> Ids => [ClaudeCodeId, CodexId];

    /// <summary>Los dos proveedores en un proyecto. Fuera de un repo no hay modo: no hay qué excluir.</summary>
    public static IReadOnlyList<Provider> AllIn(ProjectRoot project, bool personal) =>
        [ClaudeCodeIn(project, personal), CodexIn(project, personal)];

    public static Provider? ById(string id, ProjectRoot project, bool personal) =>
        AllIn(project, personal).FirstOrDefault(p => string.Equals(p.Id, id, StringComparison.OrdinalIgnoreCase));

    public bool HasMods => Id == ClaudeCodeId;

    public static Provider? ById(string id) =>
        All.FirstOrDefault(p => string.Equals(p.Id, id, StringComparison.OrdinalIgnoreCase));

    private static string Home =>
        Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);

    // ── Claude Code ────────────────────────────────────────────────────────────
    // Global de usuario: ~/.claude/CLAUDE.md y ~/.claude/skills/<nombre>/SKILL.md.
    // Sin plugin: el CLAUDE.md de usuario se carga en todo proyecto, y las
    // skills sueltas en ~/.claude/skills son el mecanismo documentado para el
    // alcance personal. Los subagentes de usuario van en ~/.claude/agents.
    public static Provider ClaudeCode(string? homeDirectory = null)
    {
        var root = Path.Combine(homeDirectory ?? Home, ".claude");
        return new Provider
        {
            Id = ClaudeCodeId,
            DisplayName = "Claude Code",
            InstructionsFile = Path.Combine(root, "CLAUDE.md"),
            SkillsDirectory = Path.Combine(root, "skills"),
            AgentsDirectory = Path.Combine(root, "agents"),
            AgentExtension = ".md",
            AdapterFile = "adapter-claude.md",
            Usage = "Abrí claude en cualquier proyecto: el CLAUDE.md de usuario se carga solo."
        };
    }

    // ── Codex ──────────────────────────────────────────────────────────────────
    // Las instrucciones van en $CODEX_HOME/AGENTS.md (por defecto ~/.codex), y
    // las skills NO van ahí: el scope de usuario documentado es ~/.agents/skills.
    // Cambiar CODEX_HOME mueve las instrucciones, no las skills. Los agentes de
    // usuario van en ~/.codex/agents; que sigan a CODEX_HOME es inferido, no
    // documentado.
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
            Id = CodexId,
            DisplayName = "Codex",
            InstructionsFile = Path.Combine(root, "AGENTS.md"),
            SkillsDirectory = skills,
            AgentsDirectory = Path.Combine(root, "agents"),
            AgentExtension = ".toml",
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

    // ── En un proyecto (sección 13) ────────────────────────────────────────────
    // Lo mismo con otra raíz. Claude Code tiene instrucciones solo del usuario,
    // CLAUDE.local.md; Codex no, así que su AGENTS.md es el mismo en los dos modos.
    public static Provider ClaudeCodeIn(ProjectRoot project, bool personal)
    {
        personal = personal && project.IsGitRepo;
        var instructions = project.Combine(personal ? "CLAUDE.local.md" : "CLAUDE.md");
        var (suffix, warning) = AgentsImport(project, instructions);

        return new Provider
        {
            Id = ClaudeCodeId,
            DisplayName = "Claude Code",
            InstructionsFile = instructions,
            SkillsDirectory = project.Combine(".claude", "skills"),
            AgentsDirectory = project.Combine(".claude", "agents"),
            AgentExtension = ".md",
            AdapterFile = "adapter-claude.md",
            Usage = "Abrí claude en este proyecto: NZT se carga solo acá.",
            Scope = Scope.Project,
            Project = project,
            Personal = personal,
            CreatedSuffix = suffix,
            AgentsWarning = warning
        };
    }

    public static Provider CodexIn(ProjectRoot project, bool personal)
    {
        personal = personal && project.IsGitRepo;
        return new Provider
        {
            Id = CodexId,
            DisplayName = "Codex",
            InstructionsFile = project.Combine("AGENTS.md"),
            SkillsDirectory = project.Combine(".agents", "skills"),
            AgentsDirectory = project.Combine(".codex", "agents"),
            AgentExtension = ".toml",
            AdapterFile = "adapter-codex.md",
            Usage = "Iniciá codex en este proyecto: NZT se carga solo acá.",
            Scope = Scope.Project,
            Project = project,
            Personal = personal
        };
    }

    // Claude Code lee AGENTS.md solo si no hay CLAUDE.md, .claude/CLAUDE.md ni
    // CLAUDE.local.md. Crear uno de ellos lo dejaría de leer sin aviso, así que el
    // archivo nuevo lo importa. Salvo que tenga un bloque de NZT: importarlo traería
    // el kernel dos veces, con el adapter de Codex (QP-04).
    private static (string? Suffix, string? Warning) AgentsImport(ProjectRoot project, string instructions)
    {
        var agents = project.Combine("AGENTS.md");
        string[] claudeFiles = [project.Combine("CLAUDE.md"), project.Combine(".claude", "CLAUDE.md"),
            project.Combine("CLAUDE.local.md")];

        if (File.Exists(instructions) || claudeFiles.Any(File.Exists) || !File.Exists(agents))
            return (null, null);

        var text = File.ReadAllText(agents);
        if (!InstructionBlock.HasMarkers(text))
            return (InstructionBlock.AgentsImport, null);

        var outside = InstructionBlock.TryLocate(text, out var start, out var length)
            ? text.Remove(start, length)
            : "";
        return (null, outside.Trim().Length == 0
            ? null
            : "AGENTS.md tiene un bloque de NZT y también contenido propio. No se importa —traería el "
              + "kernel dos veces—, así que Claude Code no va a leer ese contenido.");
    }
}
