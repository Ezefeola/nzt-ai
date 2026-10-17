namespace Nzt.Cli.Mods;

public sealed record CommandResult(int ExitCode, string Output, string Error)
{
    public bool Ok => ExitCode == 0;

    /// <summary>La línea que explica una falla: la primera del error, o la última de la salida.</summary>
    public string Reason =>
        FirstLine(Error) ?? LastLine(Output) ?? $"terminó con código {ExitCode}";

    private static string? FirstLine(string text) =>
        text.Split('\n').Select(l => l.Trim()).FirstOrDefault(l => l.Length > 0);

    private static string? LastLine(string text) =>
        text.Split('\n').Select(l => l.Trim()).LastOrDefault(l => l.Length > 0);
}

/// <summary>
/// Correr un programa y leer lo que dijo. Es la costura que deja probar los mods
/// sin tocar el Claude Code real de la máquina.
/// </summary>
public interface ICommandRunner
{
    /// <summary>`null` cuando el programa no existe en esta máquina.</summary>
    CommandResult? Run(string executable, IReadOnlyList<string> arguments);
}
