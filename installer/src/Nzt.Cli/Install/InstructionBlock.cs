namespace Nzt.Cli.Install;

/// <summary>
/// NZT es dueño de un bloque delimitado adentro de CLAUDE.md / AGENTS.md, y de
/// nada más. El texto de alrededor es del usuario y no se normaliza nunca.
/// Los marcadores son los mismos que emite `install/build.*`.
/// </summary>
public static class InstructionBlock
{
    public const string Begin = "<!-- nzt:start -->";
    public const string End = "<!-- nzt:end -->";

    /// <summary>Byte por byte lo que produce el build: kernel, línea en blanco, adapter.</summary>
    public static string Render(string kernel, string adapter) =>
        Begin + "\n" + kernel.Replace("\r\n", "\n").TrimEnd() + "\n\n"
        + adapter.Replace("\r\n", "\n").TrimEnd() + "\n" + End + "\n";

    // Marcadores faltantes, duplicados, en línea o desbalanceados no se adivinan:
    // si el bloque no se puede ubicar sin ambigüedad, no se toca el archivo.
    public static bool TryLocate(string text, out int start, out int length)
    {
        start = text.IndexOf(Begin, StringComparison.Ordinal);
        length = 0;
        var end = text.IndexOf(End, StringComparison.Ordinal);
        if (start < 0 || end < start + Begin.Length
            || text.IndexOf(Begin, start + Begin.Length, StringComparison.Ordinal) >= 0
            || text.IndexOf(End, end + End.Length, StringComparison.Ordinal) >= 0)
            return false;
        if (start > 0 && text[start - 1] != '\n') return false;
        if (text[end - 1] != '\n') return false;
        var afterBegin = start + Begin.Length;
        if (afterBegin >= text.Length || (text[afterBegin] != '\n' && text[afterBegin] != '\r'))
            return false;
        var after = end + End.Length;
        if (after < text.Length)
        {
            if (text[after] == '\r' && after + 1 < text.Length && text[after + 1] == '\n') after += 2;
            else if (text[after] == '\n') after++;
            else return false;
        }
        length = after - start;
        return true;
    }

    public static bool HasMarkers(string text) =>
        text.Contains(Begin, StringComparison.Ordinal) || text.Contains(End, StringComparison.Ordinal);

    public static bool Matches(string text, string hash, out int start, out int length) =>
        TryLocate(text, out start, out length) && Manifest.Hash(text.Substring(start, length)) == hash;

    public static void Remove(string path, string text, int start, int length)
    {
        var remaining = text.Remove(start, length);
        if (remaining.Trim().Length == 0) File.Delete(path);
        else File.WriteAllText(path, remaining);
    }
}
