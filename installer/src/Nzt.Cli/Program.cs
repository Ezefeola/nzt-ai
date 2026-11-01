using System.Diagnostics;
using System.Reflection;
using Nzt.Cli.Content;
using Nzt.Cli.Install;
using Nzt.Cli.Lint;
using Nzt.Cli.Mods;
using Nzt.Cli.Providers;
using Nzt.Cli.State;

namespace Nzt.Cli;

public static partial class Program
{
    private static readonly string Version =
        Assembly.GetExecutingAssembly().GetName().Version?.ToString(3) ?? "0.0.0";

    // Dónde queda nzt-ai. Con `--bin-dir` no se toca el PATH: lo usan las comprobaciones.
    private static string? _binDir;

    public static int Main(string[] args)
    {
        try
        {
            return Run(args);
        }
        catch (Exception ex)
        {
            Error(ex.Message);
            return 1;
        }
    }

    private static int Run(string[] args)
    {
        if (args.Contains("--version")) return Line(Version);

        var command = args.FirstOrDefault(a => !a.StartsWith('-'))?.ToLowerInvariant();
        var dryRun = args.Contains("--dry-run");
        var manifestDir = ValueOf(args, "--manifest-dir");
        _binDir = ValueOf(args, "--bin-dir");
        if (OperatingSystem.IsWindows()) Updater.CleanUp(CliCommand.PathFor(_binDir));

        var modsValue = ValueOf(args, "--mods");
        var mods = modsValue is null ? null : ModsChoiceFor(modsValue);
        if (modsValue is not null && mods is null)
            return Fail($"--mods desconocido: {modsValue}. Son all, none u only.");

        var scopeValue = ValueOf(args, "--scope")?.ToLowerInvariant();
        if (scopeValue is not (null or "user" or "project"))
            return Fail($"--scope desconocido: {scopeValue}. Son user o project.");
        var scope = scopeValue == "project" ? Scope.Project : Scope.User;

        var modeValue = ValueOf(args, "--mode")?.ToLowerInvariant();
        if (modeValue is not (null or "personal" or "shared"))
            return Fail($"--mode desconocido: {modeValue}. Son personal o shared.");
        if (modeValue is not null && scope != Scope.Project)
            return Fail("--mode solo vale con --scope project.");

        // Los mods siguen siendo globales (RN-proy-mods).
        if (modsValue is not null && scope == Scope.Project)
            return Fail("Los mods son globales: --mods no vale con --scope project. No se tocó nada.");

        var projectsValue = ValueOf(args, "--projects")?.ToLowerInvariant();
        if (projectsValue is not (null or "all" or "none"))
            return Fail($"--projects desconocido: {projectsValue}. Son all o none.");

        // Instalar sin --mods es solo el método, como la línea de siempre; desinstalar
        // saca también los mods que instaló este CLI.
        return command switch
        {
            null => Menu(),
            "init" => Init(manifestDir),
            "install" => Install(ProvidersFrom(args, scope, modeValue != "shared", manifestDir), dryRun, manifestDir,
                mods ?? ModsChoice.MethodOnly),
            "uninstall" when args.Contains("--all") => UninstallAll(dryRun, manifestDir),
            "uninstall" => Uninstall(ProvidersFrom(args, scope, personal: true, manifestDir), dryRun, manifestDir,
                mods ?? ModsChoice.All),
            "update" => args.Contains("--apply")
                ? Apply(dryRun, manifestDir, projectsValue)
                : Update(dryRun, manifestDir, projectsValue),
            "status" => Status(manifestDir),
            "lint" or "verify" => Lint(detailed: false),
            "state" => SubcommandOf(args) == "check"
                ? State(Directory.GetCurrentDirectory())
                : Fail("Falta el subcomando: nzt-ai state check."),
            "help" or "--help" or "-h" => Help(),
            _ => Fail($"Comando desconocido: {command}")
        };
    }

    private static int Help()
    {
        Console.WriteLine($"""
            NZT installer {Version}

              nzt-ai                                    menú interactivo
              nzt-ai init                               el menú, en "Instalar en este proyecto"
              nzt-ai install --provider <id> [--scope user|project] [--mode personal|shared]
                             [--mods all|none|only] [--dry-run]
              nzt-ai uninstall --provider <id> [--scope user|project] [--mods all|none|only] [--dry-run]
              nzt-ai uninstall --all [--dry-run]        global, proyectos, mods de NZT y nzt-ai
              nzt-ai update [--projects all|none] [--dry-run]
              nzt-ai status
              nzt-ai lint | verify
              nzt-ai state check                        revisa Plan/state.json de esta carpeta
              nzt-ai --version

            Proveedores: claude-code, codex, all
            Alcance: user (por defecto) o project, el repo de esta carpeta. Global y proyecto
            no conviven por proveedor. Modo en un proyecto: personal (por defecto, nada en el
            diff de git) o shared (para commitear).
            Mods (solo Claude Code, siempre globales): all = el método y los mods, none = solo
            el método, only = solo los mods. Instalar sin --mods es none; desinstalar, all.
            """);
        return 0;
    }

    /// <summary>Qué se instala o se saca en Claude Code. `All` va primero: es la marcada al abrir.</summary>
    public enum ModsChoice { All, MethodOnly, ModsOnly, Back }

    /// <summary>El valor de `--mods`. `null` si no es uno de los tres.</summary>
    public static ModsChoice? ModsChoiceFor(string value) => value.ToLowerInvariant() switch
    {
        "all" => ModsChoice.All,
        "none" => ModsChoice.MethodOnly,
        "only" => ModsChoice.ModsOnly,
        _ => null
    };

    // ── Instalar ───────────────────────────────────────────────────────────────

    private static int Install(IReadOnlyList<Provider> providers, bool dryRun, string? manifestDir,
        ModsChoice mods)
    {
        if (providers.Count == 0) return 1;

        var installsMethod = mods != ModsChoice.ModsOnly;
        var catalog = ContentCatalog.Load();
        var report = Linter.Run(catalog);

        // El instalador no escribe nada si el set no valida: una skill con el
        // name desalineado del path se instala con un nombre que nadie rutea.
        if (installsMethod && !report.Ok)
        {
            Error($"El set no valida: {report.Issues.Count} problema(s). No se escribió nada.");
            foreach (var issue in report.Issues.Take(20))
                Console.WriteLine($"    {issue.Where}: {issue.Message}");
            return 1;
        }

        var failed = false;

        foreach (var provider in providers)
        {
            Console.WriteLine($"{provider.DisplayName} · {provider.ScopeLabel}{(dryRun ? "  (simulación)" : "")}");

            if (!provider.HasMods && mods != ModsChoice.MethodOnly)
                Console.WriteLine(installsMethod
                    ? $"  {provider.DisplayName} no tiene mods: se instala el método."
                    : $"  {provider.DisplayName} no tiene mods: no se instala nada.");

            if (installsMethod && !InstallMethod(provider, catalog, dryRun, manifestDir)) failed = true;

            if (provider.HasMods && provider.Scope == Scope.User && mods != ModsChoice.MethodOnly
                && !InstallMods(provider, dryRun, manifestDir, methodSkipped: !installsMethod))
                failed = true;

            Console.WriteLine();
        }

        if (!dryRun) SyncProjects(providers, manifestDir);

        ReportCli(CliCommand.Install(CliCommand.RunningSingleFile(), dryRun, _binDir), dryRun);

        if (!installsMethod) return failed ? 1 : 0;

        Console.WriteLine($"{report.SkillCount} skills · ~{report.ListingChars} chars de listado"
            + $" (piso de Codex: {LintReport.CodexFloor})");
        if (report.OverListingFloor)
            Warn("el listado pasa el piso de 8.000. Con contexto desconocido Codex acorta "
                + "descriptions y puede omitir skills del listado (R1/C2).");

        return failed ? 1 : 0;
    }

    private static bool InstallMethod(Provider provider, ContentCatalog catalog, bool dryRun, string? manifestDir)
    {
        if (Blocker(provider, manifestDir) is { } blocker)
        {
            Error(blocker);
            return false;
        }

        if (provider.PathWarning is { } warning) Warn(warning);
        if (provider.AgentsWarning is { } agents) Warn(agents);
        if (TrackedAgentsWarning(provider, manifestDir) is { } tracked) Warn(tracked);

        // Una global con proyectos de ese proveedor los tapa (RN-proy-exclusivo).
        if (provider.Scope == Scope.User)
            foreach (var project in ProjectsWith(provider.Id, manifestDir))
                Warn($"{project.Path} tiene NZT en {provider.DisplayName}: la global lo va a tapar.");

        var result = Installer.Install(provider, catalog, Version, dryRun, manifestDir);

        if (result.Aborted)
        {
            Error("No se instaló el método en este proveedor:");
            foreach (var conflict in result.Conflicts)
                Console.WriteLine($"    {conflict.TargetPath}\n      {conflict.Reason}");
            return false;
        }

        Console.WriteLine($"  instrucciones  {provider.InstructionsFile}");
        Console.WriteLine($"  skills         {provider.SkillsDirectory}");
        Console.WriteLine($"  agentes        {provider.AgentsDirectory}");
        if (provider.CreatedSuffix is not null && !File.Exists(provider.InstructionsFile))
            Console.WriteLine("  importa        AGENTS.md, para que Claude Code lo siga leyendo");
        if (provider.Scope == Scope.Project)
            Console.WriteLine(provider.Project!.IsGitRepo
                ? provider.Personal
                    ? "  git            lo que se crea va a .git/info/exclude: no aparece en el diff"
                    : "  git            compartido: para commitear"
                : "  git            sin repo: no hay nada que excluir");
        Summary(result.Outcomes);

        foreach (var skipped in result.Outcomes.Where(o => o.Action == FileAction.SkippedLocallyEdited))
            Warn($"editado localmente, se conserva: {skipped.TargetPath}");

        if (!dryRun) Console.WriteLine($"  {provider.Usage}");
        return true;
    }

    /// <summary>
    /// Lo que impide instalar en un proyecto sin escribir nada: la global del mismo
    /// proveedor (RN-proy-exclusivo) o un proyecto con una versión más nueva que
    /// este CLI (RN-proy-version).
    /// </summary>
    private static string? Blocker(Provider provider, string? manifestDir)
    {
        if (provider.Scope != Scope.Project) return null;

        if (Manifest.Load(provider.Id, manifestDir) is { Files.Count: > 0 })
            return $"{provider.DisplayName} está instalado global, y la global taparía este proyecto. "
                + $"Desinstalala primero: nzt-ai uninstall --provider {provider.Id}. No se escribió nada.";

        return NewerProject(provider, manifestDir);
    }

    private static string? NewerProject(Provider provider, string? manifestDir) =>
        Installer.LoadManifest(provider, manifestDir) is { } manifest && IsNewer(manifest.Version, Version)
            ? $"Este proyecto tiene NZT {manifest.Version} en {provider.DisplayName}, más nuevo que este "
              + $"{CliCommand.Name} ({Version}). Actualizalo primero: nzt-ai update. No se tocó nada."
            : null;

    /// <summary>
    /// Codex no tiene instrucciones solo del usuario (RN-proy-codex-personal): en
    /// *Solo para mí*, un `AGENTS.md` que git versiona va a mostrar el bloque en el diff.
    /// </summary>
    private static string? TrackedAgentsWarning(Provider provider, string? manifestDir)
    {
        if (provider is not { Scope: Scope.Project, Id: Provider.CodexId, Personal: true }) return null;
        if (!File.Exists(provider.InstructionsFile)) return null;
        if (Installer.LoadManifest(provider, manifestDir)?.Files.Any(f => f is { ManagedBlock: true, Created: true }) == true)
            return null;

        var git = new ProcessRunner().Run("git",
            ["-C", provider.Project!.Path, "ls-files", "--error-unmatch", "--", "AGENTS.md"]);
        if (git is { Ok: false }) return null;

        return git is null
            ? "AGENTS.md ya existe y Codex no tiene instrucciones solo del usuario: si git lo versiona, "
              + "el bloque de NZT va a aparecer en el diff."
            : "AGENTS.md está versionado y Codex no tiene instrucciones solo del usuario: el bloque de NZT "
              + "va a aparecer en el diff.";
    }

    /// <summary>Después de escribir en un proyecto: su exclude y el registro, al día.</summary>
    private static void SyncProjects(IEnumerable<Provider> providers, string? manifestDir)
    {
        foreach (var project in providers.Where(p => p.Project is not null).Select(p => p.Project!)
                     .DistinctBy(p => p.Path, StringComparer.OrdinalIgnoreCase))
        {
            GitExclude.Sync(project);
            ProjectRegistry.Sync(project, manifestDir);
        }
    }

    /// <summary>
    /// Los mods, con los comandos de Claude Code. Sin Claude Code en la terminal no
    /// es una falla: el método queda instalado y se explica cómo sumarlos desde la app.
    /// Un mod que falla sí lo es, pero no deshace nada de lo demás.
    /// </summary>
    private static bool InstallMods(Provider provider, bool dryRun, string? manifestDir, bool methodSkipped)
    {
        var catalog = ModCatalog.Load();

        if (methodSkipped && Manifest.Load(provider.Id, manifestDir) is not { Files.Count: > 0 })
            Warn("nzt-state muestra lo que produce el método: sin él instalado no tiene qué mostrar.");

        var result = ModInstaller.Install(Claude(), catalog, provider.Id, Version, dryRun, manifestDir);

        if (result.Skipped)
        {
            ExplainManualMods(result.Claude, catalog, "no se instalaron");
            return true;
        }

        var added = result.MarketplaceAdded ? (dryRun ? ", se agrega" : ", agregado") : "";
        Console.WriteLine($"  mods           marketplace {ModCatalog.MarketplaceName} ({result.MarketplaceSource}{added})");

        if (result.Problem is not null)
        {
            Error(result.Problem);
            return false;
        }

        ReportMods(result.Outcomes, dryRun);

        if (!dryRun)
        {
            Console.WriteLine("  Abrí una sesión nueva de Claude Code, o corré /reload-plugins, para ver los mods.");
            Console.WriteLine("  Para que se actualicen solos: /plugin → Marketplaces → nzt → Enable auto-update.");
        }

        return !result.Failed;
    }

    private static void ExplainManualMods(ClaudeAvailability claude, ModCatalog catalog, string what)
    {
        Warn($"los mods {what}: {claude.Problem}.");
        Console.WriteLine("  Para sumarlos desde la app de Claude Code, en una sesión:");
        foreach (var name in catalog.Names)
            Console.WriteLine($"    {ModCatalog.ManualCommand(name)}");
    }

    private static void ReportMods(IReadOnlyList<ModOutcome> outcomes, bool dryRun)
    {
        foreach (var outcome in outcomes)
        {
            var line = $"  {outcome.Name,-15}{DescribeMod(outcome, dryRun)}"
                + (outcome.ByUser && outcome.Action != ModAction.Kept ? " · instalado a mano" : "");

            if (outcome.Action == ModAction.Failed) Error(line.TrimStart());
            else Console.WriteLine(line);
        }
    }

    private static string DescribeMod(ModOutcome outcome, bool dryRun) => outcome.Action switch
    {
        ModAction.Installed => dryRun ? "se instala" : $"instalado, {outcome.Version}",
        ModAction.Updated => dryRun
            ? $"se actualiza si hay una versión nueva (hoy {outcome.Version})"
            : $"actualizado a {outcome.Version}",
        ModAction.Unchanged => $"al día, {outcome.Version}",
        ModAction.Failed => $"falló: {outcome.Detail}",
        ModAction.Removed => dryRun ? $"se desinstala ({outcome.Version})" : "desinstalado",
        ModAction.Kept => $"{outcome.Version}, instalado a mano: se queda",
        _ => outcome.Detail ?? "no instalado"
    };

    private static ClaudePlugins Claude() => new(new ProcessRunner());

    // ── Desinstalar ────────────────────────────────────────────────────────────

    /// <summary>
    /// `keepCli` lo usan los flujos que desinstalan para seguir —sacar la global e
    /// instalar en el proyecto, o *Todo*—: deciden ellos al final si `nzt-ai` se va.
    /// </summary>
    private static int Uninstall(IReadOnlyList<Provider> providers, bool dryRun, string? manifestDir,
        ModsChoice mods, bool keepCli = false)
    {
        if (providers.Count == 0) return 1;

        var failed = false;

        foreach (var provider in providers)
        {
            Console.WriteLine($"{provider.DisplayName} · {provider.ScopeLabel}{(dryRun ? "  (simulación)" : "")}");

            if (provider.Scope == Scope.Project && NewerProject(provider, manifestDir) is { } newer)
            {
                Error(newer);
                failed = true;
                Console.WriteLine();
                continue;
            }

            if (!provider.HasMods && mods == ModsChoice.ModsOnly)
                Console.WriteLine($"  {provider.DisplayName} no tiene mods: no se saca nada.");

            if (mods != ModsChoice.ModsOnly) UninstallMethod(provider, dryRun, manifestDir);

            if (provider.HasMods && provider.Scope == Scope.User && mods != ModsChoice.MethodOnly
                && !UninstallMods(provider, dryRun, manifestDir))
                failed = true;

            Console.WriteLine();
        }

        if (!dryRun) SyncProjects(providers, manifestDir);
        if (!keepCli) RemoveCliIfUnused(dryRun, manifestDir);

        return failed ? 1 : 0;
    }

    /// <summary>
    /// *Todo*: la global, cada proyecto registrado, los mods que instaló el CLI y el
    /// CLI. Lo editado se queda, como siempre.
    /// </summary>
    private static int UninstallAll(bool dryRun, string? manifestDir)
    {
        var failed = false;

        var globals = Provider.All.Where(p => Manifest.Load(p.Id, manifestDir) is not null).ToList();
        if (globals.Count > 0 && Uninstall(globals, dryRun, manifestDir, ModsChoice.All, keepCli: true) != 0)
            failed = true;

        foreach (var project in ProjectRegistry.Load(manifestDir))
            if (Uninstall(ProvidersIn(project, manifestDir), dryRun, manifestDir, ModsChoice.MethodOnly, keepCli: true) != 0)
                failed = true;

        if (dryRun) ReportCli(new CliOutcome(CliAction.Removed, CliCommand.PathFor(_binDir)), dryRun);
        else RemoveCliIfUnused(dryRun, manifestDir);

        return failed ? 1 : 0;
    }

    // nzt-ai se va cuando no queda nada instalado por el CLI: ni proveedor, ni mod, ni
    // proyecto (QT-26, RN-cli-desinstalar). La simulación no borra manifiestos, así que
    // ahí solo se dice la regla.
    private static void RemoveCliIfUnused(bool dryRun, string? manifestDir)
    {
        if (dryRun)
            Console.WriteLine($"{CliCommand.Name}  se saca si después no queda ningún proveedor, mod ni proyecto instalado por este CLI.");
        else if (Provider.All.All(p => Manifest.Load(p.Id, manifestDir) is null)
                 && ProjectRegistry.Load(manifestDir).Count == 0)
            ReportCli(CliCommand.Uninstall(dryRun, _binDir), dryRun);
    }

    private static void ReportCli(CliOutcome outcome, bool dryRun)
    {
        var line = outcome.Action switch
        {
            CliAction.Installed => dryRun ? $"se instala en {outcome.Target}" : $"instalado en {outcome.Target}",
            CliAction.Updated => dryRun ? $"se actualiza en {outcome.Target}" : $"actualizado en {outcome.Target}",
            CliAction.Unchanged => $"al día, {outcome.Target}",
            CliAction.Removed => dryRun ? $"se saca de {outcome.Target}" : "desinstalado",
            CliAction.NotSingleFile => "no se instala: corre desde el repo, no es el binario del release",
            CliAction.Failed => $"falló: {outcome.Detail}",
            _ => "no estaba instalado"
        };

        if (outcome.Action == CliAction.Failed) Error($"{CliCommand.Name}  {line}");
        else Console.WriteLine($"{CliCommand.Name}  {line}");

        if (outcome.PathChanged)
            Console.WriteLine(outcome.Action == CliAction.Removed
                ? "  Su carpeta sale del PATH del usuario."
                : "  Su carpeta entra al PATH del usuario: una terminal nueva ya lo encuentra.");

        if (outcome.PathLine is { } pathLine)
        {
            Warn($"la carpeta de {CliCommand.Name} no está en el PATH. Agregá esta línea al perfil de tu shell:");
            Console.WriteLine($"    {pathLine}");
        }

        Console.WriteLine();
    }

    private static void UninstallMethod(Provider provider, bool dryRun, string? manifestDir)
    {
        var result = Installer.Uninstall(provider, dryRun, manifestDir);

        if (!result.HadManifest)
        {
            Console.WriteLine("  método         no hay nada instalado por este CLI.");
            return;
        }

        Summary(result.Outcomes);
        foreach (var skipped in result.Outcomes.Where(o => o.Action == FileAction.SkippedLocallyEdited))
            Warn($"editado localmente, se conserva: {skipped.TargetPath}");
    }

    private static bool UninstallMods(Provider provider, bool dryRun, string? manifestDir)
    {
        var catalog = ModCatalog.Load();
        var result = ModInstaller.Uninstall(Claude(), catalog, provider.Id, dryRun, manifestDir);

        if (result.Skipped)
        {
            if (Manifest.Load(provider.Id, manifestDir) is { Mods.Count: > 0 })
            {
                Warn($"los mods no se desinstalaron: {result.Claude.Problem}.");
                Console.WriteLine("  Se sacan desde /plugin, en una sesión de Claude Code.");
            }
            return true;
        }

        if (result.Problem is not null)
        {
            Error(result.Problem);
            return false;
        }

        if (result.Outcomes.Count == 0)
        {
            Console.WriteLine("  mods           no hay mods de NZT instalados.");
            return true;
        }

        Console.WriteLine("  mods           solo los que instaló este CLI; el marketplace nzt queda");
        ReportMods(result.Outcomes, dryRun);
        return !result.Failed;
    }

    // ── Actualizar ─────────────────────────────────────────────────────────────

    /// <summary>
    /// `update` (RN-cli-update): baja el binario del release, lo verifica, se
    /// reemplaza y corre el nuevo con `--apply`, porque el contenido viaja embebido
    /// en el binario y es el nuevo el que tiene que reinstalar. Ya al día, aplica
    /// él mismo: puede haber proyectos atrás de este CLI.
    /// </summary>
    private static int Update(bool dryRun, string? manifestDir, string? projects)
    {
        if (CliCommand.RunningSingleFile() is not { } running)
            return Fail("No se actualiza: corre desde el repo, no es el binario del release. "
                + "Con el repo, actualizar es volver a instalar.");

        var downloader = new HttpDownloader(TimeSpan.FromMinutes(5));
        var check = Updater.Check(downloader, running);
        if (check.Problem is not null) return Fail($"No se actualizó: {check.Problem}.");

        if (!check.Available)
        {
            Console.WriteLine($"{CliCommand.Name}  al día, {Version}\n");
            return Apply(dryRun, manifestDir, projects);
        }

        var target = CliCommand.PathFor(_binDir);
        if (dryRun)
        {
            Console.WriteLine($"{CliCommand.Name}  se reemplaza por el del release ({check.BaseUrl})");
            Console.WriteLine("  Después el nuevo reinstala la global y los mods que instaló, y pregunta por los proyectos.\n");
            return 0;
        }

        Console.WriteLine($"  Bajando {check.Asset}...");
        var (content, problem) = Updater.Download(downloader, check);
        if (content is null) return Fail($"No se actualizó: {problem}. No se tocó nada.");

        Updater.Replace(content, target);
        Console.WriteLine($"{CliCommand.Name}  reemplazado en {target}\n");

        List<string> arguments = ["update", "--apply"];
        if (projects is not null) arguments.AddRange(["--projects", projects]);
        if (manifestDir is not null) arguments.AddRange(["--manifest-dir", manifestDir]);
        if (_binDir is not null) arguments.AddRange(["--bin-dir", _binDir]);

        // Sin redirigir nada: el nuevo hereda la terminal, y con ella el menú de proyectos.
        var start = new ProcessStartInfo(target) { UseShellExecute = false };
        foreach (var argument in arguments) start.ArgumentList.Add(argument);
        using var process = Process.Start(start)!;
        process.WaitForExit();
        return process.ExitCode;
    }

    /// <summary>
    /// Lleva la global y los proyectos elegidos a la versión de este binario. Los
    /// proyectos no se actualizan solos (RN-cli-update-proyectos): en *Compartido*,
    /// actualizar genera un diff que nadie pidió.
    /// </summary>
    private static int Apply(bool dryRun, string? manifestDir, string? projects)
    {
        var failed = false;

        foreach (var provider in Provider.All)
        {
            if (Manifest.Load(provider.Id, manifestDir) is not { } manifest || manifest.IsEmpty) continue;

            var mods = manifest.Files.Count == 0 ? ModsChoice.ModsOnly
                : manifest.Mods is { Count: > 0 } ? ModsChoice.All
                : ModsChoice.MethodOnly;
            if (Install([provider], dryRun, manifestDir, mods) != 0) failed = true;
        }

        var behind = ProjectRegistry.Load(manifestDir)
            .Where(project => ProvidersIn(project, manifestDir).Any(p =>
                Installer.LoadManifest(p, manifestDir) is { } m && IsNewer(Version, m.Version)))
            .ToList();

        if (behind.Count == 0) return failed ? 1 : 0;

        foreach (var project in ChooseProjects(behind, projects, manifestDir))
            if (Install(ProvidersIn(project, manifestDir), dryRun, manifestDir, ModsChoice.MethodOnly) != 0)
                failed = true;

        return failed ? 1 : 0;
    }

    // ── Estado ─────────────────────────────────────────────────────────────────

    private static int Status(string? manifestDir)
    {
        Console.WriteLine("Global\n");
        foreach (var provider in Provider.All)
        {
            var manifest = Manifest.Load(provider.Id, manifestDir);
            Console.WriteLine(provider.DisplayName);

            if (manifest is not { Files.Count: > 0 })
                Console.WriteLine("  método         no instalado");
            else
                MethodStatus(provider, manifest, Manifest.PathFor(provider.Id, manifestDir));

            if (provider.HasMods) ModsStatus(provider, manifestDir);
            Console.WriteLine();
        }

        var here = ProjectRoot.Find(Directory.GetCurrentDirectory());
        var installedHere = ProvidersIn(here, manifestDir);
        if (installedHere.Count > 0)
        {
            Console.WriteLine($"Este proyecto · {here.Path}\n");
            foreach (var provider in installedHere)
            {
                Console.WriteLine(provider.DisplayName);
                MethodStatus(provider, Installer.LoadManifest(provider, manifestDir)!,
                    Manifest.PathFor(provider.Id, provider.ManifestDirectory));
                if (Manifest.Load(provider.Id, manifestDir) is { Files.Count: > 0 })
                    Warn($"la global de {provider.DisplayName} tapa este proyecto.");
                Console.WriteLine();
            }
        }

        var projects = ProjectRegistry.Load(manifestDir);
        Console.WriteLine("Proyectos registrados\n");
        if (projects.Count == 0) Console.WriteLine("  ninguno");
        foreach (var project in projects)
            Console.WriteLine($"  {project.Path}\n    {DescribeProject(project, manifestDir)}");
        Console.WriteLine();

        return 0;
    }

    /// <summary>"Claude Code 3.1.0, solo para mí · Codex no": una línea por proyecto.</summary>
    private static string DescribeProject(ProjectRoot project, string? manifestDir) =>
        string.Join(" · ", Provider.AllIn(project, personal: true).Select(p =>
            Installer.LoadManifest(p, manifestDir) is { Files.Count: > 0 } m
                ? $"{p.DisplayName} {m.Version}" + (project.IsGitRepo ? (m.Personal ? ", solo para mí" : ", compartido") : "")
                : $"{p.DisplayName} no"));

    private static void ModsStatus(Provider provider, string? manifestDir)
    {
        var result = ModInstaller.Status(Claude(), ModCatalog.Load(), provider.Id, manifestDir);

        if (result.Skipped || result.Problem is not null)
        {
            Console.WriteLine($"  mods           no se pudo consultar: {result.Claude.Problem ?? result.Problem}");
            return;
        }

        Console.WriteLine("  mods" + (result.MarketplaceSource is { } source ? $"           marketplace nzt ({source})" : ""));
        foreach (var outcome in result.Outcomes)
            Console.WriteLine($"    {outcome.Name,-15}" + (outcome.Action == ModAction.Installed
                ? $"{outcome.Version} · {(outcome.ByUser ? "instalado a mano" : "lo instaló NZT")}"
                : "no instalado" + (outcome.Detail is { } detail ? $" ({detail})" : "")));
    }

    private static void MethodStatus(Provider provider, Manifest manifest, string manifestPath)
    {
        var missing = manifest.Files.Count(f => !File.Exists(f.Path));
        var edited = manifest.Files.Count(f =>
            File.Exists(f.Path)
            && (f.ManagedBlock
                ? !InstructionBlock.Matches(File.ReadAllText(f.Path), f.Sha256, out _, out _)
                : Manifest.HashFile(f.Path) != f.Sha256));

        Console.WriteLine($"  versión        {manifest.Version}");
        Console.WriteLine($"  alcance        {provider.ScopeLabel}");
        Console.WriteLine($"  instalado      {manifest.InstalledAt:yyyy-MM-dd HH:mm}");
        Console.WriteLine($"  instrucciones  {manifest.Files.FirstOrDefault(f => f.ManagedBlock)?.Path ?? provider.InstructionsFile}");
        Console.WriteLine($"  skills         {provider.SkillsDirectory}");
        Console.WriteLine($"  agentes        {provider.AgentsDirectory}");
        Console.WriteLine($"  archivos       {manifest.Files.Count}"
            + (edited > 0 ? $", {edited} editado(s) localmente" : "")
            + (missing > 0 ? $", {missing} faltante(s)" : ""));
        Console.WriteLine($"  manifiesto     {manifestPath}");
    }

    /// <summary>
    /// Verificar el contenido: qué trae el ejecutable embebido y si cumple sus
    /// propias reglas. `detailed` lista skill por skill —lo que hace verificable
    /// la palabra "verificar"—; sin él queda el resumen, que es lo que sirve en CI.
    /// </summary>
    private static int Lint(bool detailed)
    {
        var catalog = ContentCatalog.Load();
        var report = Linter.Run(catalog);

        if (detailed)
        {
            Console.WriteLine($"  {"skill",-46} {"líneas",6}  {"chars",5}");
            foreach (var skill in catalog.Skills)
                Console.WriteLine($"  {skill.Name,-46} {skill.LineCount,6}  "
                    + $"{skill.FrontMatter.Get("description")?.Length ?? 0,5}");
            Console.WriteLine();
        }

        foreach (var issue in report.Issues)
            Console.WriteLine($"  {issue.Where}: {issue.Message}");

        Console.WriteLine($"\n{report.SkillCount} skills · ~{report.ListingChars} chars de listado"
            + $" · {report.Issues.Count} problema(s)");

        if (detailed && report.Ok)
            Console.WriteLine($"Todas dentro de {Linter.MaxLines} líneas y {Linter.MaxDescription}"
                + " chars de description.");

        if (report.OverListingFloor)
            Warn($"el listado pasa el piso de {LintReport.CodexFloor} (R1).");

        return report.Ok ? 0 : 1;
    }

    /// <summary>
    /// `state check`: lo corre el agente después de escribir el estado, así que la
    /// salida es corta —una línea si está bien— y el código de salida es lo que importa.
    /// </summary>
    private static int State(string projectDirectory)
    {
        var report = StateCheck.Run(projectDirectory);

        if (!report.Found)
        {
            Console.WriteLine($"No hay {StateCheck.RelativePath} en esta carpeta: nada que revisar.");
            return 0;
        }

        if (report.Ok)
        {
            Console.WriteLine($"{StateCheck.RelativePath}: cumple el contrato del kernel.");
            return 0;
        }

        Console.WriteLine($"{StateCheck.RelativePath}: {report.Problems.Count} problema(s)");
        foreach (var problem in report.Problems)
            Console.WriteLine($"  {problem}");
        return 1;
    }

    // ── Auxiliares ─────────────────────────────────────────────────────────────

    /// <summary>Los proveedores con NZT en un proyecto, cada uno en el modo de su manifiesto.</summary>
    public static IReadOnlyList<Provider> ProvidersIn(ProjectRoot project, string? manifestDir = null) =>
        Provider.Ids
            .Select(id => (id, manifest: Manifest.Load(id, project.Combine(".nzt", "manifests"), project.Path)))
            .Where(x => x.manifest is not null)
            .Select(x => Provider.ById(x.id, project, x.manifest!.Personal)!)
            .ToList();

    /// <summary>Los proyectos registrados con NZT en ese proveedor: los que una global taparía.</summary>
    private static IReadOnlyList<ProjectRoot> ProjectsWith(string providerId, string? manifestDir) =>
        ProjectRegistry.Load(manifestDir)
            .Where(project => ProvidersIn(project, manifestDir).Any(p => p.Id == providerId))
            .ToList();

    public static bool IsNewer(string candidate, string than) =>
        System.Version.TryParse(candidate, out var a) && System.Version.TryParse(than, out var b) && a > b;

    private static string? SubcommandOf(string[] args) =>
        args.Where(a => !a.StartsWith('-')).Skip(1).FirstOrDefault()?.ToLowerInvariant();

    private static IReadOnlyList<Provider> ProvidersFrom(string[] args, Scope scope, bool personal, string? manifestDir)
    {
        var id = ValueOf(args, "--provider");

        if (id is null)
        {
            Fail("Falta --provider (claude-code, codex o all).");
            return [];
        }

        var all = string.Equals(id, "all", StringComparison.OrdinalIgnoreCase);
        if (!all && Provider.ById(id) is null)
        {
            Fail($"Proveedor desconocido: {id}. Son claude-code, codex o all.");
            return [];
        }

        if (scope == Scope.User) return all ? Provider.All : [Provider.ById(id)!];

        var project = ProjectRoot.Find(Directory.GetCurrentDirectory());
        if (project.IsUserHome())
        {
            Fail("Esta es tu carpeta de usuario: ahí .claude/ y .agents/ son la instalación global. "
                + "Corré el comando desde un proyecto.");
            return [];
        }

        // Al desinstalar, cada uno en el modo de su manifiesto: el modo decide el exclude.
        var installed = ProvidersIn(project, manifestDir);
        Provider For(string providerId) =>
            installed.FirstOrDefault(p => p.Id == providerId && !args.Contains("--mode"))
            ?? Provider.ById(providerId, project, personal)!;

        return all ? Provider.Ids.Select(For).ToList() : [For(Provider.ById(id)!.Id)];
    }

    private static string? ValueOf(string[] args, string flag)
    {
        var index = Array.FindIndex(args, a => string.Equals(a, flag, StringComparison.OrdinalIgnoreCase));
        if (index < 0 || index + 1 >= args.Length) return null;
        var value = args[index + 1];
        return value.StartsWith('-') ? null : value;
    }

    private static void Summary(IReadOnlyList<FileOutcome> outcomes)
    {
        string Count(FileAction action) => outcomes.Count(o => o.Action == action).ToString();
        Console.WriteLine($"  {Count(FileAction.Created)} creados · {Count(FileAction.Updated)} actualizados"
            + $" · {Count(FileAction.Unchanged)} sin cambios · {Count(FileAction.Removed)} eliminados"
            + $" · {Count(FileAction.SkippedLocallyEdited)} conservados");
    }

    private static int Line(string text)
    {
        Console.WriteLine(text);
        return 0;
    }

    private static int Fail(string message)
    {
        Error(message);
        return 1;
    }

    private static void Error(string message) => Write(ConsoleColor.Red, $"  {message}");

    private static void Warn(string message) => Write(ConsoleColor.Yellow, $"  aviso: {message}");

    private static void Write(ConsoleColor color, string message)
    {
        var previous = Console.ForegroundColor;
        Console.ForegroundColor = color;
        Console.WriteLine(message);
        Console.ForegroundColor = previous;
    }
}
