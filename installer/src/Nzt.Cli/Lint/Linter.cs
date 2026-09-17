using Nzt.Cli.Content;

namespace Nzt.Cli.Lint;

public sealed record LintIssue(string Where, string Message);

public sealed record LintReport(IReadOnlyList<LintIssue> Issues, int SkillCount, int ListingChars)
{
    public bool Ok => Issues.Count == 0;

    /// <summary>El piso de Codex sin contexto conocido (C2). Pasarlo no es un corte: es degradación.</summary>
    public const int CodexFloor = 8000;

    public bool OverListingFloor => ListingChars > CodexFloor;
}

/// <summary>
/// Las mismas reglas que corre `install/build.*`, acá porque el instalador no
/// escribe nada sin validarlas primero: una skill con el name desalineado del
/// path se instala con un nombre que ninguna tabla de ruteo nombra.
/// </summary>
public static class Linter
{
    public const int MaxLines = 200;
    public const int MaxDescription = 250;

    public static LintReport Run(ContentCatalog catalog)
    {
        var issues = new List<LintIssue>();

        foreach (var skill in catalog.Skills)
        {
            var name = skill.FrontMatter.Get("name");
            var description = skill.FrontMatter.Get("description");

            if (!skill.FrontMatter.Exists)
                issues.Add(new LintIssue(skill.RepoPath, "sin frontmatter"));

            if (name != skill.Name)
                issues.Add(new LintIssue(skill.RepoPath,
                    $"el name del frontmatter es '{name}', y el path deriva '{skill.Name}'"));

            if (string.IsNullOrWhiteSpace(description))
                issues.Add(new LintIssue(skill.RepoPath, "sin description"));
            else if (description.Length > MaxDescription)
                issues.Add(new LintIssue(skill.RepoPath,
                    $"la description tiene {description.Length} chars, sobre el límite de {MaxDescription}"));

            if (skill.LineCount > MaxLines)
                issues.Add(new LintIssue(skill.RepoPath,
                    $"{skill.LineCount} líneas, sobre el techo de {MaxLines} (D3: se parte, no se sube)"));

            // C1: el frontmatter portable es sólo name + description.
            foreach (var extra in new[] { "model", "allowed-tools", "context", "disable-model-invocation" })
                if (skill.FrontMatter.Get(extra) is not null)
                    issues.Add(new LintIssue(skill.RepoPath,
                        $"el frontmatter trae '{extra}', que rompe portabilidad (C1)"));
        }

        var duplicates = catalog.Skills
            .GroupBy(s => s.Name, StringComparer.OrdinalIgnoreCase)
            .Where(g => g.Count() > 1);

        foreach (var group in duplicates)
            issues.Add(new LintIssue(group.Key, $"{group.Count()} skills derivan el mismo nombre plano"));

        return new LintReport(issues, catalog.Skills.Count, catalog.ListingChars);
    }
}
