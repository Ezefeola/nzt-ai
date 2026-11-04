<#
  SessionStart check (specs/nzt-plugin.md: RN-plugin-aviso-version, RN-plugin-dos-bloques).
  Same behavior as check.sh. Reads the NZT blocks of ~/.claude/CLAUDE.md and the project's
  CLAUDE.md and prints, only when there is something to say, the hook's JSON: a line for the
  user (systemMessage) and the same for Claude (additionalContext). Never writes, and always
  exits 0: a failing check must not get in the way of the session, nor fall through to
  check.sh in the hook's "|| sh" line.

    check.ps1 [--claude-dir <dir>] [--project-dir <dir>] [--plugin-root <dir>]
  Runs on Windows PowerShell 5.1 and PowerShell 7.
#>
try {
    $claudeDir = Join-Path $HOME '.claude'
    $projectDir = $env:CLAUDE_PROJECT_DIR
    if (-not $projectDir) { $projectDir = (Get-Location).Path }
    $pluginRoot = Split-Path -Parent $PSScriptRoot

    for ($i = 0; $i + 1 -lt $args.Count; $i += 2) {
        switch ([string]$args[$i]) {
            '--claude-dir' { $claudeDir = [string]$args[$i + 1] }
            '--project-dir' { $projectDir = [string]$args[$i + 1] }
            '--plugin-root' { $pluginRoot = [string]$args[$i + 1] }
        }
    }

    $manifest = Join-Path $pluginRoot '.claude-plugin\plugin.json'
    if (-not (Test-Path -LiteralPath $manifest)) { exit 0 }
    $m = [regex]::Match([IO.File]::ReadAllText($manifest), '"version"\s*:\s*"([^"]*)"')
    if (-not $m.Success) { exit 0 }
    $pluginVersion = $m.Groups[1].Value

    # none | other | plugin <version>
    function Get-Kind([string]$path) {
        if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { return 'none' }
        $lines = [IO.File]::ReadAllLines($path)
        for ($n = 0; $n -lt $lines.Count; $n++) {
            if ($lines[$n].TrimEnd("`r") -eq '<!-- nzt:start -->') {
                if ($n + 1 -ge $lines.Count) { return 'none' }
                $v = [regex]::Match($lines[$n + 1].TrimEnd("`r"), '^<!-- nzt:plugin ([^ ]+) -->$')
                if ($v.Success) { return "plugin $($v.Groups[1].Value)" }
                return 'other'
            }
        }
        return 'none'
    }

    $globalFile = Join-Path $claudeDir 'CLAUDE.md'
    $projectFile = Join-Path $projectDir 'CLAUDE.md'
    $globalKind = Get-Kind $globalFile
    $projectKind = Get-Kind $projectFile

    $user = ''
    $model = ''

    # Two blocks: the project's applies, because the team versioned it (QT-102).
    $applies = $globalKind
    $appliesFile = $globalFile
    if ($projectKind -ne 'none') {
        $applies = $projectKind
        $appliesFile = $projectFile
    }
    if ($globalKind -ne 'none' -and $projectKind -ne 'none') {
        $user = "NZT: two NZT blocks are loaded, $globalFile and $projectFile; only the project's applies. Remove one with /nzt:setup."
        $model = "Two NZT kernel blocks are loaded: $globalFile and $projectFile. Apply only the project's block ($projectFile) and ignore the one in $globalFile."
    }

    if ($applies -like 'plugin *') {
        $version = $applies.Substring(7)
        if ($version -ne $pluginVersion) {
            $line = "NZT: the block in $appliesFile is version $version and the plugin is $pluginVersion. Run /nzt:setup to update it."
            $user = ("$user $line").Trim()
            $model = ("$model $line Tell the user once.").Trim()
        }
    }

    if (-not $user) { exit 0 }

    $out = [ordered]@{
        systemMessage = $user
        hookSpecificOutput = [ordered]@{ hookEventName = 'SessionStart'; additionalContext = $model }
    }
    [Console]::Out.WriteLine(($out | ConvertTo-Json -Compress -Depth 3))
} catch {
    # a broken check stays silent
}
exit 0
