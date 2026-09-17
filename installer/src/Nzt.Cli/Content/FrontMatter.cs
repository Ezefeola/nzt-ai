namespace Nzt.Cli.Content;

/// <summary>
/// Frontmatter mínimo: sólo pares `clave: valor` de primer nivel, que es todo lo
/// que usa NZT (C1: sólo `name` y `description`). No se usa un parser YAML
/// completo a propósito — el formato es fijo y una dependencia más es una cosa
/// más que mantener.
/// </summary>
public sealed class FrontMatter
{
    private readonly List<KeyValuePair<string, string>> _values = [];

    public string Body { get; private init; } = string.Empty;
    public bool Exists { get; private init; }

    public string? Get(string key) =>
        _values.FirstOrDefault(p => string.Equals(p.Key, key, StringComparison.OrdinalIgnoreCase)).Value;

    public static FrontMatter Parse(string text)
    {
        var normalized = text.Replace("\r\n", "\n");

        if (!normalized.StartsWith("---\n", StringComparison.Ordinal))
            return new FrontMatter { Body = normalized, Exists = false };

        var end = normalized.IndexOf("\n---", 3, StringComparison.Ordinal);
        if (end < 0)
            return new FrontMatter { Body = normalized, Exists = false };

        var block = normalized[4..(end + 1)];
        var bodyStart = normalized.IndexOf('\n', end + 1);
        var body = bodyStart < 0 ? string.Empty : normalized[(bodyStart + 1)..];

        var fm = new FrontMatter { Body = body, Exists = true };

        string? currentKey = null;
        foreach (var rawLine in block.Split('\n'))
        {
            if (rawLine.Length == 0) continue;

            // Continuación de un valor que sigue en la línea de abajo.
            if (char.IsWhiteSpace(rawLine[0]) && currentKey is not null)
            {
                var index = fm._values.FindLastIndex(p => p.Key == currentKey);
                if (index >= 0)
                    fm._values[index] = new KeyValuePair<string, string>(
                        currentKey, fm._values[index].Value + " " + rawLine.Trim());
                continue;
            }

            var colon = rawLine.IndexOf(':');
            if (colon <= 0) continue;

            currentKey = rawLine[..colon].Trim();
            fm._values.Add(new KeyValuePair<string, string>(currentKey, rawLine[(colon + 1)..].Trim()));
        }

        return fm;
    }
}
