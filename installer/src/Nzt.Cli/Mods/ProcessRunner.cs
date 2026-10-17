using System.ComponentModel;
using System.Diagnostics;
using System.Text;

namespace Nzt.Cli.Mods;

public sealed class ProcessRunner : ICommandRunner
{
    // Clonar el marketplace la primera vez puede tardar; colgarse para siempre, no.
    private static readonly TimeSpan Timeout = TimeSpan.FromMinutes(5);

    public CommandResult? Run(string executable, IReadOnlyList<string> arguments)
    {
        // En Windows, una instalación con npm deja `claude.cmd` en vez de `claude.exe`.
        string[] candidates = OperatingSystem.IsWindows() ? [executable, executable + ".cmd"] : [executable];

        foreach (var candidate in candidates)
        {
            var result = TryRun(candidate, arguments);
            if (result is not null) return result;
        }

        return null;
    }

    private static CommandResult? TryRun(string executable, IReadOnlyList<string> arguments)
    {
        var start = new ProcessStartInfo(executable)
        {
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            RedirectStandardInput = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };
        foreach (var argument in arguments) start.ArgumentList.Add(argument);

        var output = new StringBuilder();
        var error = new StringBuilder();
        using var process = new Process { StartInfo = start };
        process.OutputDataReceived += (_, e) => { if (e.Data is not null) output.AppendLine(e.Data); };
        process.ErrorDataReceived += (_, e) => { if (e.Data is not null) error.AppendLine(e.Data); };

        try
        {
            process.Start();
        }
        catch (Win32Exception)
        {
            return null;
        }

        // Sin entrada: un comando que pregunte algo falla en vez de esperar una respuesta.
        process.StandardInput.Close();
        process.BeginOutputReadLine();
        process.BeginErrorReadLine();

        if (!process.WaitForExit(Timeout))
        {
            process.Kill(entireProcessTree: true);
            return new CommandResult(-1, output.ToString(), $"no terminó en {Timeout.TotalMinutes:0} minutos");
        }

        // La sobrecarga sin plazo espera también a que se vacíen las salidas redirigidas.
        process.WaitForExit();
        return new CommandResult(process.ExitCode, output.ToString(), error.ToString());
    }
}
