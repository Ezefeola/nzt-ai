using System.Runtime.InteropServices;
using System.Security.Cryptography;

namespace Nzt.Cli.Install;

/// <summary>
/// Bajar algo por HTTP. Es la costura que deja probar `update` sin red.
/// `null` es que no se pudo: el motivo lo dice quien llama.
/// </summary>
public interface IDownloader
{
    byte[]? Get(string url);

    /// <summary>El tag al que redirige `releases/latest`, o `null` si no contestó a tiempo.</summary>
    string? LatestTag();
}

public sealed class HttpDownloader(TimeSpan timeout) : IDownloader
{
    public byte[]? Get(string url)
    {
        try
        {
            using var client = new HttpClient { Timeout = timeout };
            return client.GetByteArrayAsync(url).GetAwaiter().GetResult();
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or UriFormatException)
        {
            return null;
        }
    }

    // `releases/latest` redirige a `releases/tag/vX.Y.Z`: el tag sale del Location,
    // sin la API de GitHub ni su límite de pedidos.
    public string? LatestTag()
    {
        try
        {
            using var client = new HttpClient(new HttpClientHandler { AllowAutoRedirect = false }) { Timeout = timeout };
            using var response = client.Send(new HttpRequestMessage(HttpMethod.Head, $"{Updater.Repo}/releases/latest"));
            var location = response.Headers.Location?.ToString();
            return location?.Split('/').LastOrDefault(s => s.Length > 0);
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
        {
            return null;
        }
    }
}

/// <summary>Lo que dice el release frente al binario que corre.</summary>
public sealed record UpdateCheck(string Asset, string BaseUrl, string? ExpectedHash, bool Available, string? Problem);

/// <summary>
/// `nzt-ai update` (RN-cli-update): el binario de la plataforma del último release,
/// verificado contra `SHA256SUMS` como lo hace el script de la línea (10.2), con
/// las mismas `NZT_VERSION` y `NZT_DOWNLOAD_BASE`. Que haya una versión nueva se
/// decide por el hash: el binario que corre no es el del release.
/// </summary>
public static class Updater
{
    public const string Repo = "https://github.com/Ezefeola/nzt-ai";

    /// <summary>El asset de esta plataforma, con el nombre que publica el release (10.1).</summary>
    public static string? AssetName()
    {
        var os = OperatingSystem.IsWindows() ? "win"
            : OperatingSystem.IsLinux() ? "linux"
            : OperatingSystem.IsMacOS() ? "osx"
            : null;
        var arch = RuntimeInformation.OSArchitecture switch
        {
            Architecture.X64 => "x64",
            Architecture.Arm64 => "arm64",
            _ => null
        };
        if (os is null || arch is null) return null;
        return $"nzt-{os}-{arch}" + (os == "win" ? ".exe" : "");
    }

    public static string BaseUrl()
    {
        var mirror = Environment.GetEnvironmentVariable("NZT_DOWNLOAD_BASE");
        if (!string.IsNullOrWhiteSpace(mirror)) return mirror.TrimEnd('/');

        var version = Environment.GetEnvironmentVariable("NZT_VERSION");
        return string.IsNullOrWhiteSpace(version)
            ? $"{Repo}/releases/latest/download"
            : $"{Repo}/releases/download/{version}";
    }

    /// <summary>La línea de `SHA256SUMS` para `asset`, en formato `sha256sum` (con o sin `*`).</summary>
    public static string? ExpectedHash(string sums, string asset) =>
        sums.Split('\n')
            .Select(line => line.Trim().Split((char[])[' ', '\t'], 2, StringSplitOptions.RemoveEmptyEntries))
            .Where(parts => parts.Length == 2 && parts[1].Trim().TrimStart('*') == asset)
            .Select(parts => parts[0].ToLowerInvariant())
            .FirstOrDefault();

    public static string HashOf(byte[] content) => Convert.ToHexStringLower(SHA256.HashData(content));

    public static UpdateCheck Check(IDownloader downloader, string currentExecutable)
    {
        var baseUrl = BaseUrl();
        if (AssetName() is not { } asset)
            return new UpdateCheck("", baseUrl, null, false,
                $"no hay binario de NZT para {RuntimeInformation.OSDescription} {RuntimeInformation.OSArchitecture}");

        if (downloader.Get($"{baseUrl}/SHA256SUMS") is not { } sums)
            return new UpdateCheck(asset, baseUrl, null, false, $"no se pudo bajar {baseUrl}/SHA256SUMS");

        var expected = ExpectedHash(System.Text.Encoding.UTF8.GetString(sums), asset);
        if (expected is null)
            return new UpdateCheck(asset, baseUrl, null, false, $"SHA256SUMS no tiene una línea para {asset}");

        var current = HashOf(File.ReadAllBytes(currentExecutable));
        return new UpdateCheck(asset, baseUrl, expected, current != expected, null);
    }

    /// <summary>Baja el binario y lo verifica. `null` y el motivo si no coincide.</summary>
    public static (byte[]? Content, string? Problem) Download(IDownloader downloader, UpdateCheck check)
    {
        var url = $"{check.BaseUrl}/{check.Asset}";
        if (downloader.Get(url) is not { } content) return (null, $"no se pudo bajar {url}");
        return HashOf(content) == check.ExpectedHash
            ? (content, null)
            : (null, $"el SHA256 de {check.Asset} no coincide con SHA256SUMS");
    }

    /// <summary>
    /// Deja `content` en `target`. En Windows el ejecutable que corre no se puede
    /// pisar, pero sí renombrar: el viejo queda como `.old` y se borra en la
    /// siguiente ejecución (RN-cli-update-windows). En el resto se escribe al lado
    /// y se mueve encima, que es atómico.
    /// </summary>
    public static void Replace(byte[] content, string target)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(target)!);
        var next = target + ".new";
        File.WriteAllBytes(next, content);

        if (OperatingSystem.IsWindows())
        {
            var old = target + ".old";
            if (File.Exists(old)) File.Delete(old);
            if (File.Exists(target)) File.Move(target, old);
            File.Move(next, target);
            return;
        }

        File.SetUnixFileMode(next, UnixFileMode.UserRead | UnixFileMode.UserWrite | UnixFileMode.UserExecute
            | UnixFileMode.GroupRead | UnixFileMode.GroupExecute | UnixFileMode.OtherRead | UnixFileMode.OtherExecute);
        File.Move(next, target, overwrite: true);
    }

    /// <summary>El `.old` que dejó una actualización en Windows. Si sigue en uso, la próxima.</summary>
    public static void CleanUp(string target)
    {
        try { File.Delete(target + ".old"); }
        catch (Exception ex) when (ex is IOException or UnauthorizedAccessException) { }
    }

    /// <summary>
    /// La versión nueva que muestra el menú (QP-05), o `null` si no hay o no se supo
    /// a tiempo. Con un espejo o una versión fija no hay tag que leer: decide el hash.
    /// </summary>
    public static string? NewerVersion(IDownloader downloader, string currentExecutable, string currentVersion)
    {
        var pinned = !string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("NZT_DOWNLOAD_BASE"))
            || !string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("NZT_VERSION"));
        if (pinned)
            return Check(downloader, currentExecutable) is { Available: true } ? "la del release" : null;

        var tag = downloader.LatestTag();
        if (tag is null || !System.Version.TryParse(tag.TrimStart('v'), out var latest)) return null;
        return System.Version.TryParse(currentVersion, out var current) && latest > current ? latest.ToString(3) : null;
    }
}
