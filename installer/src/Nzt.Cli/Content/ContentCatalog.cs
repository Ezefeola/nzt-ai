using System.Reflection;

namespace Nzt.Cli.Content;

public sealed record SkillFile(string Name, string RepoPath, string Text)
{
    public FrontMatter FrontMatter { get; } = FrontMatter.Parse(Text);

    /// <summary>Lo que esta skill le cuesta al listado de R1: name + description.</summary>
    public int ListingChars => Name.Length + (FrontMatter.Get("description")?.Length ?? 0);

    public int LineCount => Text.Replace("\r\n", "\n").TrimEnd('\n').Split('\n').Length;
}

/// <summary>
/// El contenido canónico, leído de los recursos embebidos en el ejecutable: el
/// kernel, un adapter por proveedor y el árbol de skills.
///
/// Sólo son skills las carpetas con `SKILL.md`; las intermedias —`backend/`,
/// `render/`, `architecture/`— agrupan y no aparecen acá. El nombre plano sale
/// del path relativo a `skills/` con `/` → `-` (9.1), que es la misma identidad
/// que valida el build y que usan las tablas de ruteo.
/// </summary>
public sealed class ContentCatalog
{
    public string Kernel { get; }
    public IReadOnlyDictionary<string, string> Adapters { get; }
    public IReadOnlyList<SkillFile> Skills { get; }

    private ContentCatalog(string kernel, Dictionary<string, string> adapters, List<SkillFile> skills)
    {
        Kernel = kernel;
        Adapters = adapters;
        Skills = skills;
    }

    /// <summary>Un catálogo armado a mano, para verificar reglas sin tocar el disco.</summary>
    public static ContentCatalog From(string kernel, Dictionary<string, string> adapters,
        IEnumerable<SkillFile> skills) => new(kernel, adapters, [.. skills]);

    public int ListingChars => Skills.Sum(s => s.ListingChars);

    public string Adapter(string fileName) =>
        Adapters.TryGetValue(fileName, out var text)
            ? text
            : throw new InvalidOperationException($"Falta el adapter '{fileName}' en el contenido embebido.");

    public static ContentCatalog Load()
    {
        var assembly = Assembly.GetExecutingAssembly();
        var kernel = string.Empty;
        var adapters = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        var skills = new List<SkillFile>();

        foreach (var resource in assembly.GetManifestResourceNames())
        {
            var path = resource.Replace('\\', '/');
            if (!path.StartsWith("content/", StringComparison.Ordinal)) continue;

            using var stream = assembly.GetManifestResourceStream(resource);
            if (stream is null) continue;
            using var reader = new StreamReader(stream);
            var text = reader.ReadToEnd();

            var relative = path["content/".Length..];

            if (relative.Equals("core/kernel.md", StringComparison.OrdinalIgnoreCase))
                kernel = text;
            else if (relative.StartsWith("core/", StringComparison.Ordinal))
                adapters[relative["core/".Length..]] = text;
            else if (relative.StartsWith("skills/", StringComparison.Ordinal)
                     && relative.EndsWith("/SKILL.md", StringComparison.Ordinal))
            {
                var repoPath = relative["skills/".Length..^"/SKILL.md".Length];
                skills.Add(new SkillFile(repoPath.Replace('/', '-'), repoPath, text));
            }
        }

        if (string.IsNullOrWhiteSpace(kernel))
            throw new InvalidOperationException("No se encontró core/kernel.md en el contenido embebido.");

        return new ContentCatalog(kernel, adapters,
            [.. skills.OrderBy(s => s.Name, StringComparer.Ordinal)]);
    }
}
