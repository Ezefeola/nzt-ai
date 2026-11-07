using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Runtime.Versioning;
using Microsoft.Win32;

namespace Nzt.Cli.Install;

/// <summary>Qué pasó con la copia instalada del CLI.</summary>
public enum CliAction { Installed, Updated, Unchanged, Removed, NotInstalled, NotSingleFile, Failed }

/// <summary>
/// El resultado de instalar o sacar `nzt-ai`. `PathLine` es la línea que el usuario
/// tiene que agregar a su perfil cuando la carpeta no está en el PATH (RN-cli-path).
/// </summary>
public sealed record CliOutcome(CliAction Action, string Target, bool PathChanged = false,
    string? PathLine = null, string? Detail = null);

/// <summary>
/// El CLI que queda instalado como `nzt-ai` (sección 12 de la spec). Se copia a sí
/// mismo: solo un binario de un solo archivo se puede copiar entero, así que corrido
/// con `dotnet run` dice que no y sigue.
/// </summary>
public static class CliCommand
{
    public const string Name = "nzt-ai";

    private static string FileName => OperatingSystem.IsWindows() ? $"{Name}.exe" : Name;

    /// <summary>`%LOCALAPPDATA%/nzt/bin` en Windows, `~/.local/bin` en el resto (QT-23).</summary>
    public static string DefaultDirectory => OperatingSystem.IsWindows()
        ? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "nzt", "bin")
        : Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), ".local", "bin");

    public static string PathFor(string? directory = null) => Path.Combine(directory ?? DefaultDirectory, FileName);

    /// <summary>
    /// El ejecutable que corre, si es un binario de un solo archivo. En uno así el
    /// ensamblado no tiene ubicación propia: está adentro del ejecutable.
    /// </summary>
    public static string? RunningSingleFile() =>
        string.IsNullOrEmpty(typeof(CliCommand).Assembly.Location) ? Environment.ProcessPath : null;

    /// <summary>
    /// Deja `source` como `nzt-ai`. Con un `directory` explícito no toca el PATH: es
    /// lo que usan las comprobaciones, que nunca tocan la máquina real.
    /// </summary>
    public static CliOutcome Install(string? source, bool dryRun, string? directory = null)
    {
        var target = PathFor(directory);
        if (source is null) return new CliOutcome(CliAction.NotSingleFile, target);

        var exists = File.Exists(target);
        var same = exists && (SamePath(source, target) || SameContent(source, target));
        var action = same ? CliAction.Unchanged : exists ? CliAction.Updated : CliAction.Installed;

        if (!dryRun && !same)
        {
            try
            {
                Directory.CreateDirectory(Path.GetDirectoryName(target)!);
                File.Copy(source, target, overwrite: true);
                if (!OperatingSystem.IsWindows())
                    File.SetUnixFileMode(target, UnixFileMode.UserRead | UnixFileMode.UserWrite
                        | UnixFileMode.UserExecute | UnixFileMode.GroupRead | UnixFileMode.GroupExecute
                        | UnixFileMode.OtherRead | UnixFileMode.OtherExecute);
            }
            catch (Exception ex) when (ex is IOException or UnauthorizedAccessException)
            {
                // Un nzt-ai corriendo en Windows no se puede pisar: no frena la instalación.
                return new CliOutcome(CliAction.Failed, target, Detail: ex.Message);
            }
        }

        if (directory is not null) return new CliOutcome(action, target);

        var folder = Path.GetDirectoryName(target)!;
        if (OperatingSystem.IsWindows())
            return new CliOutcome(action, target, PathChanged: !UserPathHas(folder) && (dryRun || AddToUserPath(folder)));

        return InProcessPath(folder)
            ? new CliOutcome(action, target)
            : new CliOutcome(action, target, PathLine: $"export PATH=\"$HOME/.local/bin:$PATH\"");
    }

    /// <summary>
    /// Saca `nzt-ai` y, en Windows, su carpeta del PATH del usuario. Solo cuando no
    /// queda nada instalado por el CLI (QT-26): eso lo decide quien llama.
    /// </summary>
    public static CliOutcome Uninstall(bool dryRun, string? directory = null)
    {
        var target = PathFor(directory);
        if (!File.Exists(target)) return new CliOutcome(CliAction.NotInstalled, target);

        var pathChanged = false;
        if (!dryRun)
        {
            try
            {
                File.Delete(target);
                var folder = Path.GetDirectoryName(target)!;
                if (directory is null && OperatingSystem.IsWindows())
                {
                    pathChanged = RemoveFromUserPath(folder);
                    if (!Directory.EnumerateFileSystemEntries(folder).Any()) Directory.Delete(folder);
                }
            }
            catch (Exception ex) when (ex is IOException or UnauthorizedAccessException)
            {
                return new CliOutcome(CliAction.Failed, target, Detail: ex.Message);
            }
        }
        else if (directory is null && OperatingSystem.IsWindows())
        {
            pathChanged = UserPathHas(Path.GetDirectoryName(target)!);
        }

        return new CliOutcome(CliAction.Removed, target, PathChanged: pathChanged);
    }

    private static bool SamePath(string a, string b) =>
        string.Equals(Path.GetFullPath(a), Path.GetFullPath(b),
            OperatingSystem.IsWindows() ? StringComparison.OrdinalIgnoreCase : StringComparison.Ordinal);

    private static bool SameContent(string a, string b) =>
        SHA256.HashData(File.ReadAllBytes(a)).AsSpan().SequenceEqual(SHA256.HashData(File.ReadAllBytes(b)));

    private static bool InProcessPath(string folder) =>
        (Environment.GetEnvironmentVariable("PATH") ?? "")
            .Split(Path.PathSeparator, StringSplitOptions.RemoveEmptyEntries)
            .Any(entry => SamePath(entry.TrimEnd('/'), folder));

    // ── El PATH del usuario en Windows ──────────────────────────────────────────
    // Se edita el registro directo, y no con Environment.SetEnvironmentVariable,
    // para conservar el tipo del valor: un PATH REG_EXPAND_SZ con %USERPROFILE%
    // tiene que seguir expandiéndose después de que le agregamos una carpeta.

    private const string EnvironmentKey = "Environment";

    [SupportedOSPlatform("windows")]
    private static (string Value, RegistryValueKind Kind) ReadUserPath()
    {
        using var key = Registry.CurrentUser.OpenSubKey(EnvironmentKey);
        if (key?.GetValue("Path", null, RegistryValueOptions.DoNotExpandEnvironmentNames) is not string value)
            return ("", RegistryValueKind.ExpandString);
        return (value, key.GetValueKind("Path"));
    }

    [SupportedOSPlatform("windows")]
    private static bool UserPathHas(string folder) =>
        ReadUserPath().Value.Split(';', StringSplitOptions.RemoveEmptyEntries)
            .Any(entry => SamePath(Environment.ExpandEnvironmentVariables(entry).TrimEnd('\\'), folder));

    [SupportedOSPlatform("windows")]
    private static bool AddToUserPath(string folder)
    {
        var (value, kind) = ReadUserPath();
        WriteUserPath(value.Length == 0 ? folder : $"{value.TrimEnd(';')};{folder}", kind);
        return true;
    }

    [SupportedOSPlatform("windows")]
    private static bool RemoveFromUserPath(string folder)
    {
        var (value, kind) = ReadUserPath();
        var entries = value.Split(';', StringSplitOptions.RemoveEmptyEntries);
        var kept = entries
            .Where(entry => !SamePath(Environment.ExpandEnvironmentVariables(entry).TrimEnd('\\'), folder))
            .ToArray();
        if (kept.Length == entries.Length) return false;

        WriteUserPath(string.Join(';', kept), kind);
        return true;
    }

    [SupportedOSPlatform("windows")]
    private static void WriteUserPath(string value, RegistryValueKind kind)
    {
        using (var key = Registry.CurrentUser.CreateSubKey(EnvironmentKey))
            key.SetValue("Path", value, kind);

        // Sin este aviso, solo las sesiones que se abren después de reiniciar ven el cambio.
        SendMessageTimeout(new IntPtr(0xFFFF), 0x001A, IntPtr.Zero, EnvironmentKey, 0x0002, 5000, out _);
    }

    [DllImport("user32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern IntPtr SendMessageTimeout(IntPtr hWnd, uint msg, IntPtr wParam, string lParam,
        uint flags, uint timeout, out IntPtr result);
}
