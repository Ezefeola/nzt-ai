namespace Nzt.Cli.Providers;

/// <summary>
/// La raíz de un proyecto (RN-proy-raiz): la primera carpeta hacia arriba con
/// `.git` —carpeta, o archivo en un worktree—, o la carpeta de partida si no hay
/// repo. `ExcludeFile` es el `info/exclude` del repo, común a sus worktrees.
/// </summary>
public sealed record ProjectRoot(string Path, bool IsGitRepo, string? ExcludeFile)
{
    public static ProjectRoot Find(string startDirectory)
    {
        var start = System.IO.Path.GetFullPath(startDirectory);

        for (var dir = new DirectoryInfo(start); dir is not null; dir = dir.Parent)
        {
            var git = System.IO.Path.Combine(dir.FullName, ".git");
            if (Directory.Exists(git))
                return new ProjectRoot(dir.FullName, true, System.IO.Path.Combine(git, "info", "exclude"));
            if (File.Exists(git))
                return new ProjectRoot(dir.FullName, true, ExcludeFromGitFile(dir.FullName, git));
        }

        return new ProjectRoot(start, false, null);
    }

    /// <summary>
    /// Ahí `.claude/` y `.agents/` son los destinos globales: el alcance de proyecto
    /// pisaría el de usuario, así que no se ofrece.
    /// </summary>
    public bool IsUserHome(string? homeDirectory = null) =>
        SamePath(Path, homeDirectory ?? Environment.GetFolderPath(Environment.SpecialFolder.UserProfile));

    /// <summary>Qué proveedores ya usa el repo, para marcarlos de antemano en el menú.</summary>
    public bool Uses(string providerId) => providerId == Provider.ClaudeCodeId
        ? Directory.Exists(Combine(".claude")) || File.Exists(Combine("CLAUDE.md"))
        : File.Exists(Combine("AGENTS.md")) || Directory.Exists(Combine(".agents"))
          || Directory.Exists(Combine(".codex"));

    public string Combine(params string[] parts) => System.IO.Path.Combine([Path, .. parts]);

    // Un worktree tiene `.git` como archivo: `gitdir: <ruta>`. El exclude no es el
    // de esa carpeta sino el de la común, que nombra su archivo `commondir`.
    private static string? ExcludeFromGitFile(string root, string gitFile)
    {
        var line = File.ReadLines(gitFile).FirstOrDefault(l => l.StartsWith("gitdir:", StringComparison.Ordinal));
        if (line is null) return null;

        var gitDir = System.IO.Path.GetFullPath(System.IO.Path.Combine(root, line["gitdir:".Length..].Trim()));
        var commonFile = System.IO.Path.Combine(gitDir, "commondir");
        var common = File.Exists(commonFile)
            ? System.IO.Path.GetFullPath(System.IO.Path.Combine(gitDir, File.ReadAllText(commonFile).Trim()))
            : gitDir;
        return System.IO.Path.Combine(common, "info", "exclude");
    }

    public static bool SamePath(string a, string b) =>
        string.Equals(
            System.IO.Path.GetFullPath(a).TrimEnd(System.IO.Path.DirectorySeparatorChar, System.IO.Path.AltDirectorySeparatorChar),
            System.IO.Path.GetFullPath(b).TrimEnd(System.IO.Path.DirectorySeparatorChar, System.IO.Path.AltDirectorySeparatorChar),
            OperatingSystem.IsWindows() || OperatingSystem.IsMacOS()
                ? StringComparison.OrdinalIgnoreCase
                : StringComparison.Ordinal);
}
