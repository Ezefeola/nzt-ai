#requires -Version 7.0
<#
.SYNOPSIS
  Builds the skill nzt of each host from core/skill-nzt.md, core/kernel.md and the
  host's adapter (D95), validates the skill tree, and assembles dist/plugin/ — the flattened plugin
  that `claude plugin eval` runs against (see Plan/specs/nzt-core.md, D23).
.PARAMETER OutDir
  Where to write the built files. Defaults to nzt-software/dist.
#>
[CmdletBinding()]
param([string]$OutDir)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot   # nzt-software/ (D98)
$method = Join-Path $root 'method'
if (-not $OutDir) { $OutDir = Join-Path $root 'dist' }

$failed = $false

$kernel = (Get-Content (Join-Path $method 'core/kernel.md') -Raw).TrimEnd()
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

# --- skill tree --------------------------------------------------------------

$skillsRoot = Join-Path $method 'skills'
$script:listingChars = 0
$count = 0

$plugin = Join-Path $OutDir 'plugin'
if (Test-Path $plugin) { Remove-Item $plugin -Recurse -Force }
New-Item -ItemType Directory -Force -Path (Join-Path $plugin '.claude-plugin') | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $plugin 'skills') | Out-Null

# The frontmatter, the 200-line budget, and each reference's budget, contents list and
# row (D50). Adds to the listing; returns $true when something failed.
function Test-Skill([IO.FileInfo]$file, [string]$rel, [string]$expected) {
    $bad = $false
    $text = Get-Content $file.FullName -Raw
    $name = if ($text -match '(?m)^name:\s*(.+?)\s*$') { $Matches[1] } else { '' }
    $desc = if ($text -match '(?m)^description:\s*(.+?)\s*$') { $Matches[1] } else { '' }
    $lines = ($text.TrimEnd() -split "`n").Count

    $script:listingChars += $name.Length + $desc.Length
    Write-Host ("{0,-46} {1,4} lines  {2,4} chars" -f $expected, $lines, $desc.Length)

    if ($name -ne $expected) {
        Write-Warning "$rel : frontmatter name is '$name', path derives '$expected'."
        $bad = $true
    }
    if (-not $desc) {
        Write-Warning "$rel : missing description."
        $bad = $true
    }
    if ($desc.Length -gt 250) {
        Write-Warning "$rel : description is $($desc.Length) chars, over the 250-char limit."
        $bad = $true
    }
    if ($lines -gt 200) {
        Write-Warning "$rel : over the 200-line budget ($lines lines)."
        $bad = $true
    }

    # references: the same 200-line budget, a contents list past 100 lines, and a row
    # in this skill's table — a reference without a row is read by nobody.
    $refDir = Join-Path $file.Directory.FullName 'references'
    if (-not (Test-Path $refDir)) { return $bad }
    foreach ($ref in Get-ChildItem $refDir -File -Filter '*.md' | Sort-Object Name) {
        $refText = Get-Content $ref.FullName -Raw
        $refLines = ($refText.TrimEnd() -split "`n").Count
        Write-Host ("  {0,-44} {1,4} lines" -f "references/$($ref.Name)", $refLines)
        if ($refLines -gt 200) {
            Write-Warning "$rel/references/$($ref.Name) : over the 200-line budget ($refLines lines)."
            $bad = $true
        }
        if ($refLines -gt 100 -and $refText -notmatch '(?m)^## Contents') {
            Write-Warning "$rel/references/$($ref.Name) : over 100 lines and no '## Contents'."
            $bad = $true
        }
        # a row in the skill, or in an index reference the skill has a row for (D58)
        $reached = $text.Contains("references/$($ref.Name)")
        if (-not $reached) {
            foreach ($index in Get-ChildItem $refDir -File -Filter '*.md') {
                if ($index.Name -ne $ref.Name -and $text.Contains("references/$($index.Name)") -and
                    (Get-Content $index.FullName -Raw).Contains("references/$($ref.Name)")) {
                    $reached = $true
                    break
                }
            }
        }
        if (-not $reached) {
            Write-Warning "$rel/references/$($ref.Name) : no row in the skill's table."
            $bad = $true
        }
    }
    # references in subfolders (`dotnet/`, `ddd/`…): the same budgets, and a row naming
    # `<folder>/<file>` in the skill itself — one level deep, never through an index.
    foreach ($ref in Get-ChildItem $refDir -Directory | ForEach-Object { Get-ChildItem $_.FullName -File -Filter '*.md' } | Sort-Object FullName) {
        $sub = "$($ref.Directory.Name)/$($ref.Name)"
        $refText = Get-Content $ref.FullName -Raw
        $refLines = ($refText.TrimEnd() -split "`n").Count
        Write-Host ("  {0,-44} {1,4} lines" -f "references/$sub", $refLines)
        if ($refLines -gt 200) {
            Write-Warning "$rel/references/$sub : over the 200-line budget ($refLines lines)."
            $bad = $true
        }
        if ($refLines -gt 100 -and $refText -notmatch '(?m)^## Contents') {
            Write-Warning "$rel/references/$sub : over 100 lines and no '## Contents'."
            $bad = $true
        }
        if (-not $text.Contains("``$sub``")) {
            Write-Warning "$rel/references/$sub : no row in the skill's table."
            $bad = $true
        }
    }
    return $bad
}

if (Test-Path $skillsRoot) {
    Write-Host ''
    foreach ($file in Get-ChildItem $skillsRoot -Recurse -Filter 'SKILL.md' | Sort-Object FullName) {
        $count++
        $rel = [IO.Path]::GetRelativePath($skillsRoot, $file.Directory.FullName)
        $expected = ($rel -split '[\\/]') -join '-'
        if (Test-Skill $file $rel $expected) { $failed = $true }

        # flattened copy, as the installer lays it out (9.1): the skill's own files, plus
        # sibling asset folders — never a child skill's folder. In the plugin the skill drops
        # its nzt- prefix, folder and name: (D97): nzt-build is nzt-software:build.
        $short = $expected -replace '^nzt-', ''
        $dest = Join-Path $plugin "skills/$short"
        New-Item -ItemType Directory -Force -Path $dest | Out-Null
        Get-ChildItem $file.Directory -File | Copy-Item -Destination $dest
        foreach ($dir in Get-ChildItem $file.Directory -Directory) {
            if (-not (Get-ChildItem $dir -Recurse -Filter 'SKILL.md' | Select-Object -First 1)) {
                Copy-Item $dir.FullName -Destination $dest -Recurse
            }
        }
        $skillText = Get-Content $file.FullName -Raw
        $skillEnd = $skillText.IndexOf("`n---", 3)
        $skillFront = [regex]::Replace($skillText.Substring(0, $skillEnd), "(?m)^name:[ \t]*$([regex]::Escape($expected))[ \t]*`$", "name: $short")
        Set-Content -Path (Join-Path $dest 'SKILL.md') -Value ($skillFront + $skillText.Substring($skillEnd)) -Encoding utf8 -NoNewline
    }

    Write-Host ''
    Write-Host ("$count skills, ~$($script:listingChars) chars of skill listing (Codex floor: 8000)")
    if ($script:listingChars -gt 8000) {
        Write-Warning 'Skill listing is over the 8000-char floor. See R1 in Plan/specs/nzt-core.md.'
    }
}

# --- the plugin: manifest, the method inside nzt-software:nzt, subagents (Plan/specs/nzt-plugin.md) ---
# NZT's version is the installer's (D24): one number for nzt-ai and the plugin.

$csproj = Get-Content (Join-Path $root 'cli/src/Nzt.Cli/Nzt.Cli.csproj') -Raw
$version = if ($csproj -match '<Version>(.+?)</Version>') { $Matches[1] } else { '' }
if (-not $version) {
    Write-Warning 'no <Version> in cli/src/Nzt.Cli/Nzt.Cli.csproj.'
    $failed = $true
}

$manifest = @"
{
  "name": "nzt-software",
  "description": "NZT for software: a way of working. Its method lives in the nzt skill, which loads first in every session.",
  "version": "$version",
  "license": "MIT",
  "author": { "name": "Ezefeola", "url": "https://github.com/Ezefeola" },
  "repository": "https://github.com/Ezefeola/nzt-ai"
}
"@
Set-Content -Path (Join-Path $plugin '.claude-plugin/plugin.json') -Value ($manifest.Replace("`r`n", "`n") + "`n") -Encoding utf8 -NoNewline

# The method inside the skill nzt, the same way for every host (QT-109, D95): the shared
# frontmatter, the kernel and the host's adapter are the skill's body, and what skills/nzt
# does today becomes its reference entry.md. Its description is what makes it load first
# in every session; nothing else loads it. nzt-ai installs the same files, byte for byte.
$entrySrc = Get-Content (Join-Path $method 'skills/nzt/SKILL.md') -Raw
$entryAt = $entrySrc.IndexOf("`n---`n", 3)
$frontmatter = (Get-Content (Join-Path $method 'core/skill-nzt.md') -Raw).TrimEnd()
function Build-Nzt([string]$dest, [string]$adapterFile, [string]$label) {
    if (Test-Path $dest) { Remove-Item -Recurse -Force $dest }
    New-Item -ItemType Directory -Force -Path (Join-Path $dest 'references') | Out-Null
    Set-Content -Path (Join-Path $dest 'references/entry.md') -Value $entrySrc.Substring($entryAt + 5) -Encoding utf8 -NoNewline
    $adapter = (Get-Content (Join-Path $method "core/$adapterFile") -Raw).TrimEnd()
    Set-Content -Path (Join-Path $dest 'SKILL.md') -Value "$frontmatter`n`n$kernel`n`n$adapter`n" -Encoding utf8 -NoNewline
    Test-Skill (Get-Item (Join-Path $dest 'SKILL.md')) $label 'nzt'
}
if (Build-Nzt (Join-Path $plugin 'skills/nzt') 'adapter-claude-skill.md' 'plugin skills/nzt') { $failed = $true }
if (Build-Nzt (Join-Path $OutDir 'claude-code/nzt') 'adapter-claude.md' 'claude-code nzt') { $failed = $true }
if (Build-Nzt (Join-Path $OutDir 'codex/nzt') 'adapter-codex.md' 'codex nzt') { $failed = $true }
foreach ($old in 'CLAUDE.md', 'AGENTS.md') {
    $path = Join-Path $OutDir $old
    if (Test-Path $path) { Remove-Item -Force $path }
}

# Subagents: Claude Code reads their skills: list, not the model, so the build gives it
# the plugin's names (QT-103), and each drops its nzt- prefix like the skills (D97):
# nzt-explorer is nzt-software:explorer and loads nzt-software:research.
$agentsDest = Join-Path $plugin 'agents'
New-Item -ItemType Directory -Force -Path $agentsDest | Out-Null
$agentFiles = Get-ChildItem (Join-Path $method 'agents') -Filter '*.md'
foreach ($agent in $agentFiles) {
    $text = Get-Content $agent.FullName -Raw
    $end = $text.IndexOf("`n---", 3)
    $front = [regex]::Replace($text.Substring(0, $end), '(?m)^([ \t]*-[ \t]*)nzt-', '${1}nzt-software:')
    $front = [regex]::Replace($front, '(?m)^name:[ \t]*nzt-', 'name: ')
    Set-Content -Path (Join-Path $agentsDest ($agent.Name -replace '^nzt-', '')) -Value ($front + $text.Substring($end)) -Encoding utf8 -NoNewline
}
Write-Host "plugin ${version}: skills/nzt with the kernel, $($agentFiles.Count) subagents"

# --- evals for `claude plugin eval` ------------------------------------------

$evalsSrc = Join-Path $root 'evals'
if (Test-Path $evalsSrc) {
    $evalsDest = Join-Path $plugin 'evals'
    Copy-Item $evalsSrc -Destination $evalsDest -Recurse
    $results = Join-Path $evalsDest 'results'
    if (Test-Path $results) { Remove-Item $results -Recurse -Force }
    New-Item -ItemType Directory -Force -Path (Join-Path $evalsDest '_fixtures') | Out-Null

    $caseFiles = Get-ChildItem $evalsDest -Recurse -Filter 'case.yaml' | Sort-Object FullName
    foreach ($case in $caseFiles) {
        $rel = [IO.Path]::GetRelativePath($evalsDest, $case.FullName)
        $text = Get-Content $case.FullName -Raw
        foreach ($key in @('(?m)^schema_version:', '(?m)^name:', '(?m)^ *prompt:', '(?m)^graders:')) {
            if ($text -notmatch $key) {
                Write-Warning "evals/$rel : no key matching '$key'."
                $failed = $true
            }
        }
        if ($text -match '(?m)^\s*scaffold_script:\s*(.+?)\s*$') {
            $script = $Matches[1]
            if (-not (Test-Path (Join-Path $case.Directory $script))) {
                Write-Warning "evals/$rel : scaffold_script '$script' is missing."
                $failed = $true
            }
        }
    }

    Write-Host "plugin -> $plugin  ($($caseFiles.Count) eval cases)"
}

Write-Host "-> $OutDir"
if ($failed) { exit 1 }
