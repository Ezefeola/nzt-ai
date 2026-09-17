using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Nzt.Cli.Install;

public sealed record ManifestEntry(string Path, string Sha256, bool ManagedBlock = false);

/// <summary>
/// Lo que permite desinstalar sin adivinar y, sobre todo, lo que permite no
/// pisar nada que este CLI no haya escrito él mismo. Vive fuera de la carpeta
/// del proveedor: ahí van skills e instrucciones, nada de contabilidad.
/// </summary>
public sealed record Manifest
{
    [JsonPropertyName("provider")] public required string Provider { get; init; }
    [JsonPropertyName("nztVersion")] public required string Version { get; init; }
    [JsonPropertyName("installedAt")] public required DateTimeOffset InstalledAt { get; init; }
    [JsonPropertyName("files")] public required List<ManifestEntry> Files { get; init; }

    private static readonly JsonSerializerOptions Options = new() { WriteIndented = true };

    public static string DirectoryPath
    {
        get
        {
            var root = OperatingSystem.IsWindows()
                ? Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData)
                : System.IO.Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.UserProfile),
                    ".local", "share");
            return System.IO.Path.Combine(root, "nzt", "manifests");
        }
    }

    public static string PathFor(string providerId, string? directory = null) =>
        System.IO.Path.Combine(directory ?? DirectoryPath, $"{providerId}.json");

    public static Manifest? Load(string providerId, string? directory = null)
    {
        var path = PathFor(providerId, directory);
        if (!File.Exists(path)) return null;
        try
        {
            return JsonSerializer.Deserialize<Manifest>(File.ReadAllText(path), Options);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    public void Save(string? directory = null)
    {
        Directory.CreateDirectory(directory ?? DirectoryPath);
        File.WriteAllText(PathFor(Provider, directory), JsonSerializer.Serialize(this, Options));
    }

    public static void Delete(string providerId, string? directory = null)
    {
        var path = PathFor(providerId, directory);
        if (File.Exists(path)) File.Delete(path);
    }

    public string? HashOf(string path) =>
        Files.FirstOrDefault(f => string.Equals(f.Path, path, StringComparison.OrdinalIgnoreCase))?.Sha256;

    /// <summary>
    /// Hash sobre el contenido normalizado: un checkout con otro fin de línea no
    /// es una edición local del usuario.
    /// </summary>
    public static string Hash(string text)
    {
        var normalized = text.Replace("\r\n", "\n");
        return Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(normalized)));
    }

    public static string HashFile(string path) => Hash(File.ReadAllText(path));
}
