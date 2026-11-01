#requires -Version 7.0
<#
.SYNOPSIS
  Builds CLAUDE.md and AGENTS.md from core/kernel.md plus each host adapter,
  validates the skill tree, and assembles dist/plugin/ — the flattened plugin
  that `claude plugin eval` runs against (see specs/nzt-core.md, D23).
.PARAMETER OutDir
  Where to write the built files. Defaults to <repo>/dist.
#>
[CmdletBinding()]
param([string]$OutDir)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
if (-not $OutDir) { $OutDir = Join-Path $root 'dist' }

$failed = $false

# --- instruction files -------------------------------------------------------

$kernel = (Get-Content (Join-Path $root 'core/kernel.md') -Raw).TrimEnd()

$targets = @(
    @{ File = 'CLAUDE.md'; Adapter = 'adapter-claude.md' }
    @{ File = 'AGENTS.md'; Adapter = 'adapter-codex.md' }
)

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

foreach ($t in $targets) {
    $adapter = (Get-Content (Join-Path $root "core/$($t.Adapter)") -Raw).TrimEnd()
    $body = "<!-- nzt:start -->`n$kernel`n`n$adapter`n<!-- nzt:end -->`n"

    Set-Content -Path (Join-Path $OutDir $t.File) -Value $body -Encoding utf8 -NoNewline

    $lines = ($body.TrimEnd() -split "`n").Count
    Write-Host ("{0,-10} {1,4} lines" -f $t.File, $lines)
    if ($lines -gt 200) {
        Write-Warning "$($t.File) is over the 200-line budget ($lines lines)."
        $failed = $true
    }
}

# --- skill tree --------------------------------------------------------------

$skillsRoot = Join-Path $root 'skills'
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
    return $bad
}

if (Test-Path $skillsRoot) {
    Write-Host ''
    foreach ($file in Get-ChildItem $skillsRoot -Recurse -Filter 'SKILL.md' | Sort-Object FullName) {
        $count++
        $rel = [IO.Path]::GetRelativePath($skillsRoot, $file.Directory.FullName)
        $expected = ($rel -split '[\\/]') -join '-'
        if (Test-Skill $file $rel $expected) { $failed = $true }

        # flattened copy, exactly as the installer lays it out (9.1): the skill's own
        # files, plus sibling asset folders — never a child skill's folder.
        $dest = Join-Path $plugin "skills/$expected"
        New-Item -ItemType Directory -Force -Path $dest | Out-Null
        Get-ChildItem $file.Directory -File | Copy-Item -Destination $dest
        foreach ($dir in Get-ChildItem $file.Directory -Directory) {
            if (-not (Get-ChildItem $dir -Recurse -Filter 'SKILL.md' | Select-Object -First 1)) {
                Copy-Item $dir.FullName -Destination $dest -Recurse
            }
        }
    }

    Write-Host ''
    Write-Host ("$count skills, ~$($script:listingChars) chars of skill listing (Codex floor: 8000)")
    if ($script:listingChars -gt 8000) {
        Write-Warning 'Skill listing is over the 8000-char floor. See R1 in specs/nzt-core.md.'
    }
}

# --- packs -------------------------------------------------------------------
# What `nzt-ai project` installs per project (D88): a pack.json with a description and
# requires that exist, and, when it brings a skill, the same rules as the global ones.
# Their listing is not added to the global one: a project carries only the packs it chose.

$packsRoot = Join-Path $root 'packs'
if (Test-Path $packsRoot) {
    Write-Host ''
    $script:listingChars = 0
    $folders = Get-ChildItem $packsRoot -Directory | Sort-Object Name
    foreach ($folder in $folders) {
        $pack = $folder.Name
        $json = Join-Path $folder.FullName 'pack.json'
        if (-not (Test-Path $json)) {
            Write-Warning "packs/$pack : no pack.json."
            $failed = $true
            continue
        }
        $definition = Get-Content $json -Raw | ConvertFrom-Json
        if (-not $definition.description) {
            Write-Warning "packs/$pack : pack.json has no description."
            $failed = $true
        }
        foreach ($required in @($definition.requires)) {
            if ($required -and -not (Test-Path (Join-Path $packsRoot $required))) {
                Write-Warning "packs/$pack : requires '$required', which is not a pack."
                $failed = $true
            }
        }
        $skill = Join-Path $folder.FullName 'SKILL.md'
        if (Test-Path $skill) {
            if (Test-Skill (Get-Item $skill) "packs/$pack" "nzt-$pack") { $failed = $true }
        } elseif (-not $definition.mcp) {
            Write-Warning "packs/$pack : brings neither a skill nor an MCP server."
            $failed = $true
        }
    }

    Write-Host ''
    Write-Host ("$($folders.Count) packs, ~$($script:listingChars) chars of skill listing if every one is installed")
}

# --- plugin for `claude plugin eval` -----------------------------------------

$manifest = @'
{
  "name": "nzt",
  "description": "NZT: the skill set under evaluation. Built output — edit skills/ in the repo, not here.",
  "version": "4.0.0",
  "license": "MIT",
  "author": { "name": "NZT" }
}
'@
Set-Content -Path (Join-Path $plugin '.claude-plugin/plugin.json') -Value $manifest -Encoding utf8

$evalsSrc = Join-Path $root 'evals'
if (Test-Path $evalsSrc) {
    $evalsDest = Join-Path $plugin 'evals'
    Copy-Item $evalsSrc -Destination $evalsDest -Recurse
    $results = Join-Path $evalsDest 'results'
    if (Test-Path $results) { Remove-Item $results -Recurse -Force }
    New-Item -ItemType Directory -Force -Path (Join-Path $evalsDest '_fixtures') | Out-Null
    Copy-Item (Join-Path $OutDir 'CLAUDE.md') -Destination (Join-Path $evalsDest '_fixtures/CLAUDE.md') -Force
    # the packs, for fixtures that seed a project with its pack skills (_fixtures/packs.sh)
    Copy-Item $packsRoot -Destination (Join-Path $evalsDest '_fixtures/packs') -Recurse

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

    Write-Host "plugin -> $plugin  ($($caseFiles.Count) eval cases, kernel fixture refreshed)"
}

Write-Host "-> $OutDir"
if ($failed) { exit 1 }
