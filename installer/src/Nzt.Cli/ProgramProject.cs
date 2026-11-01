using Nzt.Cli.Content;
using Nzt.Cli.Install;
using Nzt.Cli.Lint;
using Nzt.Cli.Project;
using Spectre.Console;

namespace Nzt.Cli;

/// <summary>
/// `nzt-ai project`: lo que se instala por proyecto. El marco es global; lo de una
/// tecnología, una arquitectura o tus reglas de código entra solo en el proyecto
/// que lo eligió, junto con los MCP que necesita.
/// </summary>
public static partial class Program
{
    /// <summary>Los flags que llevan valor: lo que sigue a uno de ellos no es un pack.</summary>
    private static readonly string[] ValueFlags = ["--provider", "--dir", "--manifest-dir", "--bin-dir", "--mods"];

    private static int ProjectCommand(string[] args, bool dryRun)
    {
        var directory = Path.GetFullPath(ValueOf(args, "--dir") ?? Directory.GetCurrentDirectory());
        var positional = Positional(args).Skip(1).ToList();
        var subcommand = positional.FirstOrDefault()?.ToLowerInvariant();
        var names = positional.Skip(1).ToList();
        var catalog = PackCatalog.Load();
        var current = ProjectFile.Load(directory);

        switch (subcommand)
        {
            case null or "status":
                return ProjectStatus(directory, current, catalog);
            case "packs":
                return ListPacks(catalog, current);
            case "add":
                if (names.Count == 0) return Fail("Falta qué packs: nzt-ai project add <pack>... (los ves con nzt-ai project packs).");
                var targets = ProjectTargetsFrom(args, current);
                if (targets is null) return 1;
                return ProjectApply(directory, [.. current?.Packs ?? [], .. names], targets, catalog, dryRun);
            case "remove":
                if (names.Count == 0) return Fail("Falta qué packs: nzt-ai project remove <pack>...");
                if (current is null) return Fail("Este proyecto no tiene packs instalados por nzt-ai.");
                var missing = names.Where(n => !current.Packs.Contains(n, StringComparer.OrdinalIgnoreCase)).ToList();
                if (missing.Count > 0) Warn($"no están entre los packs pedidos del proyecto: {string.Join(", ", missing)}.");
                return ProjectApply(directory,
                    [.. current.Packs.Where(p => !names.Contains(p, StringComparer.OrdinalIgnoreCase))],
                    TargetsOf(current), catalog, dryRun);
            case "sync":
                if (current is null) return Fail($"No hay {ProjectFile.RelativePath} en {directory}: nada que sincronizar.");
                return ProjectApply(directory, current.Packs, TargetsOf(current), catalog, dryRun);
            default:
                return Fail($"Subcomando desconocido: project {subcommand}. Son packs, add, remove, sync y status.");
        }
    }

    private static int ListPacks(PackCatalog catalog, ProjectFile? current)
    {
        foreach (var pack in catalog.Packs)
        {
            var installed = current?.Packs.Contains(pack.Name, StringComparer.OrdinalIgnoreCase) == true ? "  (instalado)" : "";
            Console.WriteLine($"  {pack.Name,-10}{pack.Description}{installed}");

            var extras = new List<string>();
            if (pack.Requires.Count > 0) extras.Add($"trae {string.Join(", ", pack.Requires)}");
            if (pack.Skill is { } skill) extras.Add($"skill {skill.Name}");
            if (pack.Mcp.Count > 0) extras.Add($"MCP {string.Join(", ", pack.Mcp.Select(m => m.Name))}");
            if (extras.Count > 0) Console.WriteLine($"  {"",-10}{string.Join(" · ", extras)}");
        }
        return 0;
    }

    private static int ProjectStatus(string directory, ProjectFile? current, PackCatalog catalog)
    {
        Console.WriteLine($"Proyecto  {directory}");
        if (current is null)
        {
            Console.WriteLine("  sin packs. Los disponibles: nzt-ai project packs.");
            return 0;
        }

        var (resolved, unknown) = catalog.Resolve(current.Packs);
        Console.WriteLine($"  packs          {string.Join(", ", current.Packs)}"
            + (resolved.Count > current.Packs.Count ? $" (con lo que requieren: {string.Join(", ", resolved.Select(p => p.Name))})" : ""));
        Console.WriteLine($"  proveedores    {string.Join(", ", current.Providers)}");
        Console.WriteLine($"  versión        {current.Version}{(current.Version != Version ? $" (este nzt-ai es {Version}: nzt-ai project sync la actualiza)" : "")}");

        var edited = current.Files.Count(f => File.Exists(Path.Combine(directory, f.Path))
                                              && Manifest.HashFile(Path.Combine(directory, f.Path)) != f.Sha256);
        var missing = current.Files.Count(f => !File.Exists(Path.Combine(directory, f.Path)));
        Console.WriteLine($"  archivos       {current.Files.Count}"
            + (edited > 0 ? $", {edited} editado(s) localmente" : "")
            + (missing > 0 ? $", {missing} faltante(s): nzt-ai project sync los repone" : ""));
        foreach (var (provider, servers) in current.Mcp)
            Console.WriteLine(McpStatusLine(provider, servers));
        if (unknown.Count > 0) Warn($"packs que este nzt-ai no conoce: {string.Join(", ", unknown)}.");
        return 0;
    }

    /// <summary>La línea de `nzt-ai project` con los MCP de un proveedor, en la columna de las demás.</summary>
    public static string McpStatusLine(string provider, IEnumerable<string> servers) =>
        $"  MCP            {provider}: {string.Join(", ", servers)}";

    private static int ProjectApply(string directory, IReadOnlyList<string> packs, IReadOnlyList<ProjectTarget> targets,
        PackCatalog catalog, bool dryRun)
    {
        var report = Linter.RunPacks(catalog);
        if (!report.Ok)
        {
            Error($"Los packs no validan: {report.Issues.Count} problema(s). No se escribió nada.");
            foreach (var issue in report.Issues.Take(20)) Console.WriteLine($"    {issue.Where}: {issue.Message}");
            return 1;
        }

        Console.WriteLine($"Proyecto  {directory}{(dryRun ? "  (simulación)" : "")}");
        var result = ProjectInstaller.Apply(directory, packs, targets, catalog, Version, dryRun);

        if (result.Unknown.Count > 0)
            return Fail($"Pack desconocido: {string.Join(", ", result.Unknown)}. Los disponibles: nzt-ai project packs.");

        if (result.Conflicts.Count > 0)
        {
            Error("No se instaló nada: hay archivos que no escribió nzt-ai.");
            foreach (var conflict in result.Conflicts) Console.WriteLine($"    {conflict.TargetPath}: {conflict.Reason}");
            return 1;
        }

        Console.WriteLine($"  packs          {(result.Packs.Count == 0 ? "ninguno" : string.Join(", ", result.Packs.Select(p => p.Name)))}");
        Console.WriteLine($"  proveedores    {string.Join(", ", targets.Select(t => t.DisplayName))}");
        Summary(result.Files);
        foreach (var skipped in result.Files.Where(o => o.Action == FileAction.SkippedLocallyEdited))
            Warn($"editado localmente, se conserva: {skipped.TargetPath}");

        foreach (var (target, outcomes) in result.Mcp)
        foreach (var outcome in outcomes)
        {
            var line = $"  MCP {outcome.Name,-16}{target.McpFile}  " + outcome.Action switch
            {
                McpAction.Added => dryRun ? "se agrega" : "agregado",
                McpAction.Unchanged => "al día",
                McpAction.Removed => dryRun ? "se saca" : "sacado",
                McpAction.KeptUsers => "ya existe uno tuyo con ese nombre: se queda el tuyo",
                _ => $"no hay comando para esta plataforma ({McpServer.CurrentPlatform})"
            };
            if (outcome.Action is McpAction.KeptUsers or McpAction.Unsupported) Warn(line.TrimStart());
            else Console.WriteLine(line);
        }

        var changed = result.Files.Any(f => f.Action is FileAction.Created or FileAction.Updated or FileAction.Removed)
                      || result.Mcp.Any(m => m.Outcomes.Any(o => o.Action is McpAction.Added or McpAction.Removed));
        if (changed && !dryRun)
            Console.WriteLine("  Abrí una sesión nueva para que el agente cargue las skills y los MCP del proyecto.");
        return 0;
    }

    private static void MenuProject()
    {
        var directory = Directory.GetCurrentDirectory();
        var catalog = PackCatalog.Load();
        var current = ProjectFile.Load(directory);
        Console.WriteLine($"  Proyecto: {directory}\n");

        var prompt = new MultiSelectionPrompt<Pack>()
            .Title("  ¿Qué packs quiere este proyecto? (espacio marca, Enter confirma)")
            .NotRequired()
            .HighlightStyle(new Style(foreground: Color.Cyan1))
            .UseConverter(p => $"{p.Name} — {Markup.Escape(p.Description)}")
            .AddChoices(catalog.Packs);
        foreach (var pack in catalog.Packs.Where(p => current?.Packs.Contains(p.Name, StringComparer.OrdinalIgnoreCase) == true))
            prompt.Select(pack);

        var chosen = AnsiConsole.Prompt(prompt).Select(p => p.Name).ToList();
        var targets = current is null ? AskProjectTargets() : TargetsOf(current);
        if (targets.Count == 0) return;

        if (ProjectApply(directory, chosen, targets, catalog, dryRun: true) != 0) return;
        if (!Confirm("¿Aplicar?"))
        {
            Console.WriteLine("  No se escribió nada.");
            return;
        }
        ProjectApply(directory, chosen, targets, catalog, dryRun: false);
    }

    private static IReadOnlyList<ProjectTarget> AskProjectTargets()
    {
        var choice = Ask("¿Para qué proveedor?", ProviderLabel,
            ProviderChoice.ClaudeCode, ProviderChoice.Codex, ProviderChoice.All, ProviderChoice.Back);
        Console.WriteLine();
        return ProjectTargetsFor(choice);
    }

    public static IReadOnlyList<ProjectTarget> ProjectTargetsFor(ProviderChoice choice) => choice switch
    {
        ProviderChoice.ClaudeCode => [ProjectTarget.ClaudeCode],
        ProviderChoice.Codex => [ProjectTarget.Codex],
        ProviderChoice.All => ProjectTarget.All,
        _ => []
    };

    /// <summary>
    /// Los proveedores de `--provider`, sumados a los que el proyecto ya tiene. Sin
    /// el flag: los del proyecto, o Claude Code en uno nuevo.
    /// </summary>
    private static IReadOnlyList<ProjectTarget>? ProjectTargetsFrom(string[] args, ProjectFile? current)
    {
        var existing = current is null ? [] : TargetsOf(current);
        var id = ValueOf(args, "--provider");
        if (id is null) return existing.Count > 0 ? existing : [ProjectTarget.ClaudeCode];

        IReadOnlyList<ProjectTarget> asked = string.Equals(id, "all", StringComparison.OrdinalIgnoreCase)
            ? ProjectTarget.All
            : ProjectTarget.ById(id) is { } one ? [one] : [];
        if (asked.Count == 0)
        {
            Fail($"Proveedor desconocido: {id}. Son claude-code, codex o all.");
            return null;
        }

        return [.. ProjectTarget.All.Where(t => existing.Contains(t) || asked.Contains(t))];
    }

    private static IReadOnlyList<ProjectTarget> TargetsOf(ProjectFile project) =>
        [.. project.Providers.Select(ProjectTarget.ById).OfType<ProjectTarget>()];

    private static IEnumerable<string> Positional(string[] args)
    {
        for (var i = 0; i < args.Length; i++)
        {
            if (ValueFlags.Contains(args[i], StringComparer.OrdinalIgnoreCase)) { i++; continue; }
            if (!args[i].StartsWith('-')) yield return args[i];
        }
    }
}
