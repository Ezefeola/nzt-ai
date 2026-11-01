using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Nzt.Cli.Install;

/// <summary>
/// Un archivo administrado. `Created` marca el archivo de instrucciones que no
/// existía antes de NZT: solo ese se excluye de git en *Solo para mí*.
/// </summary>
public sealed record ManifestEntry(
    string Path,
    string Sha256,
    bool ManagedBlock = false,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)] bool Created = false);

/// <summary>
/// Lo que permite desinstalar sin adivinar y, sobre todo, lo que permite no
/// pisar nada que este CLI no haya escrito él mismo. El de usuario vive fuera de
/// la carpeta del proveedor: ahí van skills e instrucciones, nada de contabilidad.
/// El de un proyecto vive en el proyecto, con rutas relativas a su raíz, para que
/// viaje con los archivos (RN-proy-manifiesto).
/// </summary>
public sealed record Manifest
{
    [JsonPropertyName("provider")] public required string Provider { get; init; }
    [JsonPropertyName("nztVersion")] public required string Version { get; init; }
    [JsonPropertyName("installedAt")] public required DateTimeOffset InstalledAt { get; init; }
    [JsonPropertyName("files")] public required List<ManifestEntry> Files { get; init; }

    /// <summary>
    /// Los mods que instaló este CLI, por nombre. Un mod instalado que no está acá
    /// es del usuario: se actualiza, pero no se desinstala nunca.
    /// </summary>
    [JsonPropertyName("mods")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public List<string>? Mods { get; init; }

    /// <summary>`personal` o `shared` en un proyecto (RN-proy-modos); ausente en el de usuario.</summary>
    [JsonPropertyName("mode")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Mode { get; init; }

    public const string PersonalMode = "personal";
    public const string SharedMode = "shared";

    [JsonIgnore] public bool Personal => Mode == PersonalMode;

    /// <summary>Lo que sigue administrando: si no queda nada, el manifiesto sobra.</summary>
    [JsonIgnore]
    public bool IsEmpty => Files.Count == 0 && (Mods is null || Mods.Count == 0);

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

    /// <summary>Con `root`, las rutas guardadas son relativas a él y se devuelven absolutas.</summary>
    public static Manifest? Load(string providerId, string? directory = null, string? root = null)
    {
        var path = PathFor(providerId, directory);
        if (!File.Exists(path)) return null;
        try
        {
            var manifest = JsonSerializer.Deserialize<Manifest>(File.ReadAllText(path), Options);
            if (manifest is null || root is null) return manifest;
            return manifest with
            {
                Files = manifest.Files
                    .Select(f => f with { Path = System.IO.Path.GetFullPath(System.IO.Path.Combine(root, f.Path)) })
                    .ToList()
            };
        }
        catch (JsonException)
        {
            return null;
        }
    }

    public void Save(string? directory = null, string? root = null)
    {
        var stored = root is null ? this : this with
        {
            Files = Files.Select(f => f with { Path = Relative(root, f.Path) }).ToList()
        };
        Directory.CreateDirectory(directory ?? DirectoryPath);
        File.WriteAllText(PathFor(Provider, directory), JsonSerializer.Serialize(stored, Options));
    }

    // Con `/` en las tres plataformas: un repo compartido se clona en cualquiera.
    public static string Relative(string root, string path) =>
        System.IO.Path.GetRelativePath(root, path).Replace('\\', '/');

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
