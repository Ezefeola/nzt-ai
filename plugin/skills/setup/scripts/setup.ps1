<#
  /nzt:setup's worker (specs/nzt-plugin.md, "Los scripts"). Same interface as setup.sh:

    setup.ps1 status|install|remove [--scope global|project] [--project-dir <dir>]
              [--data-dir <dir>] [--plugin-root <dir>] [--claude-dir <dir>]
              [--manifest-dir <dir>] [--dry-run] [--accept-agents-md] [--force-edited]

  Exit codes: 0 done, 2 stopped by a rule (the message names it), 1 error.
  The stopping rules live here, not in the skill: the model only relays them.
  Runs on Windows PowerShell 5.1 and PowerShell 7: no ternaries, no ?? , no -AsHashtable.
#>
$ErrorActionPreference = 'Stop'

function Fail([string]$message) { [Console]::Error.WriteLine("error: $message"); exit 1 }
function Stop-Rule([string]$rule, [string]$message) { Write-Output "stopped: ${rule}: $message"; exit 2 }

$action = ''
if ($args.Count -gt 0) { $action = [string]$args[0] }

$scope = ''
$projectDir = (Get-Location).Path
$dataDir = ''
$pluginRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..\..'))
$claudeDir = Join-Path $HOME '.claude'
$manifestDir = ''
$dryRun = $false
$acceptAgents = $false
$forceEdited = $false

$i = 1
while ($i -lt $args.Count) {
    $a = [string]$args[$i]
    $valued = @('--scope', '--project-dir', '--data-dir', '--plugin-root', '--claude-dir', '--manifest-dir')
    if ($valued -contains $a) {
        if ($i + 1 -ge $args.Count) { Fail "$a needs a value" }
        $v = [string]$args[$i + 1]
        switch ($a) {
            '--scope' { $scope = $v }
            '--project-dir' { $projectDir = $v }
            '--data-dir' { $dataDir = $v }
            '--plugin-root' { $pluginRoot = $v }
            '--claude-dir' { $claudeDir = $v }
            '--manifest-dir' { $manifestDir = $v }
        }
        $i += 2
        continue
    }
    switch ($a) {
        '--dry-run' { $dryRun = $true }
        '--accept-agents-md' { $acceptAgents = $true }
        '--force-edited' { $forceEdited = $true }
        default { Fail "unknown argument '$a'" }
    }
    $i += 1
}

if (@('status', 'install', 'remove') -notcontains $action) {
    Fail 'usage: setup.ps1 status|install|remove [--scope global|project] ...'
}

# nzt-ai keeps its manifest outside the provider folder (specs/nzt-installer.md, section 5).
if (-not $manifestDir) {
    if ($env:LOCALAPPDATA) { $manifestDir = Join-Path $env:LOCALAPPDATA 'nzt\manifests' }
    else { $manifestDir = Join-Path $HOME '.local/share/nzt/manifests' }
}

if (-not (Test-Path -LiteralPath $projectDir -PathType Container)) { Fail "project dir '$projectDir' does not exist" }
$projectDir = (Resolve-Path -LiteralPath $projectDir).Path
if (Test-Path -LiteralPath $claudeDir -PathType Container) { $claudeDir = (Resolve-Path -LiteralPath $claudeDir).Path }

$globalFile = Join-Path $claudeDir 'CLAUDE.md'
$projectFile = Join-Path $projectDir 'CLAUDE.md'
$nztAiManifest = Join-Path $manifestDir 'claude-code.json'
$pluginBlock = Join-Path $pluginRoot 'kernel\CLAUDE.md'

if (-not (Test-Path -LiteralPath $pluginBlock)) { Fail "no kernel/CLAUDE.md under plugin root '$pluginRoot'" }
$pluginVersion = ''
$manifestPath = Join-Path $pluginRoot '.claude-plugin\plugin.json'
if (Test-Path -LiteralPath $manifestPath) {
    $m = [regex]::Match([IO.File]::ReadAllText($manifestPath), '"version"\s*:\s*"([^"]*)"')
    if ($m.Success) { $pluginVersion = $m.Groups[1].Value }
}
if (-not $pluginVersion) { Fail "no version in $manifestPath" }

$utf8 = New-Object System.Text.UTF8Encoding($false)

# --- reading a file ------------------------------------------------------------
# A file is read as its bytes' text with every line keeping its own ending, so what is
# written back outside the block is exactly what was there.

function Read-Doc([string]$path) {
    $bytes = [IO.File]::ReadAllBytes($path)
    $bom = ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF)
    $offset = 0
    if ($bom) { $offset = 3 }
    $text = $utf8.GetString($bytes, $offset, $bytes.Length - $offset)
    $lines = @([regex]::Matches($text, '[^\n]*\n|[^\n]+$') | ForEach-Object { $_.Value })
    return @{ Bom = $bom; Lines = $lines; Crlf = $text.Contains("`r") }
}

function Get-Bare([string]$line) { return $line.TrimEnd("`n").TrimEnd("`r") }

# Start and end line indexes of the first block, or $null.
function Get-Range($doc) {
    $start = -1
    for ($n = 0; $n -lt $doc.Lines.Count; $n++) {
        $bare = Get-Bare $doc.Lines[$n]
        if ($start -lt 0 -and $bare -eq '<!-- nzt:start -->') { $start = $n; continue }
        if ($start -ge 0 -and $bare -eq '<!-- nzt:end -->') { return @($start, $n) }
    }
    return $null
}

# none | other | plugin <version>. "other" is a NZT block the plugin did not write.
function Get-Kind([string]$path) {
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { return 'none' }
    $doc = Read-Doc $path
    for ($n = 0; $n -lt $doc.Lines.Count; $n++) {
        if ((Get-Bare $doc.Lines[$n]) -eq '<!-- nzt:start -->') {
            if ($n + 1 -ge $doc.Lines.Count) { return 'none' }
            $m = [regex]::Match((Get-Bare $doc.Lines[$n + 1]), '^<!-- nzt:plugin ([^ ]+) -->$')
            if ($m.Success) { return "plugin $($m.Groups[1].Value)" }
            return 'other'
        }
    }
    return 'none'
}

# The block with LF endings, as the hash and the difference see it.
function Get-BlockText($doc) {
    $range = Get-Range $doc
    if (-not $range) { return '' }
    $sb = New-Object System.Text.StringBuilder
    for ($n = $range[0]; $n -le $range[1]; $n++) { [void]$sb.Append((Get-Bare $doc.Lines[$n]) + "`n") }
    return $sb.ToString()
}

function Get-Sha([string]$text) {
    $sha = [Security.Cryptography.SHA256]::Create()
    $hash = $sha.ComputeHash($utf8.GetBytes($text))
    return (-join ($hash | ForEach-Object { $_.ToString('x2') }))
}

$pluginText = [IO.File]::ReadAllText($pluginBlock).Replace("`r", '')

# The plugin's block in the target's line endings, as lines.
function Get-PluginLines([bool]$crlf) {
    $eol = "`n"
    if ($crlf) { $eol = "`r`n" }
    return @($pluginText.TrimEnd("`n").Split("`n") | ForEach-Object { $_ + $eol })
}

# --- what the setup wrote: ${CLAUDE_PLUGIN_DATA}/written.json -------------------
# One line per file, the same format setup.sh writes: "<path>": {"version", "hash", "date"}.

function Get-Key([string]$path) { return $path.Replace('\', '/') }

function Get-RecordedHash([string]$path) {
    $file = Join-Path $dataDir 'written.json'
    if (-not (Test-Path -LiteralPath $file)) { return '' }
    $key = '"' + (Get-Key $path) + '": '
    foreach ($line in [IO.File]::ReadAllLines($file)) {
        if ($line.Contains($key)) {
            $m = [regex]::Match($line, '"hash": "([^"]*)"')
            if ($m.Success) { return $m.Groups[1].Value }
        }
    }
    return ''
}

function Set-Record([string]$path, [string]$hash) {
    $file = Join-Path $dataDir 'written.json'
    $key = '"' + (Get-Key $path) + '": '
    $entries = New-Object System.Collections.Generic.List[string]
    if (Test-Path -LiteralPath $file) {
        foreach ($line in [IO.File]::ReadAllLines($file)) {
            if ($line.Contains('": {"version": ') -and -not $line.Contains($key)) { $entries.Add($line.TrimEnd().TrimEnd(',')) }
        }
    }
    if ($hash) {
        $date = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
        $entries.Add('  ' + $key + '{"version": "' + $pluginVersion + '", "hash": "' + $hash + '", "date": "' + $date + '"}')
    }
    New-Item -ItemType Directory -Force -Path $dataDir | Out-Null
    $body = "{`n" + ($entries -join ",`n")
    if ($entries.Count -gt 0) { $body += "`n" }
    $body += "}`n"
    $tmp = "$file.tmp"
    [IO.File]::WriteAllText($tmp, $body, $utf8)
    Move-Item -LiteralPath $tmp -Destination $file -Force
}

# --- status --------------------------------------------------------------------

function Get-Description([string]$path) {
    $kind = Get-Kind $path
    if ($kind -eq 'other') { return "other (a NZT block the plugin did not write) at $path" }
    return "$kind at $path"
}

if ($action -eq 'status') {
    Write-Output "plugin: $pluginVersion"
    Write-Output "global: $(Get-Description $globalFile)"
    Write-Output "project: $(Get-Description $projectFile)"
    if (Test-Path -LiteralPath $nztAiManifest) { Write-Output "nzt-ai: installed ($nztAiManifest)" }
    else { Write-Output 'nzt-ai: not installed' }
    exit 0
}

# --- install and remove --------------------------------------------------------

switch ($scope) {
    'global' { $target = $globalFile; $otherFile = $projectFile; $otherScope = 'project' }
    'project' { $target = $projectFile; $otherFile = $globalFile; $otherScope = 'global' }
    default { Fail '--scope must be global or project' }
}
if (-not $dataDir) { Fail "--data-dir is required for $action" }

$nztAiHint = "NZT is installed with nzt-ai. Uninstall it first with 'nzt-ai uninstall --provider claude-code', then run /nzt:setup again"
$kind = Get-Kind $target

if ($kind -eq 'other') {
    Stop-Rule 'RN-plugin-instalador-presente' "$target has a NZT block the plugin did not write (nzt-ai, or pasted by hand). $nztAiHint, or remove that block by hand"
}

function Write-Atomic([string]$path, $doc, [string[]]$lines) {
    $dir = Split-Path -Parent $path
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    $text = -join $lines
    $bytes = $utf8.GetBytes($text)
    if ($doc -and $doc.Bom) { $bytes = [byte[]](0xEF, 0xBB, 0xBF) + $bytes }
    $tmp = "$path.nzt-tmp.$PID"
    try {
        [IO.File]::WriteAllBytes($tmp, $bytes)
        if (Test-Path -LiteralPath $path) { [IO.File]::Replace($tmp, $path, [NullString]::Value) }
        else { [IO.File]::Move($tmp, $path) }
    } catch {
        if (Test-Path -LiteralPath $tmp) { Remove-Item -LiteralPath $tmp -Force }
        Fail "could not write ${path}: $($_.Exception.Message)"
    }
}

# No copy is kept (QT-107): the simulation says so, so whoever wants one makes it first.
function Write-NoCopyNote {
    Write-Output "plan: no copy of $target is kept; to keep one, copy it yourself before applying"
}

# Stops when the block in the file is not the one the setup wrote.
function Assert-NotEdited($doc, [string]$verb) {
    $current = Get-BlockText $doc
    if ((Get-Sha $current) -ne (Get-RecordedHash $target) -and -not $forceEdited) {
        Write-Output "stopped: RN-plugin-quitar: the block in $target is not the one the setup wrote (edited by hand, or written before the plugin was reinstalled). Run again with --force-edited to $verb it anyway. Difference with the plugin's block $pluginVersion (- plugin, + file):"
        $diff = Compare-Object @($pluginText.TrimEnd("`n").Split("`n")) @($current.TrimEnd("`n").Split("`n")) -CaseSensitive
        foreach ($d in $diff) {
            if ($d.SideIndicator -eq '<=') { Write-Output "-$($d.InputObject)" } else { Write-Output "+$($d.InputObject)" }
        }
        exit 2
    }
}

function Get-Slice($lines, [int]$from, [int]$to) {
    if ($to -lt $from) { return @() }
    return @($lines[$from..$to])
}

if ($action -eq 'install') {
    if (Test-Path -LiteralPath $nztAiManifest) {
        Stop-Rule 'RN-plugin-instalador-presente' "$nztAiHint ($nztAiManifest)"
    }
    $otherKind = Get-Kind $otherFile
    if ($otherKind -eq 'other') {
        Stop-Rule 'RN-plugin-instalador-presente' "$otherFile has a NZT block the plugin did not write. $nztAiHint, or remove that block by hand"
    }
    if ($otherKind -like 'plugin*') {
        Stop-Rule 'RN-plugin-un-solo-nzt' "there is already a $otherScope NZT block in $otherFile; with both, Claude loads the kernel twice. Remove it with /nzt:setup first"
    }
    if ($scope -eq 'project' -and -not (Test-Path -LiteralPath $target) -and (Test-Path -LiteralPath (Join-Path $projectDir 'AGENTS.md')) -and -not $acceptAgents) {
        Stop-Rule 'RN-plugin-aviso-agents' "$projectDir has AGENTS.md and no CLAUDE.md: once CLAUDE.md exists, Claude stops reading AGENTS.md unless the user changes 'Project instructions'. Run again with --accept-agents-md to create it"
    }

    $newHash = Get-Sha $pluginText
    $existed = Test-Path -LiteralPath $target
    $doc = $null
    if ($kind -eq 'none') {
        if (Test-Path -LiteralPath $target) {
            $doc = Read-Doc $target
            $plan = "add the block ($pluginVersion) on top of $target; the rest stays below as it is"
            $eol = "`n"
            if ($doc.Crlf) { $eol = "`r`n" }
            $lines = @(Get-PluginLines $doc.Crlf) + @($eol) + @($doc.Lines)
        } else {
            $plan = "create $target with the block ($pluginVersion)"
            $lines = Get-PluginLines $false
        }
    } else {
        $old = $kind.Substring(7)
        $doc = Read-Doc $target
        if ((Get-Sha (Get-BlockText $doc)) -eq $newHash) {
            Write-Output "unchanged: $target already has the block $pluginVersion"
            if (-not $dryRun) { Set-Record $target $newHash }
            exit 0
        }
        Assert-NotEdited $doc 'replace'
        $plan = "replace the block $old with $pluginVersion in $target; the rest stays as it is"
        $range = Get-Range $doc
        $lines = @(Get-Slice $doc.Lines 0 ($range[0] - 1)) + @(Get-PluginLines $doc.Crlf) + @(Get-Slice $doc.Lines ($range[1] + 1) ($doc.Lines.Count - 1))
    }

    if ($dryRun) {
        Write-Output "plan: $plan"
        if ($existed) { Write-NoCopyNote }
        exit 0
    }
    Write-Atomic $target $doc $lines
    Set-Record $target $newHash
    Write-Output "done: $plan"
    Write-Output 'It takes effect in the next session.'
    exit 0
}

# remove
if ($kind -eq 'none') {
    Write-Output "nothing to remove: $target has no NZT block"
    exit 0
}
$doc = Read-Doc $target
Assert-NotEdited $doc 'remove'
$range = Get-Range $doc
if (-not $range) { Fail "$target has a start marker and no end marker" }
$after = @(Get-Slice $doc.Lines ($range[1] + 1) ($doc.Lines.Count - 1))
# without the blank line install put after the block
if ($after.Count -gt 0 -and (Get-Bare $after[0]) -eq '') { $after = @(Get-Slice $after 1 ($after.Count - 1)) }
$lines = @(Get-Slice $doc.Lines 0 ($range[0] - 1)) + $after

$empty = ((-join $lines).Length -eq 0)
if ($empty) { $plan = "remove the block from $target, which leaves it empty: delete the file" }
else { $plan = "remove the block from $target; the rest stays as it is" }
if ($dryRun) {
    Write-Output "plan: $plan"
    Write-NoCopyNote
    exit 0
}
if ($empty) { Remove-Item -LiteralPath $target -Force } else { Write-Atomic $target $doc $lines }
Set-Record $target ''
Write-Output "done: $plan"
Write-Output 'It takes effect in the next session.'
exit 0
