using Nzt.Cli.Install;
using Nzt.Cli.Providers;
using Spectre.Console;

namespace Nzt.Cli;

public static partial class Program
{
    /// <summary>Las acciones del menú principal. Se ofrecen solo las que se pueden hacer ahí.</summary>
    public enum MenuAction { InstallProject, ReinstallProject, InstallGlobal, Uninstall, Update, Status, Verify, Exit }

    /// <summary>Los destinos que ofrecen instalar y desinstalar. `Back` no elige ninguno.</summary>
    public enum ProviderChoice { ClaudeCode, Codex, All, Back }

    private enum UninstallChoice { Project, Global, Everything, Back }

    /// <summary>
    /// El menú (RN-menu-contexto): un encabezado que dice dónde se está y qué hay, y
    /// solo las acciones posibles ahí (RN-menu-solo-posible). Se recorre con las
    /// flechas y se elige con Enter, y las acciones que escriben muestran la
    /// simulación completa y recién ahí preguntan.
    /// </summary>
    private static int Menu()
    {
        Console.WriteLine($"NZT {Version}");

        // Sin terminal —una tubería cerrada— no hay flechas que leer: se sale en
        // vez de girar sobre un prompt que nadie puede contestar.
        if (Console.IsInputRedirected)
        {
            Console.WriteLine("\n  El menú necesita una terminal. Sin ella están los comandos: nzt-ai help.");
            return 0;
        }

        var newer = NewerVersion();

        while (true)
        {
            var project = ProjectRoot.Find(Directory.GetCurrentDirectory());
            Header(project, newer);

            var actions = new List<MenuAction>();
            if (!project.IsUserHome())
                actions.Add(ProvidersIn(project).Count > 0 ? MenuAction.ReinstallProject : MenuAction.InstallProject);
            actions.Add(MenuAction.InstallGlobal);
            if (AnythingInstalled(project)) actions.Add(MenuAction.Uninstall);
            if (newer is not null) actions.Add(MenuAction.Update);
            actions.AddRange([MenuAction.Status, MenuAction.Verify, MenuAction.Exit]);

            var action = Ask("¿Qué querés hacer?", a => MenuLabel(a, newer), [.. actions]);
            Console.WriteLine();

            switch (action)
            {
                case MenuAction.InstallProject or MenuAction.ReinstallProject: MenuInstallProject(project); break;
                case MenuAction.InstallGlobal: MenuInstallGlobal(); break;
                case MenuAction.Uninstall: MenuUninstall(project); break;
                case MenuAction.Update:
                    if (Confirm("¿Bajar la versión nueva y reemplazar nzt-ai?")) return Update(false, null, null);
                    break;
                case MenuAction.Status: Status(null); break;
                case MenuAction.Verify: Lint(detailed: true); break;
                default: return 0;
            }

            Console.WriteLine();
        }
    }

    /// <summary>`nzt-ai init`: el menú directo en *Instalar en este proyecto* (RN-menu-init).</summary>
    private static int Init(string? manifestDir)
    {
        if (Console.IsInputRedirected)
            return Fail("init necesita una terminal. Sin ella: nzt-ai install --provider <id> --scope project.");

        var project = ProjectRoot.Find(Directory.GetCurrentDirectory());
        if (project.IsUserHome())
            return Fail("Esta es tu carpeta de usuario: ahí va la instalación global. Abrilo desde un proyecto.");

        Console.WriteLine($"NZT {Version}");
        Header(project, null);
        MenuInstallProject(project, manifestDir);
        return 0;
    }

    private static void Header(ProjectRoot project, string? newer)
    {
        string Global(string id) => Manifest.Load(id, null) is { Files.Count: > 0 } m ? $"{Name(id)} {m.Version}" : $"{Name(id)} no";
        var mods = Manifest.Load(Provider.ClaudeCodeId, null)?.Mods?.Count ?? 0;

        Console.WriteLine();
        Console.WriteLine($"  Carpeta   {project.Path}  ({(project.IsUserHome() ? "tu carpeta de usuario" : project.IsGitRepo ? "repo git" : "sin repo git")})");
        Console.WriteLine($"  Acá       {(project.IsUserHome() ? "acá va la global" : ProvidersIn(project).Count > 0 ? DescribeProject(project, null) : "sin NZT")}");
        Console.WriteLine($"  Global    {Global(Provider.ClaudeCodeId)} · {Global(Provider.CodexId)}");
        Console.WriteLine($"  Mods      {(mods > 0 ? $"{mods} instalados por NZT" : "ninguno instalado por NZT")}");
        foreach (var provider in ProvidersIn(project).Where(p => Manifest.Load(p.Id, null) is { Files.Count: > 0 }))
            Warn($"la global de {provider.DisplayName} tapa este proyecto.");
        Console.WriteLine();
    }

    private static string Name(string id) => id == Provider.ClaudeCodeId ? "Claude Code" : "Codex";

    private static bool AnythingInstalled(ProjectRoot project) =>
        ProvidersIn(project).Count > 0
        || Provider.All.Any(p => Manifest.Load(p.Id, null) is not null)
        || ProjectRegistry.Load(null).Count > 0;

    // QP-05: al abrir, con dos segundos de límite y sin decir nada si falla. Desde
    // el repo no se busca: ahí no hay qué actualizar.
    private static string? NewerVersion() =>
        CliCommand.RunningSingleFile() is { } running
            ? Updater.NewerVersion(new HttpDownloader(TimeSpan.FromSeconds(2)), running, Version)
            : null;

    // ── Flujos (RN-menu-flujos) ────────────────────────────────────────────────

    private static void MenuInstallProject(ProjectRoot project, string? manifestDir = null)
    {
        // Primero el que el repo ya usa: la opción marcada al abrir es la primera.
        var claude = project.Uses(Provider.ClaudeCodeId);
        var codex = project.Uses(Provider.CodexId);
        ProviderChoice[] order = claude && codex ? [ProviderChoice.All, ProviderChoice.ClaudeCode, ProviderChoice.Codex]
            : codex ? [ProviderChoice.Codex, ProviderChoice.ClaudeCode, ProviderChoice.All]
            : [ProviderChoice.ClaudeCode, ProviderChoice.Codex, ProviderChoice.All];
        var choice = Ask("¿En qué proveedor?", ProviderLabel, [.. order, ProviderChoice.Back]);
        Console.WriteLine();
        var ids = ProvidersFor(choice).Select(p => p.Id).ToList();
        if (ids.Count == 0) return;

        var personal = true;
        if (project.IsGitRepo)
        {
            var current = ProvidersIn(project, manifestDir).FirstOrDefault()?.Personal ?? true;
            bool?[] modes = current ? [true, false, null] : [false, true, null];
            var mode = Ask("¿Para quién?", m => m switch
            {
                true => "Solo para mí: no aparece en el diff de git",
                false => "Compartido: para commitear",
                _ => "Volver"
            }, modes);
            Console.WriteLine();
            if (mode is not { } chosen) return;
            personal = chosen;
        }

        var providers = ids.Select(id => Provider.ById(id, project, personal)!).ToList();

        // RN-proy-exclusivo: la global se desinstala solo si se elige acá.
        var globals = Provider.All.Where(g => ids.Contains(g.Id)
            && Manifest.Load(g.Id, manifestDir) is { Files.Count: > 0 }).ToList();
        if (globals.Count > 0)
        {
            var names = string.Join(" y ", globals.Select(g => g.DisplayName));
            Console.WriteLine($"  {names} está instalado global, y la global taparía este proyecto.");
            if (!Ask("¿Qué hago?", go => go ? "Desinstalar la global y seguir" : "Volver", true, false)) return;
            Console.WriteLine();
        }

        foreach (var warning in providers.Select(p => TrackedAgentsWarning(p, manifestDir)).OfType<string>())
        {
            Warn(warning);
            if (!Ask("¿Sigo?", go => go ? "Seguir igual" : "Volver", true, false)) return;
            Console.WriteLine();
        }

        if (globals.Count > 0) Uninstall(globals, dryRun: true, manifestDir, ModsChoice.MethodOnly, keepCli: true);
        if (Install(providers, dryRun: true, manifestDir, ModsChoice.MethodOnly) != 0 && globals.Count == 0) return;

        if (!Confirm("¿Instalar?"))
        {
            Console.WriteLine("  No se escribió nada.");
            return;
        }

        if (globals.Count > 0) Uninstall(globals, dryRun: false, manifestDir, ModsChoice.MethodOnly, keepCli: true);
        Install(providers.Select(p => Provider.ById(p.Id, project, personal)!).ToList(), false, manifestDir,
            ModsChoice.MethodOnly);
    }

    private static void MenuInstallGlobal()
    {
        var targets = AskProvider("¿Dónde lo instalo?");
        if (targets.Count == 0) return;

        var shadowed = targets.SelectMany(t => ProjectsWith(t.Id, null)).DistinctBy(p => p.Path).ToList();
        if (shadowed.Count > 0)
        {
            Console.WriteLine("  Estos proyectos tienen NZT, y la global los va a tapar:");
            foreach (var project in shadowed) Console.WriteLine($"    {project.Path}");
            if (!Ask("¿Sigo?", go => go ? "Seguir" : "Volver", false, true)) return;
            Console.WriteLine();
        }

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

    private static void MenuUninstall(ProjectRoot project)
    {
        var here = ProvidersIn(project);
        var choices = new List<UninstallChoice>();
        if (here.Count > 0) choices.Add(UninstallChoice.Project);
        if (Provider.All.Any(p => Manifest.Load(p.Id, null) is not null)) choices.Add(UninstallChoice.Global);
        choices.AddRange([UninstallChoice.Everything, UninstallChoice.Back]);

        var choice = Ask("¿Qué saco?", c => c switch
        {
            UninstallChoice.Project => "De este proyecto",
            UninstallChoice.Global => "Global",
            UninstallChoice.Everything => "Todo: global, proyectos, los mods de NZT y nzt-ai",
            _ => "Volver"
        }, [.. choices]);
        Console.WriteLine();

        switch (choice)
        {
            case UninstallChoice.Project:
                var targets = here;
                if (here.Count > 1)
                {
                    var which = Ask("¿De qué proveedor?", ProviderLabel,
                        ProviderChoice.All, ProviderChoice.ClaudeCode, ProviderChoice.Codex, ProviderChoice.Back);
                    Console.WriteLine();
                    var ids = ProvidersFor(which).Select(p => p.Id).ToHashSet();
                    targets = here.Where(p => ids.Contains(p.Id)).ToList();
                }
                if (targets.Count == 0) return;
                ConfirmUninstall(dry => Uninstall(targets, dry, null, ModsChoice.MethodOnly));
                break;

            case UninstallChoice.Global:
                var globals = AskProvider("¿De dónde lo saco?");
                if (globals.Count == 0) return;
                if (AskMods(globals, "¿Qué saco de Claude Code?") is not { } mods) return;
                ConfirmUninstall(dry => Uninstall(globals, dry, null, mods));
                break;

            case UninstallChoice.Everything:
                ConfirmUninstall(dry => UninstallAll(dry, null));
                break;
        }
    }

    // La simulación va primero acá también, y más: esto borra. Lo que se conserva
    // por estar editado aparece antes de confirmar, no después.
    private static void ConfirmUninstall(Func<bool, int> uninstall)
    {
        Console.WriteLine("  Se remueve solamente lo que instaló este CLI, según su manifiesto.\n");
        uninstall(true);

        if (!Confirm("¿Desinstalar?"))
        {
            Console.WriteLine("  No se borró nada.");
            return;
        }

        uninstall(false);
    }

    /// <summary>
    /// Qué proyectos atrás de este CLI se actualizan (RN-cli-update-proyectos). Por
    /// comando decide `--projects`, y sin él o sin terminal, ninguno.
    /// </summary>
    private static IReadOnlyList<ProjectRoot> ChooseProjects(IReadOnlyList<ProjectRoot> behind, string? projects,
        string? manifestDir)
    {
        if (projects == "all") return behind;
        if (projects == "none" || Console.IsInputRedirected)
        {
            Console.WriteLine($"  {behind.Count} proyecto(s) con una versión anterior: se actualizan con nzt-ai update --projects all.");
            return [];
        }

        Console.WriteLine("Proyectos con una versión anterior:");
        foreach (var project in behind)
            Console.WriteLine($"  {project.Path}\n    {DescribeProject(project, manifestDir)}");
        Console.WriteLine("  En los compartidos, actualizar deja cambios para commitear.\n");

        var answer = Ask("¿Cuáles actualizo?", a => a switch { 0 => "Todos", 1 => "Elegir", _ => "Ninguno" }, 0, 1, 2);
        Console.WriteLine();
        if (answer == 0) return behind;
        if (answer == 2) return [];

        return behind.Where(project => Ask(project.Path, yes => yes ? "Actualizar" : "Dejar", false, true)).ToList();
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

    /// <summary>La opción elegida, traducida a proveedores globales. `Back` no elige ninguno.</summary>
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

    private static string MenuLabel(MenuAction action, string? newer) => action switch
    {
        MenuAction.InstallProject => "Instalar en este proyecto",
        MenuAction.ReinstallProject => "Reinstalar en este proyecto",
        MenuAction.InstallGlobal => "Instalar global",
        MenuAction.Uninstall => "Desinstalar",
        MenuAction.Update => $"Actualizar            hay una versión nueva: {newer}",
        MenuAction.Status => "Ver estado",
        MenuAction.Verify => "Verificar el contenido",
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
}
