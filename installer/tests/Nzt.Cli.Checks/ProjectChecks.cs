using System.Text.Json.Nodes;
using Nzt.Cli.Content;
using Nzt.Cli.Install;
using Nzt.Cli.Lint;
using Nzt.Cli.Project;

namespace Nzt.Cli.Checks;

/// <summary>
/// `nzt-ai project`: packs, `.nzt/project.json` y los archivos de MCP de cada
/// proveedor, siempre sobre una carpeta de proyecto temporal.
/// </summary>
public static partial class Program
{
    private static void RunProjectChecks()
    {
        ResolveAddsWhatEachPackRequires();
        AddInstallsTheSkillsAndTheMcp();
        IsSecondProjectApplyIdempotent();
        RemoveTakesOutOnlyWhatNoPackNeeds();
        RemovingEveryPackLeavesNothing();
        RefusesWhenAProjectFileIsNotOurs();
        AnUnknownPackWritesNothing();
        KeepsAnEditedPackFile();
        SyncRestoresWhatIsMissing();
        ProjectDryRunWritesNothing();
        KeepsTheUsersMcpInTheJson();
        WritesALocalMcpWithItsCommand();
        SkipsAMcpWithoutACommandForThePlatform();
        CodexMcpLivesInItsBlock();
        KeepsTheUsersMcpInTheToml();
        DroppingAProviderCleansItsFiles();
        ProjectMenuChoiceResolvesTheTargets();
        EmbedsEveryPackOfTheRepo();
        LintCatchesEveryBrokenPack();
        TheRepoPassesTheLint();
    }

    // ── Resolve ────────────────────────────────────────────────────────────────

    private static void ResolveAddsWhatEachPackRequires()
    {
        var (packs, unknown) = Packs().Resolve(["dotnet", "nada", "code"]);

        Check("resolve trae lo que requiere, antes que el pack",
            packs.Select(p => p.Name).SequenceEqual(["code", "backend", "csharp", "dotnet"]));
        Check("resolve no repite un pack pedido dos veces", packs.Count(p => p.Name == "code") == 1);
        Check("resolve devuelve el desconocido sin cortar el resto", unknown is ["nada"]);
    }

    // ── Archivos ───────────────────────────────────────────────────────────────

    private static void AddInstallsTheSkillsAndTheMcp() => InTemp(dir =>
    {
        var result = Apply(dir, ["dotnet"]);
        var project = ProjectFile.Load(dir);

        Check("project add instala sin conflictos", !result.Aborted);
        Check("instala la skill de cada pack resuelto",
            new[] { "code", "backend", "csharp", "dotnet" }.All(p =>
                File.Exists(Path.Combine(dir, ".claude", "skills", $"nzt-{p}", "SKILL.md"))));
        Check("instala las referencias dentro de la skill del pack",
            File.Exists(Path.Combine(dir, ".claude", "skills", "nzt-dotnet", "references", "ef-core.md")));
        Check("habilita el MCP del pack en .mcp.json",
            Servers(dir)?["microsoft-learn"]?["url"]?.GetValue<string>() == "https://learn.microsoft.com/api/mcp");
        Check("project.json guarda el pack pedido, no los que requiere", project?.Packs is ["dotnet"]);
        Check("project.json guarda rutas relativas",
            project?.Files.All(f => f.Path.StartsWith(".claude/skills/", StringComparison.Ordinal)) == true);
        Check("project.json anota el MCP como de nzt-ai", project?.McpOf("claude-code") is ["microsoft-learn"]);
    });

    private static void IsSecondProjectApplyIdempotent() => InTemp(dir =>
    {
        Apply(dir, ["dotnet"]);
        var again = Apply(dir, ["dotnet"]);

        Check("repetir project add no cambia archivos", again.Files.All(o => o.Action == FileAction.Unchanged));
        Check("repetir project add no cambia el MCP",
            again.Mcp.SelectMany(m => m.Outcomes).All(o => o.Action == McpAction.Unchanged));
    });

    private static void RemoveTakesOutOnlyWhatNoPackNeeds() => InTemp(dir =>
    {
        Apply(dir, ["dotnet", "ddd"]);
        var result = Apply(dir, ["csharp", "ddd"]);

        Check("sacar un pack borra su skill y su carpeta",
            !Directory.Exists(Path.Combine(dir, ".claude", "skills", "nzt-dotnet"))
            && !Directory.Exists(Path.Combine(dir, ".claude", "skills", "nzt-backend")));
        Check("sacar un pack deja los que otro sigue requiriendo",
            File.Exists(Path.Combine(dir, ".claude", "skills", "nzt-code", "SKILL.md"))
            && File.Exists(Path.Combine(dir, ".claude", "skills", "nzt-ddd", "SKILL.md")));
        Check("el MCP que otro pack sigue usando se queda",
            Servers(dir)?.ContainsKey("microsoft-learn") == true
            && result.Mcp.SelectMany(m => m.Outcomes).All(o => o.Action != McpAction.Removed));
    });

    private static void RemovingEveryPackLeavesNothing() => InTemp(dir =>
    {
        Apply(dir, ["dotnet"]);
        var result = Apply(dir, []);

        Check("sin packs se saca el MCP que agregó",
            result.Mcp.SelectMany(m => m.Outcomes).Any(o => o is { Name: "microsoft-learn", Action: McpAction.Removed }));
        Check("sin packs no queda nada en el proyecto",
            !Directory.EnumerateFileSystemEntries(dir).Any());
    });

    private static void RefusesWhenAProjectFileIsNotOurs() => InTemp(dir =>
    {
        var mine = Path.Combine(dir, ".claude", "skills", "nzt-code", "SKILL.md");
        Directory.CreateDirectory(Path.GetDirectoryName(mine)!);
        File.WriteAllText(mine, "una skill mía\n");

        var result = Apply(dir, ["backend"]);

        Check("aborta ante un archivo del proyecto que no escribió",
            result.Aborted && result.Conflicts.Any(c => c.TargetPath == ".claude/skills/nzt-code/SKILL.md"));
        Check("con el conflicto no escribe nada",
            !Directory.Exists(Path.Combine(dir, ".claude", "skills", "nzt-backend"))
            && ProjectFile.Load(dir) is null && !File.Exists(Path.Combine(dir, ".mcp.json")));
        Check("el archivo ajeno queda como estaba", File.ReadAllText(mine) == "una skill mía\n");
    });

    private static void AnUnknownPackWritesNothing() => InTemp(dir =>
    {
        var result = Apply(dir, ["code", "dotnte"]);

        Check("un pack desconocido aborta y se nombra", result.Aborted && result.Unknown is ["dotnte"]);
        Check("un pack desconocido no escribe nada", !Directory.EnumerateFileSystemEntries(dir).Any());
    });

    private static void KeepsAnEditedPackFile() => InTemp(dir =>
    {
        Apply(dir, ["code"]);
        var edited = Path.Combine(dir, ".claude", "skills", "nzt-code", "SKILL.md");
        File.WriteAllText(edited, "mis reglas\n");

        var changed = PackCatalog.From(Packs().Packs.Select(p => p.Name == "code"
            ? p with { Skill = PackSkill("code", "versión nueva") }
            : p));
        var update = ProjectInstaller.Apply(dir, ["code"], [ProjectTarget.ClaudeCode], changed, "0.2.0", home: dir);

        Check("actualizar no pisa una skill de pack editada",
            File.ReadAllText(edited) == "mis reglas\n" && update.Count(FileAction.SkippedLocallyEdited) == 1);

        Apply(dir, []);
        Check("sacar el pack conserva la skill editada", File.Exists(edited));
        Check("y project.json la sigue anotando", ProjectFile.Load(dir)?.Files.Count == 1);
    });

    private static void SyncRestoresWhatIsMissing() => InTemp(dir =>
    {
        Apply(dir, ["dotnet"]);
        Directory.Delete(Path.Combine(dir, ".claude"), recursive: true);
        File.Delete(Path.Combine(dir, ".mcp.json"));

        var project = ProjectFile.Load(dir)!;
        var sync = Apply(dir, project.Packs);

        Check("sync vuelve a crear las skills que faltan",
            sync.Count(FileAction.Created) == project.Files.Count && sync.Count(FileAction.Created) > 0);
        Check("sync vuelve a habilitar el MCP", Servers(dir)?.ContainsKey("microsoft-learn") == true);
    });

    private static void ProjectDryRunWritesNothing() => InTemp(dir =>
    {
        var result = Apply(dir, ["dotnet"], dryRun: true);

        Check("la simulación de project add planifica", result.Count(FileAction.Created) > 0);
        Check("la simulación de project add no escribe nada", !Directory.EnumerateFileSystemEntries(dir).Any());
    });

    // ── MCP ────────────────────────────────────────────────────────────────────

    private static void KeepsTheUsersMcpInTheJson() => InTemp(dir =>
    {
        File.WriteAllText(Path.Combine(dir, ".mcp.json"), """
            { "mcpServers": {
                "microsoft-learn": { "type": "http", "url": "https://mi-proxy/mcp" },
                "github": { "type": "http", "url": "https://api.githubcopilot.com/mcp/" } } }
            """);

        var result = Apply(dir, ["dotnet"]);
        Check("un MCP del usuario con el mismo nombre se queda como está",
            Servers(dir)?["microsoft-learn"]?["url"]?.GetValue<string>() == "https://mi-proxy/mcp"
            && result.Mcp.SelectMany(m => m.Outcomes).Single().Action == McpAction.KeptUsers);
        Check("y no se anota como de nzt-ai", ProjectFile.Load(dir)?.McpOf("claude-code").Count == 0);

        Apply(dir, []);
        Check("sacar el pack no toca los MCP del usuario",
            Servers(dir) is { Count: 2 } servers && servers.ContainsKey("github") && servers.ContainsKey("microsoft-learn"));
    });

    private static void WritesALocalMcpWithItsCommand() => InTemp(dir =>
    {
        Apply(dir, ["unity"], platform: "linux");
        var unity = Servers(dir)?["unity-mcp"];

        Check("un MCP local resuelve {home} en su comando",
            unity?["command"]?.GetValue<string>() == $"{dir}/.unity/relay/relay_linux"
            && unity?["type"]?.GetValue<string>() == "stdio");
        Check("y lleva sus args", unity?["args"]?[0]?.GetValue<string>() == "--mcp");
    });

    private static void SkipsAMcpWithoutACommandForThePlatform() => InTemp(dir =>
    {
        var result = Apply(dir, ["unity"], platform: "plan9");

        Check("un MCP sin comando para la plataforma se reporta y no se escribe",
            result.Mcp.SelectMany(m => m.Outcomes).Single().Action == McpAction.Unsupported
            && !File.Exists(Path.Combine(dir, ".mcp.json")));
    });

    private static void CodexMcpLivesInItsBlock() => InTemp(dir =>
    {
        Apply(dir, ["dotnet"], [ProjectTarget.Codex]);
        var toml = Path.Combine(dir, ".codex", "config.toml");
        var text = File.ReadAllText(toml);

        Check("Codex recibe las skills en .agents/skills",
            File.Exists(Path.Combine(dir, ".agents", "skills", "nzt-dotnet", "SKILL.md")));
        Check("Codex recibe el MCP dentro del bloque de nzt-ai",
            text.StartsWith(McpConfig.TomlBegin, StringComparison.Ordinal)
            && text.Contains("[mcp_servers.microsoft-learn]\nurl = \"https://learn.microsoft.com/api/mcp\"")
            && text.TrimEnd().EndsWith(McpConfig.TomlEnd, StringComparison.Ordinal));

        Apply(dir, [], [ProjectTarget.Codex]);
        Check("sin packs el config.toml que era solo el bloque se borra",
            !File.Exists(toml) && !Directory.Exists(Path.Combine(dir, ".codex")));
    });

    private static void KeepsTheUsersMcpInTheToml() => InTemp(dir =>
    {
        var toml = Path.Combine(dir, ".codex", "config.toml");
        Directory.CreateDirectory(Path.GetDirectoryName(toml)!);
        const string users = "model = \"o3\"\n\n[mcp_servers.unity-mcp]\ncommand = \"mi-relay\"\n";
        File.WriteAllText(toml, users);

        var result = Apply(dir, ["dotnet", "unity"], [ProjectTarget.Codex], platform: "linux");
        var text = File.ReadAllText(toml);

        Check("una tabla del usuario fuera del bloque se queda como está",
            text.StartsWith(users.TrimEnd('\n'), StringComparison.Ordinal)
            && result.Mcp.SelectMany(m => m.Outcomes).Single(o => o.Name == "unity-mcp").Action == McpAction.KeptUsers);
        Check("el bloque lleva solo los MCP de nzt-ai",
            text.Contains("[mcp_servers.microsoft-learn]")
            && text.Split("[mcp_servers.unity-mcp]").Length == 2);

        Apply(dir, [], [ProjectTarget.Codex]);
        Check("sacar los packs deja el config.toml del usuario como estaba",
            File.ReadAllText(toml) == users);
    });

    private static void DroppingAProviderCleansItsFiles() => InTemp(dir =>
    {
        Apply(dir, ["dotnet"], ProjectTarget.All);
        Check("--provider all instala para los dos",
            File.Exists(Path.Combine(dir, ".claude", "skills", "nzt-dotnet", "SKILL.md"))
            && File.Exists(Path.Combine(dir, ".agents", "skills", "nzt-dotnet", "SKILL.md"))
            && File.Exists(Path.Combine(dir, ".mcp.json"))
            && File.Exists(Path.Combine(dir, ".codex", "config.toml")));

        Apply(dir, ["dotnet"], [ProjectTarget.Codex]);
        Check("dejar un proveedor saca sus skills y su MCP",
            !Directory.Exists(Path.Combine(dir, ".claude")) && !File.Exists(Path.Combine(dir, ".mcp.json")));
        Check("y deja los del otro",
            File.Exists(Path.Combine(dir, ".agents", "skills", "nzt-dotnet", "SKILL.md"))
            && ProjectFile.Load(dir)?.Providers is ["codex"]);
    });

    private static void ProjectMenuChoiceResolvesTheTargets()
    {
        Check("el menú de project resuelve Claude Code",
            Cli.Program.ProjectTargetsFor(Cli.Program.ProviderChoice.ClaudeCode) is [{ ProviderId: "claude-code" }]);
        Check("el menú de project resuelve todos",
            Cli.Program.ProjectTargetsFor(Cli.Program.ProviderChoice.All).Count == ProjectTarget.All.Count);
        Check("volver en el menú de project no elige ninguno",
            Cli.Program.ProjectTargetsFor(Cli.Program.ProviderChoice.Back).Count == 0);
    }

    // ── Repo y lint ────────────────────────────────────────────────────────────

    /// <summary>
    /// Como con las skills globales, el .csproj decide qué viaja: un pack o una
    /// referencia que no se embebe se instala incompleta en el proyecto.
    /// </summary>
    private static void EmbedsEveryPackOfTheRepo()
    {
        var root = RepoRoot();
        if (root is null) { Failures.Add("no se encontró la raíz del repo"); return; }

        var folders = Directory.EnumerateDirectories(Path.Combine(root, "packs"))
            .Select(Path.GetFileName).Order(StringComparer.Ordinal).ToList();
        var references = Directory.EnumerateFiles(Path.Combine(root, "packs"), "*.md", SearchOption.AllDirectories)
            .Count(f => Path.GetFileName(Path.GetDirectoryName(f)) == "references");
        var embedded = PackCatalog.Load();

        Check($"embebe los {folders.Count} packs del repo",
            folders.Count > 0 && embedded.Packs.Select(p => p.Name).SequenceEqual(folders));
        Check($"embebe las {references} referencias de los packs",
            references > 0 && embedded.Packs.Sum(p => p.Skill?.References.Count ?? 0) == references);
    }

    private static void LintCatchesEveryBrokenPack()
    {
        var catalog = PackCatalog.From(
        [
            new Pack { Name = "vacio", Description = "" },
            new Pack { Name = "a", Description = "x", Requires = ["b", "fantasma"], Skill = PackSkill("a") },
            new Pack { Name = "b", Description = "x", Requires = ["a"], Skill = PackSkill("b") },
            new Pack
            {
                Name = "mcp", Description = "x",
                Mcp = [new McpServer { Name = "doble", Url = "https://x", Command = new() { ["linux"] = "x" } },
                       new McpServer { Name = "otro", Url = "https://uno" }]
            },
            new Pack { Name = "mcp2", Description = "x", Mcp = [new McpServer { Name = "otro", Url = "https://dos" }] },
            new Pack
            {
                Name = "build", Description = "x",
                Skill = new SkillFile("nzt-build", "packs/build", "---\nname: nzt-buld\ndescription: x\n---\n")
            }
        ]);
        var global = ContentCatalog.From("# NZT\n", new Dictionary<string, string>(),
            [new SkillFile("nzt-build", "nzt/build", "---\nname: nzt-build\ndescription: x\n---\n")]);

        var report = Linter.RunPacks(catalog, global);
        bool Says(string where, string text) =>
            report.Issues.Any(i => i.Where.StartsWith(where, StringComparison.Ordinal) && i.Message.Contains(text));

        Check("el lint de packs ve la description faltante", Says("packs/vacio", "sin description"));
        Check("el lint de packs ve un pack sin skill ni MCP", Says("packs/vacio", "ni MCP"));
        Check("el lint de packs ve un requires que no existe", Says("packs/a", "'fantasma'"));
        Check("el lint de packs ve un ciclo", Says("packs/a", "ciclo") && Says("packs/b", "ciclo"));
        Check("el lint de packs ve un MCP con url y command", Says("packs/mcp", "'doble'"));
        Check("el lint de packs ve un MCP definido distinto en dos packs", Says("packs", "'otro' se define distinto"));
        Check("el lint de packs ve una skill que choca con una global", Says("packs/build", "como una global"));
        Check("el lint de packs aplica las reglas de skill", Says("packs/build", "deriva"));
    }

    private static void TheRepoPassesTheLint()
    {
        var global = Linter.Run(ContentCatalog.Load());
        var packs = Linter.RunPacks(PackCatalog.Load(), ContentCatalog.Load());

        foreach (var issue in global.Issues.Concat(packs.Issues))
            Console.WriteLine($"  lint  {issue.Where}: {issue.Message}");
        Check("las skills globales del repo pasan el lint", global.Ok);
        Check("los packs del repo pasan el lint", packs.Ok);
    }

    // ── Andamio ────────────────────────────────────────────────────────────────

    private static ProjectResult Apply(string dir, IReadOnlyList<string> packs,
        IReadOnlyList<ProjectTarget>? targets = null, bool dryRun = false, string platform = "windows") =>
        ProjectInstaller.Apply(dir, packs, targets ?? [ProjectTarget.ClaudeCode], Packs(), "0.1.0", dryRun,
            home: dir, platform: platform);

    private static JsonObject? Servers(string dir)
    {
        var path = Path.Combine(dir, ".mcp.json");
        return File.Exists(path) ? JsonNode.Parse(File.ReadAllText(path))?["mcpServers"] as JsonObject : null;
    }

    /// <summary>La forma de los packs del repo, con contenido de prueba.</summary>
    private static PackCatalog Packs()
    {
        var learn = new McpServer { Name = "microsoft-learn", Url = "https://learn.microsoft.com/api/mcp" };
        return PackCatalog.From(
        [
            new Pack { Name = "code", Description = "código", Skill = PackSkill("code") },
            new Pack { Name = "ddd", Description = "ddd", Skill = PackSkill("ddd") },
            new Pack { Name = "backend", Description = "backend", Requires = ["code"], Skill = PackSkill("backend") },
            new Pack { Name = "csharp", Description = "c#", Requires = ["code"], Mcp = [learn], Skill = PackSkill("csharp") },
            new Pack
            {
                Name = "dotnet", Description = ".net", Requires = ["backend", "csharp"], Mcp = [learn],
                Skill = PackSkill("dotnet") with { References = [new ReferenceFile("ef-core.md", "# EF Core\n")] }
            },
            new Pack
            {
                Name = "unity", Description = "unity", Requires = ["code"],
                Mcp = [new McpServer
                {
                    Name = "unity-mcp",
                    Command = new() { ["windows"] = @"{home}\.unity\relay\relay_win.exe", ["linux"] = "{home}/.unity/relay/relay_linux" },
                    Args = ["--mcp"]
                }]
            }
        ]);
    }

    private static SkillFile PackSkill(string pack, string body = "cuerpo") =>
        new($"nzt-{pack}", $"packs/{pack}", $"---\nname: nzt-{pack}\ndescription: pack {pack}\n---\n\n{body}\n");
}
