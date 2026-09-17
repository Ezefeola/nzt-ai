using System.Reflection;
using Nzt.Cli.Content;
using Nzt.Cli.Install;
using Nzt.Cli.Lint;
using Nzt.Cli.Providers;

namespace Nzt.Cli;

public static class Program
{
    private static readonly string Version =
        Assembly.GetExecutingAssembly().GetName().Version?.ToString(3) ?? "0.0.0";

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

        return command switch
        {
            null => Menu(),
            "install" => Install(ProvidersFrom(args), dryRun, manifestDir),
            "uninstall" => Uninstall(ProvidersFrom(args), dryRun, manifestDir),
            "status" => Status(manifestDir),
            "lint" or "verify" => Lint(detailed: false),
            "help" or "--help" or "-h" => Help(),
            _ => Fail($"Comando desconocido: {command}")
        };
    }

    // ── Interfaz ───────────────────────────────────────────────────────────────

    private static int Help()
    {
        Console.WriteLine($"""
            NZT installer {Version}

              nzt                                    menú interactivo
              nzt install --provider <id> [--dry-run]
              nzt uninstall --provider <id> [--dry-run]
              nzt status
              nzt lint | verify

            Proveedores: claude-code, codex, all
            """);
        return 0;
    }

    /// <summary>
    /// El menú: instalar, desinstalar, verificar el contenido, ver estado. Vuelve
    /// a preguntar hasta que se elige salir, porque verificar y ver estado no son
    /// el final de nada. Las dos acciones que escriben muestran la simulación
    /// completa y recién ahí preguntan.
    /// </summary>
    private static int Menu()
    {
        Console.WriteLine($"NZT installer {Version}\n");

        while (true)
        {
            Console.WriteLine("  ¿Qué querés hacer?\n");
            Console.WriteLine("    1) Instalar");
            Console.WriteLine("    2) Desinstalar");
            Console.WriteLine("    3) Verificar el contenido");
            Console.WriteLine("    4) Ver estado");
            Console.WriteLine("    5) Salir\n");
            Console.Write("  Opción: ");

            var choice = Console.ReadLine()?.Trim();
            Console.WriteLine();

            // Sin entrada —una tubería cerrada, no una terminal— se sale en vez
            // de girar para siempre sobre un ReadLine que ya devolvió null.
            if (choice is null) return 0;

            switch (choice)
            {
                case "1": MenuInstall(); break;
                case "2": MenuUninstall(); break;
                case "3": Lint(detailed: true); break;
                case "4": Status(null); break;
                case "5": return 0;
                default: Error("Opción inválida."); break;
            }

            Console.WriteLine();
        }
    }

    private static void MenuInstall()
    {
        var targets = AskProvider("¿Dónde lo instalo?");
        if (targets.Count == 0) return;

        // Primero se muestra exactamente lo que haría, y recién ahí se pregunta.
        if (Install(targets, dryRun: true, null) != 0) return;

        if (!Confirm("¿Instalar?"))
        {
            Console.WriteLine("  No se escribió nada.");
            return;
        }

        Install(targets, dryRun: false, null);
    }

    private static void MenuUninstall()
    {
        var targets = AskProvider("¿De dónde lo saco?");
        if (targets.Count == 0) return;

        // La simulación va primero acá también, y más: esto borra. Lo que se
        // conserva por estar editado aparece antes de confirmar, no después.
        Console.WriteLine("  Se remueve solamente lo que instaló este CLI, según su manifiesto.\n");
        if (Uninstall(targets, dryRun: true, null) != 0) return;

        if (!Confirm("¿Desinstalar?"))
        {
            Console.WriteLine("  No se borró nada.");
            return;
        }

        Uninstall(targets, dryRun: false, null);
    }

    private static IReadOnlyList<Provider> AskProvider(string question)
    {
        Console.WriteLine($"  {question}\n");
        Console.WriteLine("    1) Claude Code");
        Console.WriteLine("    2) Codex");
        Console.WriteLine("    3) Todos los proveedores soportados");
        Console.WriteLine("    4) Volver\n");
        Console.Write("  Opción: ");

        var choice = Console.ReadLine()?.Trim();
        Console.WriteLine();

        var targets = ProvidersFor(choice);
        if (targets.Count == 0 && choice is not null and not "4") Error("Opción inválida.");

        return targets;
    }

    /// <summary>La opción del menú, traducida a proveedores. `4`, vacío o inválido no eligen ninguno.</summary>
    public static IReadOnlyList<Provider> ProvidersFor(string? choice) => choice switch
    {
        "1" => [Provider.ClaudeCode()],
        "2" => [Provider.Codex()],
        "3" => Provider.All,
        _ => []
    };

    private static bool Confirm(string question)
    {
        Console.Write($"\n  {question} [s/N]: ");
        var answer = Console.ReadLine()?.Trim().ToLowerInvariant();
        Console.WriteLine();
        return answer is "s" or "si" or "sí" or "y" or "yes";
    }

    // ── Comandos ───────────────────────────────────────────────────────────────

    private static int Install(IReadOnlyList<Provider> providers, bool dryRun, string? manifestDir)
    {
        if (providers.Count == 0) return 1;

        var catalog = ContentCatalog.Load();
        var report = Linter.Run(catalog);

        // El instalador no escribe nada si el set no valida: una skill con el
        // name desalineado del path se instala con un nombre que nadie rutea.
        if (!report.Ok)
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

            if (provider.PathWarning is { } warning) Warn(warning);

            var result = Installer.Install(provider, catalog, Version, dryRun, manifestDir);

            if (result.Aborted)
            {
                Error("No se instaló nada en este proveedor:");
                foreach (var conflict in result.Conflicts)
                    Console.WriteLine($"    {conflict.TargetPath}\n      {conflict.Reason}");
                failed = true;
                Console.WriteLine();
                continue;
            }

            Console.WriteLine($"  instrucciones  {provider.InstructionsFile}");
            Console.WriteLine($"  skills         {provider.SkillsDirectory}");
            Summary(result.Outcomes);

            foreach (var skipped in result.Outcomes.Where(o => o.Action == FileAction.SkippedLocallyEdited))
                Warn($"editado localmente, se conserva: {skipped.TargetPath}");

            if (!dryRun) Console.WriteLine($"  {provider.Usage}");
            Console.WriteLine();
        }

        Console.WriteLine($"{report.SkillCount} skills · ~{report.ListingChars} chars de listado"
            + $" (piso de Codex: {LintReport.CodexFloor})");
        if (report.OverListingFloor)
            Warn("el listado pasa el piso de 8.000. Con contexto desconocido Codex acorta "
                + "descriptions y puede omitir skills del listado (R1/C2).");

        return failed ? 1 : 0;
    }

    private static int Uninstall(IReadOnlyList<Provider> providers, bool dryRun, string? manifestDir)
    {
        if (providers.Count == 0) return 1;

        foreach (var provider in providers)
        {
            Console.WriteLine($"{provider.DisplayName}{(dryRun ? "  (simulación)" : "")}");

            var result = Installer.Uninstall(provider, dryRun, manifestDir);

            if (!result.HadManifest)
            {
                Console.WriteLine("  no hay manifiesto: no hay nada instalado por este CLI.\n");
                continue;
            }

            Summary(result.Outcomes);
            foreach (var skipped in result.Outcomes.Where(o => o.Action == FileAction.SkippedLocallyEdited))
                Warn($"editado localmente, se conserva: {skipped.TargetPath}");
            Console.WriteLine();
        }

        return 0;
    }

    private static int Status(string? manifestDir)
    {
        foreach (var provider in Provider.All)
        {
            var manifest = Manifest.Load(provider.Id, manifestDir);
            Console.WriteLine(provider.DisplayName);

            if (manifest is null)
            {
                Console.WriteLine("  no instalado\n");
                continue;
            }

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
            Console.WriteLine($"  archivos       {manifest.Files.Count}"
                + (edited > 0 ? $", {edited} editado(s) localmente" : "")
                + (missing > 0 ? $", {missing} faltante(s)" : ""));
            Console.WriteLine($"  manifiesto     {Manifest.PathFor(provider.Id, manifestDir)}\n");
        }

        return 0;
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

    // ── Auxiliares ─────────────────────────────────────────────────────────────

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
