using Nzt.Cli.Content;
using Nzt.Cli.Install;
using Nzt.Cli.Lint;
using Nzt.Cli.Providers;

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
