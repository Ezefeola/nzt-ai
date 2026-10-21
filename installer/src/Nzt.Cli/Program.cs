using System.Reflection;
using Nzt.Cli.Content;
using Nzt.Cli.Install;
using Nzt.Cli.Lint;
using Nzt.Cli.Mods;
using Nzt.Cli.Providers;
using Nzt.Cli.State;
using Spectre.Console;

namespace Nzt.Cli;

public static class Program
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
        var command = args.FirstOrDefault(a => !a.StartsWith('-'))?.ToLowerInvariant();
        var dryRun = args.Contains("--dry-run");
        var manifestDir = ValueOf(args, "--manifest-dir");
        _binDir = ValueOf(args, "--bin-dir");

        var modsValue = ValueOf(args, "--mods");
        var mods = modsValue is null ? null : ModsChoiceFor(modsValue);
        if (modsValue is not null && mods is null)
            return Fail($"--mods desconocido: {modsValue}. Son all, none u only.");

        // Instalar sin --mods es solo el método, como la línea de siempre; desinstalar
        // saca también los mods que instaló este CLI.
        return command switch
        {
            null => Menu(),
            "install" => Install(ProvidersFrom(args), dryRun, manifestDir, mods ?? ModsChoice.MethodOnly),
            "uninstall" => Uninstall(ProvidersFrom(args), dryRun, manifestDir, mods ?? ModsChoice.All),
            "status" => Status(manifestDir),
            "lint" or "verify" => Lint(detailed: false),
            "state" => SubcommandOf(args) == "check"
                ? State(Directory.GetCurrentDirectory())
                : Fail("Falta el subcomando: nzt-ai state check."),
            "help" or "--help" or "-h" => Help(),
            _ => Fail($"Comando desconocido: {command}")
        };
    }

    // ── Interfaz ───────────────────────────────────────────────────────────────

    private static int Help()
    {
        Console.WriteLine($"""
            NZT installer {Version}

              nzt-ai                                    menú interactivo
              nzt-ai install --provider <id> [--mods all|none|only] [--dry-run]
              nzt-ai uninstall --provider <id> [--mods all|none|only] [--dry-run]
              nzt-ai status
              nzt-ai lint | verify
              nzt-ai state check                        revisa Plan/state.json de esta carpeta

            Proveedores: claude-code, codex, all
            Mods (solo Claude Code): all = el método y los mods, none = solo el método,
            only = solo los mods. Instalar sin --mods es none; desinstalar sin --mods es all.
            """);
        return 0;
    }

    /// <summary>Las acciones del menú principal, en el orden en que se ofrecen.</summary>
    public enum MenuAction { Install, Uninstall, Verify, Status, Exit }

    /// <summary>Los destinos que ofrecen instalar y desinstalar. `Back` no elige ninguno.</summary>
    public enum ProviderChoice { ClaudeCode, Codex, All, Back }

    /// <summary>Qué se instala o se saca en Claude Code. `All` va primero: es la marcada al abrir.</summary>
    public enum ModsChoice { All, MethodOnly, ModsOnly, Back }

    /// <summary>
    /// El menú: instalar, desinstalar, verificar el contenido, ver estado. Se
    /// recorre con las flechas y se elige con Enter —no se escribe nada, así que
    /// no hay opción inválida posible—, y vuelve a preguntar hasta que se elige
    /// salir, porque verificar y ver estado no son el final de nada. Las dos
    /// acciones que escriben muestran la simulación completa y recién ahí preguntan.
    /// </summary>
    private static int Menu()
    {
        Console.WriteLine($"NZT installer {Version}\n");

        // Sin terminal —una tubería cerrada— no hay flechas que leer: se sale en
        // vez de girar sobre un prompt que nadie puede contestar.
        if (Console.IsInputRedirected)
        {
            Console.WriteLine("  El menú necesita una terminal. Sin ella están los comandos: nzt-ai help.");
            return 0;
        }

        while (true)
        {
            var action = Ask("¿Qué querés hacer?", MenuLabel,
                MenuAction.Install, MenuAction.Uninstall, MenuAction.Verify,
                MenuAction.Status, MenuAction.Exit);

            Console.WriteLine();

            switch (action)
            {
                case MenuAction.Install: MenuInstall(); break;
                case MenuAction.Uninstall: MenuUninstall(); break;
                case MenuAction.Verify: Lint(detailed: true); break;
                case MenuAction.Status: Status(null); break;
                default: return 0;
            }

            Console.WriteLine();
        }
    }

    private static void MenuInstall()
    {
        var targets = AskProvider("¿Dónde lo instalo?");
        if (targets.Count == 0) return;

        var mods = AskMods(targets, "¿Qué instalo en Claude Code?");
        if (mods is not { } choice) return;

        // Primero se muestra exactamente lo que haría, y recién ahí se pregunta.
        if (Install(targets, dryRun: true, null, choice) != 0) return;

        if (!Confirm("¿Instalar?"))
        {
            Console.WriteLine("  No se escribió nada.");
            return;
        }

        Install(targets, dryRun: false, null, choice);
    }

    private static void MenuUninstall()
    {
        var targets = AskProvider("¿De dónde lo saco?");
        if (targets.Count == 0) return;

        var mods = AskMods(targets, "¿Qué saco de Claude Code?");
        if (mods is not { } choice) return;

        // La simulación va primero acá también, y más: esto borra. Lo que se
        // conserva por estar editado aparece antes de confirmar, no después.
        Console.WriteLine("  Se remueve solamente lo que instaló este CLI, según su manifiesto.\n");
        if (Uninstall(targets, dryRun: true, null, choice) != 0) return;

        if (!Confirm("¿Desinstalar?"))
        {
            Console.WriteLine("  No se borró nada.");
            return;
        }

        Uninstall(targets, dryRun: false, null, choice);
    }

    private static IReadOnlyList<Provider> AskProvider(string question)
    {
        var choice = Ask(question, ProviderLabel,
            ProviderChoice.ClaudeCode, ProviderChoice.Codex, ProviderChoice.All, ProviderChoice.Back);

        Console.WriteLine();
        return ProvidersFor(choice);
    }

    /// <summary>
    /// La pregunta de los mods, solo si entre los destinos está Claude Code: es el
    /// único proveedor que los tiene, y con Todos se hace una sola vez. `null` es Volver.
    /// </summary>
    private static ModsChoice? AskMods(IReadOnlyList<Provider> targets, string question)
    {
        if (!targets.Any(p => p.HasMods)) return ModsChoice.MethodOnly;

        var choice = Ask(question, ModsLabel,
            ModsChoice.All, ModsChoice.MethodOnly, ModsChoice.ModsOnly, ModsChoice.Back);

        Console.WriteLine();
        return choice == ModsChoice.Back ? null : choice;
    }

    /// <summary>El valor de `--mods`. `null` si no es uno de los tres.</summary>
    public static ModsChoice? ModsChoiceFor(string value) => value.ToLowerInvariant() switch
    {
        "all" => ModsChoice.All,
        "none" => ModsChoice.MethodOnly,
        "only" => ModsChoice.ModsOnly,
        _ => null
    };

    /// <summary>La opción elegida, traducida a proveedores. `Back` no elige ninguno.</summary>
    public static IReadOnlyList<Provider> ProvidersFor(ProviderChoice choice) => choice switch
    {
        ProviderChoice.ClaudeCode => [Provider.ClaudeCode()],
        ProviderChoice.Codex => [Provider.Codex()],
        ProviderChoice.All => Provider.All,
        _ => []
    };

    /// <summary>
    /// La confirmación de lo que escribe o borra, también con las flechas. `No`
    /// va primero porque la primera opción es la marcada al abrir: ese es el
    /// valor por defecto, y acá tiene que ser el que no toca el disco.
    /// </summary>
    private static bool Confirm(string question)
    {
        Console.WriteLine();
        var answer = Ask(question, yes => yes ? "Sí" : "No", false, true);
        Console.WriteLine();
        return answer;
    }

    /// <summary>
    /// El único prompt del CLI: una lista que se recorre con las flechas y se
    /// elige con Enter. La primera opción es la que está marcada al abrirse.
    /// </summary>
    private static T Ask<T>(string question, Func<T, string> label, params T[] choices)
        where T : notnull =>
        AnsiConsole.Prompt(
            new SelectionPrompt<T>()
                .Title($"  {Markup.Escape(question)}")
                .HighlightStyle(new Style(foreground: Color.Cyan1))
                .UseConverter(label)
                .AddChoices(choices));

    private static string MenuLabel(MenuAction action) => action switch
    {
        MenuAction.Install => "Instalar",
        MenuAction.Uninstall => "Desinstalar",
        MenuAction.Verify => "Verificar el contenido",
        MenuAction.Status => "Ver estado",
        _ => "Salir"
    };

    private static string ProviderLabel(ProviderChoice choice) => choice switch
    {
        ProviderChoice.ClaudeCode => "Claude Code",
        ProviderChoice.Codex => "Codex",
        ProviderChoice.All => "Todos los proveedores soportados",
        _ => "Volver"
    };

    private static string ModsLabel(ModsChoice choice) => choice switch
    {
        ModsChoice.All => "Todo NZT: el método y los mods",
        ModsChoice.MethodOnly => "Solo el método",
        ModsChoice.ModsOnly => "Solo los mods",
        _ => "Volver"
    };

    // ── Comandos ───────────────────────────────────────────────────────────────

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
            Console.WriteLine($"{provider.DisplayName}{(dryRun ? "  (simulación)" : "")}");

            if (!provider.HasMods && mods != ModsChoice.MethodOnly)
                Console.WriteLine(installsMethod
                    ? $"  {provider.DisplayName} no tiene mods: se instala el método."
                    : $"  {provider.DisplayName} no tiene mods: no se instala nada.");

            if (installsMethod && !InstallMethod(provider, catalog, dryRun, manifestDir)) failed = true;

            if (provider.HasMods && mods != ModsChoice.MethodOnly
                && !InstallMods(provider, dryRun, manifestDir, methodSkipped: !installsMethod))
                failed = true;

            Console.WriteLine();
        }

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
        if (provider.PathWarning is { } warning) Warn(warning);

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
        Summary(result.Outcomes);

        foreach (var skipped in result.Outcomes.Where(o => o.Action == FileAction.SkippedLocallyEdited))
            Warn($"editado localmente, se conserva: {skipped.TargetPath}");

        if (!dryRun) Console.WriteLine($"  {provider.Usage}");
        return true;
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

    private static int Uninstall(IReadOnlyList<Provider> providers, bool dryRun, string? manifestDir,
        ModsChoice mods)
    {
        if (providers.Count == 0) return 1;

        var failed = false;

        foreach (var provider in providers)
        {
            Console.WriteLine($"{provider.DisplayName}{(dryRun ? "  (simulación)" : "")}");

            if (!provider.HasMods && mods == ModsChoice.ModsOnly)
                Console.WriteLine($"  {provider.DisplayName} no tiene mods: no se saca nada.");

            if (mods != ModsChoice.ModsOnly) UninstallMethod(provider, dryRun, manifestDir);

            if (provider.HasMods && mods != ModsChoice.MethodOnly && !UninstallMods(provider, dryRun, manifestDir))
                failed = true;

            Console.WriteLine();
        }

        // nzt-ai se va cuando no queda nada instalado por el CLI (QT-26). La simulación no
        // borra manifiestos, así que ahí solo se dice la regla.
        if (dryRun)
            Console.WriteLine($"{CliCommand.Name}  se saca si después no queda ningún proveedor ni mod instalado por este CLI.");
        else if (Provider.All.All(p => Manifest.Load(p.Id, manifestDir) is null))
            ReportCli(CliCommand.Uninstall(dryRun, _binDir), dryRun);

        return failed ? 1 : 0;
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

    private static int Status(string? manifestDir)
    {
        foreach (var provider in Provider.All)
        {
            var manifest = Manifest.Load(provider.Id, manifestDir);
            Console.WriteLine(provider.DisplayName);

            if (manifest is not { Files.Count: > 0 })
                Console.WriteLine("  método         no instalado");
            else
                MethodStatus(provider, manifest, manifestDir);

            if (provider.HasMods) ModsStatus(provider, manifestDir);
            Console.WriteLine();
        }

        return 0;
    }

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

    private static void MethodStatus(Provider provider, Manifest manifest, string? manifestDir)
    {
        var missing = manifest.Files.Count(f => !File.Exists(f.Path));
        var edited = manifest.Files.Count(f =>
            File.Exists(f.Path)
            && (f.ManagedBlock
                ? !InstructionBlock.Matches(File.ReadAllText(f.Path), f.Sha256, out _, out _)
                : Manifest.HashFile(f.Path) != f.Sha256));

        Console.WriteLine($"  versión        {manifest.Version}");
        Console.WriteLine($"  instalado      {manifest.InstalledAt:yyyy-MM-dd HH:mm}");
        Console.WriteLine($"  instrucciones  {provider.InstructionsFile}");
        Console.WriteLine($"  skills         {provider.SkillsDirectory}");
        Console.WriteLine($"  agentes        {provider.AgentsDirectory}");
        Console.WriteLine($"  archivos       {manifest.Files.Count}"
            + (edited > 0 ? $", {edited} editado(s) localmente" : "")
            + (missing > 0 ? $", {missing} faltante(s)" : ""));
        Console.WriteLine($"  manifiesto     {Manifest.PathFor(provider.Id, manifestDir)}");
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

    private static string? SubcommandOf(string[] args) =>
        args.Where(a => !a.StartsWith('-')).Skip(1).FirstOrDefault()?.ToLowerInvariant();

    private static IReadOnlyList<Provider> ProvidersFrom(string[] args)
    {
        var id = ValueOf(args, "--provider");

        if (id is null)
        {
            Fail("Falta --provider (claude-code, codex o all).");
            return [];
        }

        if (string.Equals(id, "all", StringComparison.OrdinalIgnoreCase)) return Provider.All;

        var provider = Provider.ById(id);
        if (provider is null)
        {
            Fail($"Proveedor desconocido: {id}. Son claude-code, codex o all.");
            return [];
        }

        return [provider];
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
