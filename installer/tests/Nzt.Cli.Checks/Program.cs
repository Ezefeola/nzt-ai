using Nzt.Cli.Content;
using Nzt.Cli.Install;
using Nzt.Cli.Lint;
using Nzt.Cli.Mods;
using Nzt.Cli.Providers;
using Nzt.Cli.State;

namespace Nzt.Cli.Checks;

/// <summary>
/// Comprobaciones del instalador contra destinos y manifiestos temporales. Nunca
/// tocan el HOME real: cada caso arma su propio árbol y lo borra al terminar.
/// No prueban comportamiento de los CLIs ni selección de skills por el modelo.
/// </summary>
public static class Program
{
    private static int _passed;
    private static readonly List<string> Failures = [];

    public static int Main()
    {
        InstallsInstructionsAndSkills();
        IsSecondInstallIdempotent();
        KeepsUserTextAroundTheBlock();
        BacksUpAnExistingInstructionsFileOnce();
        DoesNotOverwriteALocallyEditedSkill();
        RemovesAnOrphanButNotAnEditedOne();
        InstallsReferencesInsideTheirSkill();
        RemovesOrphanReferencesAndEmptyFolders();
        EmbedsEveryReferenceOfTheRepo();
        InstallsEachProviderItsOwnAgent();
        UninstallRemovesTheAgentButNotTheFolder();
        EmbedsTheAgentsOfTheRepo();
        RefusesWhenASkillFileIsNotOurs();
        RefusesWhenMarkersExistWithoutAManifest();
        DryRunWritesNothing();
        UninstallRemovesOnlyWhatItInstalled();
        UninstallKeepsEditedFilesAndTheirManifest();
        FlattensTheNestedPathIntoTheName();
        BlockMatchesWhatTheBuildEmits();
        DoesNotTouchADamagedBlock();
        LintCatchesNamePathMismatch();
        MenuChoiceResolvesTheProvider();
        ModsFlagResolvesTheChoice();
        ModCatalogIsTheRepoMarketplace();
        InstallsEveryModWhenClaudeIsThere();
        UsesTheNztMarketplaceAlreadyRegistered();
        InstallsNoModsWithoutClaude();
        TreatsAnOldClaudeAsMissing();
        AFailingModDoesNotStopTheOthers();
        UpdatesAModInstalledByHandWithoutOwningIt();
        ModsDryRunChangesNothing();
        TheMethodKeepsTheModsInTheManifest();
        ReinstallingUpdatesTheModsItInstalled();
        UninstallRemovesOnlyTheModsItInstalled();
        UninstallForgetsAModTheUserAlreadyRemoved();
        AModThatFailsToUninstallStaysOwned();
        ModsUninstallDryRunChangesNothing();
        UninstallingTheModsKeepsTheMethod();
        StatusSaysWhoInstalledEachMod();
        LeavesTheCliInstalledAndUpdatesIt();
        CliDryRunWritesNothing();
        CliFromTheRepoIsNotInstalled();
        UninstallRemovesTheCli();
        StateCheckAcceptsAValidState();
        StateCheckWithoutAFileIsNotAnError();
        StateCheckCatchesEveryBrokenInvariant();
        StateCheckAcceptsEachDelegationModeAndItsAbsence();
        StateCheckAcceptsAParallelGroup();
        StateCheckCatchesEveryBrokenParallelGroup();
        StateCheckReportsBrokenJson();
        StateCheckAcceptsASlicedState();
        StateCheckCatchesEveryBrokenSliceInvariant();
        StateCheckRejectsAMixedOrUnversionedSlicedState();
        StateCheckAcceptsTheRepoState();

        Console.WriteLine();
        foreach (var failure in Failures) Console.WriteLine($"FAIL: {failure}");
        Console.WriteLine(Failures.Count == 0
            ? $"PASS: {_passed} installer checks"
            : $"{_passed} passed, {Failures.Count} failed");

        return Failures.Count == 0 ? 0 : 1;
    }

    // ── Casos ──────────────────────────────────────────────────────────────────

    private static void InstallsInstructionsAndSkills() => InTemp(home =>
    {
        var (provider, catalog, manifests) = Setup(home);
        var result = Installer.Install(provider, catalog, "0.1.0", manifestDirectory: manifests);

        Check("instala sin conflictos", !result.Aborted);
        Check("escribe el archivo de instrucciones", File.Exists(provider.InstructionsFile));
        Check("el bloque lleva los marcadores del build",
            File.ReadAllText(provider.InstructionsFile).Contains(InstructionBlock.Begin));
        Check("aplana la skill anidada",
            File.Exists(Path.Combine(provider.SkillsDirectory, "nzt-build-implement", "SKILL.md")));
        // Instrucciones + tres skills.
        Check("registra todo en el manifiesto",
            Manifest.Load(provider.Id, manifests)!.Files.Count == 4);
    });

    private static void IsSecondInstallIdempotent() => InTemp(home =>
    {
        var (provider, catalog, manifests) = Setup(home);
        Installer.Install(provider, catalog, "0.1.0", manifestDirectory: manifests);
        var again = Installer.Install(provider, catalog, "0.1.0", manifestDirectory: manifests);

        Check("reinstalar no cambia nada", again.Count(FileAction.Unchanged) == 4);
        Check("reinstalar no crea de nuevo", again.Count(FileAction.Created) == 0);
    });

    private static void KeepsUserTextAroundTheBlock() => InTemp(home =>
    {
        var (provider, catalog, manifests) = Setup(home);
        Directory.CreateDirectory(Path.GetDirectoryName(provider.InstructionsFile)!);
        File.WriteAllText(provider.InstructionsFile, "# Mis notas\n\nNo me toques esto.\n");

        Installer.Install(provider, catalog, "0.1.0", manifestDirectory: manifests);
        var text = File.ReadAllText(provider.InstructionsFile);

        Check("conserva el texto del usuario", text.Contains("No me toques esto."));
        Check("el bloque va arriba", text.StartsWith(InstructionBlock.Begin, StringComparison.Ordinal));

        // Una actualización reemplaza el bloque en su lugar y deja el resto igual.
        var changed = ContentCatalog.From("# NZT v2\n", catalog.Adapters.ToDictionary(), catalog.Skills);
        Installer.Install(provider, changed, "0.2.0", manifestDirectory: manifests);
        var updated = File.ReadAllText(provider.InstructionsFile);

        Check("al actualizar sigue el texto del usuario", updated.Contains("No me toques esto."));
        Check("al actualizar entra el kernel nuevo", updated.Contains("# NZT v2"));
        Check("al actualizar no duplica el bloque",
            updated.Split(InstructionBlock.Begin).Length == 2);
    });

    private static void BacksUpAnExistingInstructionsFileOnce() => InTemp(home =>
    {
        var (provider, catalog, manifests) = Setup(home);
        Directory.CreateDirectory(Path.GetDirectoryName(provider.InstructionsFile)!);
        File.WriteAllText(provider.InstructionsFile, "# Mío\n");

        Installer.Install(provider, catalog, "0.1.0", manifestDirectory: manifests);
        var backup = provider.InstructionsFile + ".nzt-backup";

        Check("hace backup la primera vez", File.Exists(backup));
        Check("el backup es el archivo original", File.ReadAllText(backup) == "# Mío\n");

        var changed = ContentCatalog.From("# NZT v2\n", catalog.Adapters.ToDictionary(), catalog.Skills);
        Installer.Install(provider, changed, "0.2.0", manifestDirectory: manifests);

        Check("no pisa el backup en la segunda", File.ReadAllText(backup) == "# Mío\n");
    });

    private static void DoesNotOverwriteALocallyEditedSkill() => InTemp(home =>
    {
        var (provider, catalog, manifests) = Setup(home);
        Installer.Install(provider, catalog, "0.1.0", manifestDirectory: manifests);

        var path = Path.Combine(provider.SkillsDirectory, "nzt", "SKILL.md");
        File.WriteAllText(path, "---\nname: nzt\ndescription: mía\n---\n\nLo cambié yo.\n");

        var changed = ContentCatalog.From(catalog.Kernel, catalog.Adapters.ToDictionary(),
            [Skill("nzt", "---\nname: nzt\ndescription: nueva\n---\n\nVersión nueva.\n"),
             .. catalog.Skills.Where(s => s.Name != "nzt")]);

        var result = Installer.Install(provider, changed, "0.2.0", manifestDirectory: manifests);

        Check("no pisa una skill editada", File.ReadAllText(path).Contains("Lo cambié yo."));
        Check("la reporta como conservada", result.Count(FileAction.SkippedLocallyEdited) == 1);
        Check("el manifiesto guarda el hash instalado, no el editado",
            Manifest.Load(provider.Id, manifests)!.HashOf(path) != Manifest.HashFile(path));
    });

    private static void RemovesAnOrphanButNotAnEditedOne() => InTemp(home =>
    {
        var (provider, catalog, manifests) = Setup(home);
        Installer.Install(provider, catalog, "0.1.0", manifestDirectory: manifests);

        var gone = Path.Combine(provider.SkillsDirectory, "nzt-build-implement", "SKILL.md");
        var edited = Path.Combine(provider.SkillsDirectory, "nzt-build", "SKILL.md");
        File.WriteAllText(edited, "lo toqué\n");

        var shrunk = ContentCatalog.From(catalog.Kernel, catalog.Adapters.ToDictionary(),
            catalog.Skills.Where(s => s.Name == "nzt"));

        Installer.Install(provider, shrunk, "0.2.0", manifestDirectory: manifests);

        Check("borra la skill que ya no está en el set", !File.Exists(gone));
        Check("borra también su carpeta vacía",
            !Directory.Exists(Path.GetDirectoryName(gone)!));
        Check("no borra la huérfana que el usuario editó", File.Exists(edited));
    });

    private static void InstallsReferencesInsideTheirSkill() => InTemp(home =>
    {
        var (provider, catalog, manifests) = Setup(home);
        var withReferences = WithReferences(catalog, "nzt-build", "implement.md", "tests.md");

        Installer.Install(provider, withReferences, "0.1.0", manifestDirectory: manifests);

        Check("copia la referencia dentro de la carpeta de su skill",
            File.Exists(Path.Combine(provider.SkillsDirectory, "nzt-build", "references", "implement.md")));
        // Instrucciones + tres skills + dos referencias.
        Check("registra las referencias en el manifiesto",
            Manifest.Load(provider.Id, manifests)!.Files.Count == 6);
    });

    private static void RemovesOrphanReferencesAndEmptyFolders() => InTemp(home =>
    {
        var (provider, catalog, manifests) = Setup(home);
        Installer.Install(provider, WithReferences(catalog, "nzt-build", "implement.md"),
            "0.1.0", manifestDirectory: manifests);
        Installer.Install(provider, catalog, "0.1.0", manifestDirectory: manifests);

        Check("borra la referencia que salió del set y su carpeta vacía",
            !Directory.Exists(Path.Combine(provider.SkillsDirectory, "nzt-build", "references")));
        Check("conserva la skill cuya referencia salió",
            File.Exists(Path.Combine(provider.SkillsDirectory, "nzt-build", "SKILL.md")));

        Installer.Uninstall(provider, manifestDirectory: manifests);
        Check("desinstalar no deja carpetas vacías",
            !Directory.Exists(provider.SkillsDirectory)
            || !Directory.EnumerateFileSystemEntries(provider.SkillsDirectory).Any());
    });

    /// <summary>
    /// El .csproj es el que decide qué viaja: si su patrón no cubre una referencia
    /// del repo, el router se instala nombrando un archivo que no existe.
    /// </summary>
    private static void EmbedsEveryReferenceOfTheRepo()
    {
        var root = RepoRoot();
        if (root is null) { Failures.Add("no se encontró la raíz del repo"); return; }

        var onDisk = Directory.EnumerateFiles(Path.Combine(root, "skills"), "*.md", SearchOption.AllDirectories)
            .Count(f => Path.GetFileName(Path.GetDirectoryName(f)) == "references");
        var embedded = ContentCatalog.Load().Skills.Sum(s => s.References.Count);

        Check($"embebe las {onDisk} referencias del repo", onDisk > 0 && embedded == onDisk);
    }

    private static void InstallsEachProviderItsOwnAgent() => InTemp(home =>
    {
        var (claude, catalog, manifests) = Setup(home);
        catalog = WithAgents(catalog);
        var codex = Provider.Codex(home, Path.Combine(home, ".codex"));

        Installer.Install(claude, catalog, "0.1.0", manifestDirectory: manifests);
        Installer.Install(codex, catalog, "0.1.0", manifestDirectory: manifests);

        Check("Claude Code recibe el agente en Markdown",
            File.Exists(Path.Combine(home, ".claude", "agents", "nzt-explorer.md")));
        Check("Claude Code no recibe el de Codex",
            !File.Exists(Path.Combine(home, ".claude", "agents", "nzt-explorer.toml")));
        Check("Codex recibe el agente en TOML",
            File.Exists(Path.Combine(home, ".codex", "agents", "nzt-explorer.toml")));
        Check("Codex no recibe el de Claude Code",
            !File.Exists(Path.Combine(home, ".codex", "agents", "nzt-explorer.md")));
        Check("el agente queda en el manifiesto de su proveedor",
            Manifest.Load(claude.Id, manifests)!.HashOf(Path.Combine(claude.AgentsDirectory, "nzt-explorer.md")) is not null);
    });

    private static void UninstallRemovesTheAgentButNotTheFolder() => InTemp(home =>
    {
        var (provider, catalog, manifests) = Setup(home);
        catalog = WithAgents(catalog);
        var mine = Path.Combine(provider.AgentsDirectory, "mi-agente.md");
        Directory.CreateDirectory(provider.AgentsDirectory);
        File.WriteAllText(mine, "un agente del usuario\n");

        Installer.Install(provider, catalog, "0.1.0", manifestDirectory: manifests);
        Installer.Uninstall(provider, manifestDirectory: manifests);

        Check("desinstalar saca el agente",
            !File.Exists(Path.Combine(provider.AgentsDirectory, "nzt-explorer.md")));
        Check("desinstalar deja los agentes del usuario", File.Exists(mine));
    });

    /// <summary>
    /// Un agente del repo que no viaja embebido no se instala, y `nzt-delegate`
    /// mandaría a delegar en algo que no existe.
    /// </summary>
    private static void EmbedsTheAgentsOfTheRepo()
    {
        var root = RepoRoot();
        if (root is null) { Failures.Add("no se encontró la raíz del repo"); return; }

        var onDisk = Directory.EnumerateFiles(Path.Combine(root, "agents"))
            .Select(Path.GetFileName).Order(StringComparer.Ordinal).ToList();
        var embedded = ContentCatalog.Load().Agents.Select(a => a.FileName).ToList();

        Check($"embebe los {onDisk.Count} agentes del repo", onDisk.Count > 0 && embedded.SequenceEqual(onDisk));
    }

    private static ContentCatalog WithAgents(ContentCatalog catalog) =>
        ContentCatalog.From(catalog.Kernel, catalog.Adapters.ToDictionary(), catalog.Skills,
            [new AgentFile("nzt-explorer.md", "---\nname: nzt-explorer\n---\n"),
             new AgentFile("nzt-explorer.toml", "name = \"nzt_explorer\"\n")]);

    private static ContentCatalog WithReferences(ContentCatalog catalog, string skillName, params string[] files) =>
        ContentCatalog.From(catalog.Kernel, catalog.Adapters.ToDictionary(),
            catalog.Skills.Select(s => s.Name == skillName
                ? s with { References = [.. files.Select(f => new ReferenceFile(f, $"# {f}\n"))] }
                : s));

    private static void RefusesWhenASkillFileIsNotOurs() => InTemp(home =>
    {
        var (provider, catalog, manifests) = Setup(home);
        var intruder = Path.Combine(provider.SkillsDirectory, "nzt", "SKILL.md");
        Directory.CreateDirectory(Path.GetDirectoryName(intruder)!);
        File.WriteAllText(intruder, "una skill que ya tenía\n");

        var result = Installer.Install(provider, catalog, "0.1.0", manifestDirectory: manifests);

        Check("aborta ante un archivo ajeno", result.Aborted);
        Check("no escribió nada", !File.Exists(provider.InstructionsFile));
        Check("dejó intacto el archivo ajeno", File.ReadAllText(intruder) == "una skill que ya tenía\n");
    });

    private static void RefusesWhenMarkersExistWithoutAManifest() => InTemp(home =>
    {
        var (provider, catalog, manifests) = Setup(home);
        Directory.CreateDirectory(Path.GetDirectoryName(provider.InstructionsFile)!);
        File.WriteAllText(provider.InstructionsFile,
            InstructionBlock.Begin + "\nde otra instalación\n" + InstructionBlock.End + "\n");

        var result = Installer.Install(provider, catalog, "0.1.0", manifestDirectory: manifests);

        Check("marcadores sin manifiesto son colisión", result.Aborted);
        Check("no pisa el bloque ajeno",
            File.ReadAllText(provider.InstructionsFile).Contains("de otra instalación"));
    });

    private static void DryRunWritesNothing() => InTemp(home =>
    {
        var (provider, catalog, manifests) = Setup(home);
        var result = Installer.Install(provider, catalog, "0.1.0", dryRun: true, manifestDirectory: manifests);

        Check("la simulación planifica", result.Count(FileAction.Created) == 4);
        Check("la simulación no escribe instrucciones", !File.Exists(provider.InstructionsFile));
        Check("la simulación no escribe skills", !Directory.Exists(provider.SkillsDirectory));
        Check("la simulación no escribe manifiesto", Manifest.Load(provider.Id, manifests) is null);
    });

    private static void UninstallRemovesOnlyWhatItInstalled() => InTemp(home =>
    {
        var (provider, catalog, manifests) = Setup(home);
        Directory.CreateDirectory(Path.GetDirectoryName(provider.InstructionsFile)!);
        File.WriteAllText(provider.InstructionsFile, "# Mis notas\n");
        Installer.Install(provider, catalog, "0.1.0", manifestDirectory: manifests);

        var result = Installer.Uninstall(provider, manifestDirectory: manifests);

        Check("desinstala lo del manifiesto", result.Count(FileAction.Removed) == 4);
        Check("saca el bloque",
            !File.ReadAllText(provider.InstructionsFile).Contains(InstructionBlock.Begin));
        Check("deja el texto del usuario",
            File.ReadAllText(provider.InstructionsFile).Contains("# Mis notas"));
        Check("borra las carpetas de skills vacías",
            !Directory.Exists(Path.Combine(provider.SkillsDirectory, "nzt")));
        Check("borra el manifiesto", Manifest.Load(provider.Id, manifests) is null);
    });

    private static void UninstallKeepsEditedFilesAndTheirManifest() => InTemp(home =>
    {
        var (provider, catalog, manifests) = Setup(home);
        Installer.Install(provider, catalog, "0.1.0", manifestDirectory: manifests);

        var edited = Path.Combine(provider.SkillsDirectory, "nzt", "SKILL.md");
        File.WriteAllText(edited, "mío ahora\n");

        Installer.Uninstall(provider, manifestDirectory: manifests);

        Check("no borra lo editado", File.Exists(edited));
        var manifest = Manifest.Load(provider.Id, manifests);
        Check("conserva el manifiesto con lo que queda", manifest is not null && manifest.Files.Count == 1);
    });

    private static void FlattensTheNestedPathIntoTheName()
    {
        var skill = new SkillFile("nzt-build-backend-dotnet-ef-core-queries",
            "nzt/build/backend/dotnet/ef-core/queries", "---\nname: x\n---\n");

        Check("el nombre plano sale del path",
            skill.RepoPath.Replace('/', '-') == skill.Name);
    }

    /// <summary>
    /// El instalador y `install/build.*` tienen que producir el mismo bloque. Es
    /// la única defensa contra que las dos implementaciones se separen (I2).
    /// </summary>
    private static void BlockMatchesWhatTheBuildEmits()
    {
        var repo = RepoRoot();
        if (repo is null) { Check("hay repo para comparar el build", false); return; }

        var built = Path.Combine(repo, "dist", "CLAUDE.md");
        if (!File.Exists(built))
        {
            Console.WriteLine("  (salteado: no hay dist/CLAUDE.md — corré install/build.sh)");
            return;
        }

        var kernel = File.ReadAllText(Path.Combine(repo, "core", "kernel.md"));
        var adapter = File.ReadAllText(Path.Combine(repo, "core", "adapter-claude.md"));

        Check("el bloque del CLI es idéntico al del build",
            Manifest.Hash(InstructionBlock.Render(kernel, adapter)) == Manifest.Hash(File.ReadAllText(built)));
    }

    private static void DoesNotTouchADamagedBlock() => InTemp(home =>
    {
        var (provider, catalog, manifests) = Setup(home);
        Installer.Install(provider, catalog, "0.1.0", manifestDirectory: manifests);

        // Alguien borra el marcador de cierre: el bloque deja de ser ubicable.
        var text = File.ReadAllText(provider.InstructionsFile).Replace(InstructionBlock.End, "");
        File.WriteAllText(provider.InstructionsFile, text);

        var changed = ContentCatalog.From("# NZT v2\n", catalog.Adapters.ToDictionary(), catalog.Skills);
        var result = Installer.Install(provider, changed, "0.2.0", manifestDirectory: manifests);

        Check("no adivina sobre un bloque roto",
            result.Outcomes.Any(o => o.TargetPath == provider.InstructionsFile
                                     && o.Action == FileAction.SkippedLocallyEdited));
        Check("el archivo roto queda como estaba",
            File.ReadAllText(provider.InstructionsFile) == text);
    });

    private static void LintCatchesNamePathMismatch()
    {
        var catalog = ContentCatalog.From("# NZT\n", new Dictionary<string, string>(),
        [
            new SkillFile("nzt-build", "nzt/build",
                "---\nname: nzt-buil\ndescription: typo en el name\n---\n\ncuerpo\n"),
            new SkillFile("nzt-plan", "nzt/plan",
                "---\nname: nzt-plan\n---\n\nsin description\n")
        ]);

        var report = Linter.Run(catalog);

        Check("el lint ve el name desalineado del path",
            report.Issues.Any(i => i.Message.Contains("deriva")));
        Check("el lint ve la description faltante",
            report.Issues.Any(i => i.Message.Contains("sin description")));
    }

    // ── Mods ───────────────────────────────────────────────────────────────────

    private static void ModsFlagResolvesTheChoice()
    {
        Check("--mods all es el método y los mods", Cli.Program.ModsChoiceFor("all") == Cli.Program.ModsChoice.All);
        Check("--mods none es solo el método", Cli.Program.ModsChoiceFor("none") == Cli.Program.ModsChoice.MethodOnly);
        Check("--mods only es solo los mods", Cli.Program.ModsChoiceFor("only") == Cli.Program.ModsChoice.ModsOnly);
        Check("--mods con otro valor no elige nada", Cli.Program.ModsChoiceFor("todos") is null);
    }

    /// <summary>
    /// "Los mods" son los del marketplace del repo: el embebido tiene que ser ese
    /// mismo archivo, o el instalador ofrecería una lista distinta a la de a mano.
    /// </summary>
    private static void ModCatalogIsTheRepoMarketplace()
    {
        var root = RepoRoot();
        if (root is null)
        {
            Failures.Add("no se encontró la raíz del repo para comparar el marketplace");
            return;
        }

        var repo = ModCatalog.Parse(File.ReadAllText(Path.Combine(root, ".claude-plugin", "marketplace.json")));
        var embedded = ModCatalog.Load();

        Check("el marketplace embebido tiene mods", embedded.Names.Count > 0);
        Check("el marketplace embebido es el del repo, en su orden", embedded.Names.SequenceEqual(repo.Names));
    }

    private static void InstallsEveryModWhenClaudeIsThere() => InTemp(home =>
    {
        var (fake, claude, mods, manifests) = ModsSetup(home);

        var result = ModInstaller.Install(claude, mods, Provider.ClaudeCodeId, "1.2.0", manifestDirectory: manifests);

        Check("agrega el marketplace del repo publicado",
            fake.Marketplaces.GetValueOrDefault("nzt") == ModCatalog.MarketplaceSource && result.MarketplaceAdded);
        Check("instala cada mod del catálogo", mods.Names.All(fake.Installed.ContainsKey));
        Check("instala para toda la máquina",
            fake.Calls.Where(c => c.StartsWith("plugin install", StringComparison.Ordinal))
                .All(c => c.Contains("--scope user")));
        Check("reporta la versión que quedó instalada",
            result.Outcomes.All(o => o is { Action: ModAction.Installed, Version: "1.0.0" }));
        Check("anota en el manifiesto los mods que instaló",
            Manifest.Load(Provider.ClaudeCodeId, manifests)?.Mods?.SequenceEqual(mods.Names) == true);
    });

    private static void UsesTheNztMarketplaceAlreadyRegistered() => InTemp(home =>
    {
        var (fake, claude, mods, manifests) = ModsSetup(home);
        fake.Marketplaces["nzt"] = @"C:\dev\nzt-ai";

        var result = ModInstaller.Install(claude, mods, Provider.ClaudeCodeId, "1.2.0", manifestDirectory: manifests);

        Check("no agrega otro marketplace nzt",
            !fake.Calls.Any(c => c.StartsWith("plugin marketplace add", StringComparison.Ordinal)));
        Check("dice de dónde viene el que usa", result.MarketplaceSource == @"C:\dev\nzt-ai" && !result.MarketplaceAdded);
        Check("lo refresca para ver versiones nuevas", fake.Calls.Contains("plugin marketplace update nzt"));
    });

    private static void InstallsNoModsWithoutClaude() => InTemp(home =>
    {
        var (fake, claude, mods, manifests) = ModsSetup(home);
        fake.VersionOutput = null;

        var result = ModInstaller.Install(claude, mods, Provider.ClaudeCodeId, "1.2.0", manifestDirectory: manifests);

        Check("sin claude los mods quedan afuera y no es una falla", result.Skipped && !result.Failed);
        Check("sin claude dice por qué", result.Claude.Problem?.Contains("claude") == true);
        Check("sin claude no anota nada", Manifest.Load(Provider.ClaudeCodeId, manifests) is null);
    });

    private static void TreatsAnOldClaudeAsMissing() => InTemp(home =>
    {
        var (fake, claude, mods, manifests) = ModsSetup(home);
        fake.VersionOutput = "2.1.286 (Claude Code)";

        var result = ModInstaller.Install(claude, mods, Provider.ClaudeCodeId, "1.2.0", manifestDirectory: manifests);

        Check("una versión anterior a 2.1.287 no instala mods", result.Skipped && !fake.Changes.Any());
        Check("y dice qué versión hace falta", result.Claude.Problem?.Contains("2.1.287") == true);
    });

    private static void AFailingModDoesNotStopTheOthers() => InTemp(home =>
    {
        var (fake, claude, mods, manifests) = ModsSetup(home);
        fake.Failing.Add("nzt-files");

        var result = ModInstaller.Install(claude, mods, Provider.ClaudeCodeId, "1.2.0", manifestDirectory: manifests);

        Check("un mod que falla se reporta como falla", result.Failed);
        Check("nombra el que falló y el motivo",
            result.Outcomes.Single(o => o.Name == "nzt-files") is { Action: ModAction.Failed, Detail: not null });
        Check("los demás quedan instalados",
            fake.Installed.ContainsKey("nzt-state") && fake.Installed.ContainsKey("nzt-changes"));
        Check("el que falló no queda en el manifiesto",
            Manifest.Load(Provider.ClaudeCodeId, manifests)?.Mods?.Contains("nzt-files") == false);
    });

    private static void UpdatesAModInstalledByHandWithoutOwningIt() => InTemp(home =>
    {
        var (fake, claude, mods, manifests) = ModsSetup(home);
        fake.Marketplaces["nzt"] = ModCatalog.MarketplaceSource;
        fake.Installed["nzt-state"] = "0.3.0";
        fake.Latest["nzt-state"] = "0.4.0";

        var result = ModInstaller.Install(claude, mods, Provider.ClaudeCodeId, "1.2.0", manifestDirectory: manifests);

        Check("actualiza el mod instalado a mano", fake.Installed["nzt-state"] == "0.4.0");
        Check("no lo instala dos veces", !fake.Calls.Contains("plugin install nzt-state@nzt --scope user --json"));
        Check("lo reporta actualizado y de usuario",
            result.Outcomes.Single(o => o.Name == "nzt-state") is { Action: ModAction.Updated, Version: "0.4.0", ByUser: true });
        Check("no lo anota como suyo",
            Manifest.Load(Provider.ClaudeCodeId, manifests)?.Mods?.Contains("nzt-state") == false);
    });

    private static void ModsDryRunChangesNothing() => InTemp(home =>
    {
        var (fake, claude, mods, manifests) = ModsSetup(home);
        fake.Installed["nzt-state"] = "0.4.0";

        var result = ModInstaller.Install(claude, mods, Provider.ClaudeCodeId, "1.2.0", dryRun: true,
            manifestDirectory: manifests);

        Check("la simulación no instala ni agrega nada", !fake.Changes.Any());
        Check("la simulación no escribe el manifiesto", Manifest.Load(Provider.ClaudeCodeId, manifests) is null);
        Check("la simulación lista cada mod con lo que haría",
            result.Outcomes.Count == mods.Names.Count
            && result.Outcomes.Single(o => o.Name == "nzt-state") is { Action: ModAction.Updated, Version: "0.4.0" }
            && result.Outcomes.Single(o => o.Name == "nzt-files").Action == ModAction.Installed);
    });

    /// <summary>
    /// El método y los mods comparten el manifiesto de Claude Code: reinstalar o
    /// sacar el método no puede olvidar qué mods son del instalador.
    /// </summary>
    private static void TheMethodKeepsTheModsInTheManifest() => InTemp(home =>
    {
        var (fake, claude, mods, manifests) = ModsSetup(home);
        var (provider, catalog, _) = Setup(home);
        ModInstaller.Install(claude, mods, Provider.ClaudeCodeId, "1.2.0", manifestDirectory: manifests);

        Installer.Install(provider, catalog, "1.2.0", manifestDirectory: manifests);
        Check("instalar el método conserva los mods",
            Manifest.Load(provider.Id, manifests)?.Mods?.Count == mods.Names.Count);

        Installer.Uninstall(provider, manifestDirectory: manifests);
        var left = Manifest.Load(provider.Id, manifests);
        Check("sacar el método deja el manifiesto con los mods", left is { Files.Count: 0 } && left.Mods?.Count == mods.Names.Count);
        Check("sin el método, desinstalarlo otra vez no encuentra nada",
            !Installer.Uninstall(provider, manifestDirectory: manifests).HadManifest);
    });

    private static void ReinstallingUpdatesTheModsItInstalled() => InTemp(home =>
    {
        var (fake, claude, mods, manifests) = ModsSetup(home);
        ModInstaller.Install(claude, mods, Provider.ClaudeCodeId, "1.2.0", manifestDirectory: manifests);
        fake.Latest["nzt-state"] = "1.1.0";
        fake.Calls.Clear();

        var again = ModInstaller.Install(claude, mods, Provider.ClaudeCodeId, "1.2.0", manifestDirectory: manifests);

        Check("reinstalar actualiza el mod que tiene versión nueva",
            again.Outcomes.Single(o => o.Name == "nzt-state") is { Action: ModAction.Updated, Version: "1.1.0", ByUser: false });
        Check("reinstalar deja al día los que no cambiaron",
            again.Outcomes.Where(o => o.Name != "nzt-state").All(o => o.Action == ModAction.Unchanged));
        Check("reinstalar no instala de nuevo",
            !fake.Calls.Any(c => c.StartsWith("plugin install", StringComparison.Ordinal)));
    });

    private static void UninstallRemovesOnlyTheModsItInstalled() => InTemp(home =>
    {
        var (fake, claude, mods, manifests) = ModsSetup(home);
        fake.Installed["nzt-files"] = "0.1.1";
        ModInstaller.Install(claude, mods, Provider.ClaudeCodeId, "1.2.0", manifestDirectory: manifests);

        var result = ModInstaller.Uninstall(claude, mods, Provider.ClaudeCodeId, manifestDirectory: manifests);

        Check("desinstala los mods que instaló",
            !fake.Installed.ContainsKey("nzt-state") && !fake.Installed.ContainsKey("nzt-changes"));
        Check("deja el que el usuario instaló a mano",
            fake.Installed.ContainsKey("nzt-files")
            && result.Outcomes.Single(o => o.Name == "nzt-files") is { Action: ModAction.Kept, ByUser: true });
        Check("nunca quita el marketplace",
            !fake.Calls.Any(c => c.StartsWith("plugin marketplace remove", StringComparison.Ordinal))
            && fake.Marketplaces.ContainsKey("nzt"));
        Check("sin nada que administrar, el manifiesto se borra", Manifest.Load(Provider.ClaudeCodeId, manifests) is null);
    });

    private static void UninstallForgetsAModTheUserAlreadyRemoved() => InTemp(home =>
    {
        var (fake, claude, mods, manifests) = ModsSetup(home);
        ModInstaller.Install(claude, mods, Provider.ClaudeCodeId, "1.2.0", manifestDirectory: manifests);
        fake.Installed.Remove("nzt-state");

        var result = ModInstaller.Uninstall(claude, mods, Provider.ClaudeCodeId, dryRun: false,
            manifestDirectory: manifests);

        Check("no intenta desinstalar un mod que ya no está",
            !fake.Calls.Contains("plugin uninstall nzt-state@nzt --scope user --json"));
        Check("lo reporta como que ya no estaba",
            result.Outcomes.Single(o => o.Name == "nzt-state").Action == ModAction.Missing && !result.Failed);
    });

    private static void AModThatFailsToUninstallStaysOwned() => InTemp(home =>
    {
        var (fake, claude, mods, manifests) = ModsSetup(home);
        ModInstaller.Install(claude, mods, Provider.ClaudeCodeId, "1.2.0", manifestDirectory: manifests);
        fake.Failing.Add("nzt-changes");

        var result = ModInstaller.Uninstall(claude, mods, Provider.ClaudeCodeId, manifestDirectory: manifests);

        Check("un mod que no se pudo desinstalar es una falla", result.Failed);
        Check("sigue siendo del instalador, para la próxima vez",
            Manifest.Load(Provider.ClaudeCodeId, manifests)?.Mods is ["nzt-changes"]);
    });

    private static void ModsUninstallDryRunChangesNothing() => InTemp(home =>
    {
        var (fake, claude, mods, manifests) = ModsSetup(home);
        ModInstaller.Install(claude, mods, Provider.ClaudeCodeId, "1.2.0", manifestDirectory: manifests);
        fake.Calls.Clear();

        var result = ModInstaller.Uninstall(claude, mods, Provider.ClaudeCodeId, dryRun: true,
            manifestDirectory: manifests);

        Check("la simulación de desinstalar no saca nada", !fake.Changes.Any() && fake.Installed.Count == 3);
        Check("la simulación lista lo que sacaría", result.Outcomes.All(o => o.Action == ModAction.Removed));
        Check("la simulación no toca el manifiesto",
            Manifest.Load(Provider.ClaudeCodeId, manifests)?.Mods?.Count == 3);
    });

    private static void UninstallingTheModsKeepsTheMethod() => InTemp(home =>
    {
        var (_, claude, mods, manifests) = ModsSetup(home);
        var (provider, catalog, _) = Setup(home);
        Installer.Install(provider, catalog, "1.2.0", manifestDirectory: manifests);
        ModInstaller.Install(claude, mods, Provider.ClaudeCodeId, "1.2.0", manifestDirectory: manifests);

        ModInstaller.Uninstall(claude, mods, Provider.ClaudeCodeId, manifestDirectory: manifests);
        var left = Manifest.Load(provider.Id, manifests);

        Check("sacar solo los mods deja el método instalado",
            File.Exists(provider.InstructionsFile) && left is { Files.Count: 4 });
        Check("y el manifiesto ya no anota mods", left?.Mods is null or []);
    });

    private static void StatusSaysWhoInstalledEachMod() => InTemp(home =>
    {
        var (fake, claude, mods, manifests) = ModsSetup(home);
        fake.Installed["nzt-files"] = "0.1.1";
        ModInstaller.Install(claude, ModCatalog.From(["nzt-state", "nzt-files"]), Provider.ClaudeCodeId, "1.2.0",
            manifestDirectory: manifests);
        fake.Calls.Clear();

        var status = ModInstaller.Status(claude, mods, Provider.ClaudeCodeId, manifests);

        Check("el estado no cambia nada", !fake.Changes.Any());
        Check("el estado dice el que instaló NZT, con su versión",
            status.Outcomes.Single(o => o.Name == "nzt-state") is { Action: ModAction.Installed, Version: "1.0.0", ByUser: false });
        Check("el estado dice el instalado a mano",
            status.Outcomes.Single(o => o.Name == "nzt-files") is { Action: ModAction.Installed, ByUser: true });
        Check("el estado dice el que no está",
            status.Outcomes.Single(o => o.Name == "nzt-changes").Action == ModAction.Missing);
    });

    private static (FakeClaude fake, ClaudePlugins claude, ModCatalog mods, string manifests) ModsSetup(string home)
    {
        var fake = new FakeClaude();
        return (fake, new ClaudePlugins(fake), ModCatalog.From(["nzt-state", "nzt-changes", "nzt-files"]),
            Path.Combine(home, "manifests"));
    }

    // ── Andamio ────────────────────────────────────────────────────────────────

    private static (Provider provider, ContentCatalog catalog, string manifests) Setup(string home)
    {
        var provider = Provider.ClaudeCode(home);
        var catalog = ContentCatalog.From(
            "# NZT\n\nkernel de prueba\n",
            new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                ["adapter-claude.md"] = "## Claude\n",
                ["adapter-codex.md"] = "## Codex\n"
            },
            [
                Skill("nzt", "---\nname: nzt\ndescription: router raíz\n---\n\ncuerpo\n"),
                Skill("nzt-build", "---\nname: nzt-build\ndescription: router de build\n---\n\ncuerpo\n"),
                Skill("nzt-build-implement",
                    "---\nname: nzt-build-implement\ndescription: hoja\n---\n\ncuerpo\n")
            ]);

        return (provider, catalog, Path.Combine(home, "manifests"));
    }

    /// <summary>
    /// La opción del menú tiene que resolver al proveedor que dice, y sobre todo
    /// **no** resolver a ninguno cuando no se eligió: instalar y desinstalar
    /// arrancan de acá, y "ninguno" es lo que hace que volver no escriba nada.
    /// </summary>
    private static void MenuChoiceResolvesTheProvider()
    {
        Check("Claude Code resuelve a claude-code",
            Cli.Program.ProvidersFor(Cli.Program.ProviderChoice.ClaudeCode) is [{ Id: "claude-code" }]);
        Check("Codex resuelve a codex",
            Cli.Program.ProvidersFor(Cli.Program.ProviderChoice.Codex) is [{ Id: "codex" }]);
        Check("todos resuelve a todos",
            Cli.Program.ProvidersFor(Cli.Program.ProviderChoice.All).Count == Provider.All.Count);
        Check("volver no elige ninguno",
            Cli.Program.ProvidersFor(Cli.Program.ProviderChoice.Back).Count == 0);
    }

    private static SkillFile Skill(string name, string text) =>
        new(name, name.Replace('-', '/'), text);

    // ── nzt-ai ─────────────────────────────────────────────────────────────────
    // Siempre con una carpeta explícita: así CliCommand no toca el PATH real.

    private static void LeavesTheCliInstalledAndUpdatesIt() => InTemp(home =>
    {
        var source = Path.Combine(home, "nzt-release");
        File.WriteAllText(source, "binario 1");
        var bin = Path.Combine(home, "bin");

        var first = CliCommand.Install(source, dryRun: false, bin);
        Check("instala nzt-ai", first.Action == CliAction.Installed && File.Exists(CliCommand.PathFor(bin)));
        Check("con una carpeta explícita no toca el PATH", !first.PathChanged && first.PathLine is null);

        Check("reinstalar el mismo binario no cambia nada",
            CliCommand.Install(source, dryRun: false, bin).Action == CliAction.Unchanged);

        File.WriteAllText(source, "binario 2");
        var updated = CliCommand.Install(source, dryRun: false, bin);
        Check("reinstalar otra versión la reemplaza",
            updated.Action == CliAction.Updated && File.ReadAllText(CliCommand.PathFor(bin)) == "binario 2");
    });

    private static void CliDryRunWritesNothing() => InTemp(home =>
    {
        var source = Path.Combine(home, "nzt-release");
        File.WriteAllText(source, "binario");
        var bin = Path.Combine(home, "bin");

        var result = CliCommand.Install(source, dryRun: true, bin);
        Check("la simulación dice que instalaría nzt-ai", result.Action == CliAction.Installed);
        Check("la simulación no copia nzt-ai", !File.Exists(CliCommand.PathFor(bin)));
    });

    private static void CliFromTheRepoIsNotInstalled() => InTemp(home =>
    {
        var bin = Path.Combine(home, "bin");
        Check("sin binario de un solo archivo no instala nzt-ai",
            CliCommand.Install(null, dryRun: false, bin).Action == CliAction.NotSingleFile
            && !File.Exists(CliCommand.PathFor(bin)));
        Check("las comprobaciones corren desde el repo, no como binario único",
            CliCommand.RunningSingleFile() is null);
    });

    private static void UninstallRemovesTheCli() => InTemp(home =>
    {
        var source = Path.Combine(home, "nzt-release");
        File.WriteAllText(source, "binario");
        var bin = Path.Combine(home, "bin");
        CliCommand.Install(source, dryRun: false, bin);

        Check("la simulación de desinstalar no borra nzt-ai",
            CliCommand.Uninstall(dryRun: true, bin).Action == CliAction.Removed && File.Exists(CliCommand.PathFor(bin)));
        Check("desinstalar saca nzt-ai",
            CliCommand.Uninstall(dryRun: false, bin).Action == CliAction.Removed && !File.Exists(CliCommand.PathFor(bin)));
        Check("sin nzt-ai instalado no hay nada que sacar",
            CliCommand.Uninstall(dryRun: false, bin).Action == CliAction.NotInstalled);
    });

    // ── state check ────────────────────────────────────────────────────────────

    private static StateReport CheckState(string home, string json)
    {
        Directory.CreateDirectory(Path.Combine(home, "Plan"));
        File.WriteAllText(Path.Combine(home, StateCheck.RelativePath), json);
        return StateCheck.Run(home);
    }

    private static void StateCheckAcceptsAValidState() => InTemp(home =>
    {
        var report = CheckState(home, """
            { "version": 1, "approved": true,
              "phases": [
                { "name": "analysis", "status": "done", "units": [{ "id": 1, "status": "done" }] },
                { "name": "build", "status": "doing", "units": [
                  { "id": 2, "status": "doing" }, { "id": 3, "status": "todo" }] },
                { "name": "verify", "status": "todo", "units": [] }],
              "autonomy": { "units": [2, 3], "keep_stops": [3] } }
            """);
        Check("un estado que cumple el contrato no tiene problemas", report.Found && report.Ok);
    });

    private static void StateCheckWithoutAFileIsNotAnError() => InTemp(home =>
    {
        var report = StateCheck.Run(home);
        Check("sin Plan/state.json no hay nada que revisar", !report.Found && report.Ok);
    });

    private static void StateCheckCatchesEveryBrokenInvariant() => InTemp(home =>
    {
        var report = CheckState(home, """
            { "approved": "yes",
              "phases": [
                { "name": "analysis", "status": "done", "units": [{ "id": 1, "status": "todo" }] },
                { "name": "build", "status": "doing", "units": [
                  { "id": 2, "status": "doing" }, { "id": 2, "status": "running" }] },
                { "name": "verify", "status": "doing", "units": [{ "id": 4, "status": "doing" }] },
                { "name": "ship", "status": "todo", "units": [{ "id": 5, "status": "doing" }] },
                { "name": "discusion", "status": "todo", "units": [] }],
              "autonomy": { "units": [9] }, "delegation": "always" }
            """);

        bool Says(string text) => report.Problems.Any(p => p.Contains(text));
        Check("approved que no es booleano", Says("approved tiene que ser true o false"));
        Check("un id repetido", Says("el id 2 se repite"));
        Check("un status que el kernel no define", Says("'running'"));
        Check("más de una fase en doing", Says("hay 2 fases en doing"));
        Check("más de una unidad en doing", Says("hay 3 unidades en doing"));
        Check("una unidad en doing fuera de la fase en doing", Says("la unidad 5 está en doing, pero su fase 'ship'"));
        Check("una fase done con unidades pendientes", Says("la fase 'analysis' está done con la unidad 1 en todo"));
        Check("autonomy que nombra una unidad que no existe", Says("autonomy.units nombra la unidad 9"));
        Check("una fase que no es de NZT", Says("la fase 'discusion' no es una fase de NZT"));
        Check("las fases de NZT no se marcan", !Says("la fase 'build' no es una fase"));
        Check("un modo de delegación que no existe", Says("delegation es 'always'"));
    });

    private static void StateCheckAcceptsEachDelegationModeAndItsAbsence() => InTemp(home =>
    {
        const string plan = """{ "approved": true, "phases": [] """;
        Check("sin delegation el estado cumple", CheckState(home, plan + "}").Ok);
        foreach (var mode in new[] { "auto", "ask", "off" })
            Check($"delegation {mode} cumple", CheckState(home, plan + $", \"delegation\": \"{mode}\" }}").Ok);
        Check("delegation que no es texto no cumple",
            CheckState(home, plan + ", \"delegation\": true }").Problems.Any(p => p.Contains("delegation es 'true'")));
    });

    private static void StateCheckAcceptsAParallelGroup() => InTemp(home =>
    {
        var report = CheckState(home, """
            { "approved": true, "work_branch": "nzt/run-12",
              "phases": [{ "name": "build", "status": "doing", "units": [
                { "id": 12, "status": "doing", "group": "P1", "model": "small" },
                { "id": 13, "status": "doing", "group": "P1" },
                { "id": 14, "status": "todo", "group": "P1", "model": "main" }] }] }
            """);
        Check("las unidades de un grupo en paralelo pueden estar en doing juntas", report.Ok);
    });

    private static void StateCheckCatchesEveryBrokenParallelGroup() => InTemp(home =>
    {
        var report = CheckState(home, """
            { "approved": true,
              "phases": [
                { "name": "build", "status": "doing", "units": [
                  { "id": 1, "status": "doing", "group": "P1" },
                  { "id": 2, "status": "doing", "group": "P2" },
                  { "id": 3, "status": "todo", "group": "", "model": "huge" },
                  { "id": 4, "status": "todo", "model": "small" }] },
                { "name": "verify", "status": "todo", "units": [
                  { "id": 5, "status": "todo", "group": "P1" }] }] }
            """);

        bool Says(string text) => report.Problems.Any(p => p.Contains(text));
        Check("dos grupos en doing a la vez", Says("hay 2 unidades en doing (1, 2); a lo sumo una, o las de un mismo grupo"));
        Check("un group vacío", Says("la unidad 3 tiene group ''"));
        Check("un model que no existe", Says("la unidad 3 tiene model 'huge'"));
        Check("un model sin group", Says("la unidad 4 tiene model sin group"));
        Check("un grupo repartido en dos fases", Says("el grupo P1 tiene unidades en 'build' y en 'verify'"));
        Check("grupos sin rama de trabajo", Says("falta work_branch"));
    });

    private static void StateCheckReportsBrokenJson() => InTemp(home =>
    {
        var report = CheckState(home, "{ \"phases\": [ }");
        Check("un JSON roto es un problema con su línea",
            report.Found && report.Problems.Count == 1 && report.Problems[0].Contains("no es JSON válido, línea 1"));
    });

    private static void StateCheckAcceptsASlicedState() => InTemp(home =>
    {
        var report = CheckState(home, """
            { "version": 2, "approved": true, "cadence": "delivery",
              "slices": [
                { "id": "S1", "name": "Análisis de la entrega 1", "status": "done", "phases": [
                  { "name": "analysis", "status": "done", "units": [{ "id": 1, "status": "done" }] }] },
                { "id": "S2", "name": "F-003 Cupones", "status": "doing", "phases": [
                  { "name": "build", "status": "doing", "units": [
                    { "id": 2, "status": "done" }, { "id": 3, "status": "doing" }] },
                  { "name": "verify", "status": "todo", "units": [{ "id": 4, "status": "todo" }] }] },
                { "id": "S3", "name": "Release", "status": "todo", "phases": [
                  { "name": "ship", "status": "todo", "units": [] }] }],
              "autonomy": { "units": [3, 4] } }
            """);
        Check("un estado por tramos que cumple el contrato no tiene problemas", report.Found && report.Ok);
        foreach (var cadence in new[] { "upfront", "just-in-time" })
            Check($"cadence {cadence} cumple", CheckState(home, $$"""
                { "version": 2, "approved": true, "cadence": "{{cadence}}", "slices": [] }
                """).Ok);
        Check("sin cadence el estado por tramos cumple",
            CheckState(home, """{ "version": 2, "approved": true, "slices": [] }""").Ok);
    });

    private static void StateCheckCatchesEveryBrokenSliceInvariant() => InTemp(home =>
    {
        var report = CheckState(home, """
            { "version": 2, "approved": true, "cadence": "sprint",
              "slices": [
                { "id": "S1", "status": "done", "phases": [
                  { "name": "analysis", "status": "done", "units": [{ "id": 1, "status": "done" }] },
                  { "name": "build", "status": "todo", "units": [{ "id": 2, "status": "todo" }] }] },
                { "id": "S2", "status": "doing", "phases": [
                  { "name": "build", "status": "doing", "units": [{ "id": 3, "status": "doing" }] },
                  { "name": "verify", "status": "doing", "units": [{ "id": 3, "status": "todo" }] },
                  { "name": "build", "status": "todo", "units": [] }] },
                { "id": "S2", "status": "doing", "phases": [] },
                { "id": "S4", "status": "todo", "phases": [
                  { "name": "build", "status": "doing", "units": [{ "id": 5, "status": "doing" }] }] },
                { "status": "todo" }] }
            """);

        bool Says(string text) => report.Problems.Any(p => p.Contains(text));
        Check("una cadencia que no existe", Says("cadence es 'sprint'"));
        Check("un tramo done con una fase pendiente", Says("el tramo S1 está done con su fase 'build' en 'todo'"));
        Check("dos fases en doing en un tramo", Says("hay 2 fases en doing en el tramo S2"));
        Check("una fase repetida en un tramo", Says("la fase 'build' se repite en el tramo S2"));
        Check("un id de tramo repetido", Says("el tramo S2 se repite"));
        Check("más de un tramo en doing", Says("hay 2 tramos en doing"));
        Check("una fase en doing fuera del tramo en doing", Says("la fase 'build' del tramo S4 está en doing, pero su tramo está en 'todo'"));
        Check("un id de unidad repetido entre fases", Says("el id 3 se repite"));
        Check("más de una unidad en doing entre tramos", Says("hay 2 unidades en doing"));
        Check("un tramo sin id", Says("el tramo #5 no tiene id de texto"));
        Check("un tramo sin fases", Says("el tramo #5 no tiene phases"));
    });

    private static void StateCheckRejectsAMixedOrUnversionedSlicedState() => InTemp(home =>
    {
        Check("phases y slices juntos no cumple",
            CheckState(home, """{ "version": 2, "approved": true, "phases": [], "slices": [] }""")
                .Problems.Any(p => p.Contains("phases y slices juntos")));
        Check("slices sin version 2 no cumple",
            CheckState(home, """{ "version": 1, "approved": true, "slices": [] }""")
                .Problems.Any(p => p.Contains("slices pide version 2, y version es '1'")));
        Check("version 2 sin slices no cumple",
            CheckState(home, """{ "version": 2, "approved": true, "phases": [] }""")
                .Problems.Any(p => p.Contains("version 2 pide slices")));
        Check("un v1 con una fase repetida se sigue leyendo como antes",
            CheckState(home, """
                { "version": 1, "approved": true, "phases": [
                  { "name": "build", "status": "done", "units": [] },
                  { "name": "build", "status": "todo", "units": [] }] }
                """).Ok);
    });

    private static void StateCheckAcceptsTheRepoState()
    {
        var root = RepoRoot();
        var report = root is null ? null : StateCheck.Run(root);
        Check("el Plan/state.json de este repo cumple el contrato", report is { Found: true, Ok: true });
    }

    private static void InTemp(Action<string> body)
    {
        var home = Path.Combine(Path.GetTempPath(), "nzt-checks-" + Guid.NewGuid().ToString("n")[..8]);
        Directory.CreateDirectory(home);
        try { body(home); }
        finally { try { Directory.Delete(home, recursive: true); } catch (IOException) { } }
    }

    private static string? RepoRoot()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir is not null && !File.Exists(Path.Combine(dir.FullName, "core", "kernel.md")))
            dir = dir.Parent;
        return dir?.FullName;
    }

    private static void Check(string what, bool ok)
    {
        if (ok) { _passed++; Console.WriteLine($"  ok    {what}"); }
        else Failures.Add(what);
    }
}
