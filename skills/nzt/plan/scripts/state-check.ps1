# Checks that Plan/state.json keeps the kernel's contract (Windows, PowerShell 5.1 or 7).
#
# The same rules, messages and order as state-check.py and `nzt-ai state check`; the
# installer's checks run the three on the same states. Usage: state-check.ps1 [project folder]
# Exit 0: no state, or it keeps the contract. Exit 1: problems, one per line.
param([string]$Folder = '.')

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$Statuses = @('todo', 'doing', 'done', 'dropped')
$PhaseNames = @('discovery', 'architecture', 'design', 'build', 'verify', 'ship')
$LegacyPhases = @('analysis', 'ux')   # discovery and design before D88
$DelegationModes = @('auto', 'ask', 'off')
$Cadences = @('delivery', 'upfront', 'just-in-time')
$Models = @('small', 'main')
$Relative = Join-Path 'Plan' 'state.json'

function Test-Object($o) { $o -is [System.Management.Automation.PSCustomObject] }
function Test-Has($o, [string]$p) { (Test-Object $o) -and ($o.PSObject.Properties.Name -contains $p) }
function Get-Text($o, [string]$p) {
    if ((Test-Has $o $p) -and ($o.$p -is [string])) { return $o.$p }
    return $null
}
function Get-RawJson($v) {
    if ($null -eq $v) { return 'null' }
    if ($v -is [string]) { return '"' + $v + '"' }
    if ($v -is [bool]) { if ($v) { return 'true' } else { return 'false' } }
    if ($v -is [System.IFormattable]) { return $v.ToString($null, [System.Globalization.CultureInfo]::InvariantCulture) }
    return (ConvertTo-Json $v -Compress -Depth 20)
}
function Get-Raw($v) { if ($v -is [string]) { return $v } else { return (Get-RawJson $v) } }
function Get-Shown($v) { if ($null -eq $v) { return 'vacío' } else { return "'$v'" } }
function Test-List($v) { ($null -ne $v) -and ($v -is [array]) }

function Test-Phases($phases, [string]$where, $ids, $unitsDoing, $groupPhase, $problems) {
    $phasesDoing = New-Object System.Collections.Generic.List[string]
    $index = 0
    foreach ($phase in $phases) {
        $index++
        $name = Get-Text $phase 'name'
        if ($null -eq $name) { $name = "#$index" }
        $phaseStatus = Get-Text $phase 'status'
        $realName = Get-Text $phase 'name'

        if ($null -eq $realName -or ($PhaseNames -cnotcontains $realName -and $LegacyPhases -cnotcontains $realName)) {
            $problems.Add("la fase '$name'$where no es una fase de NZT: son $($PhaseNames -join ', ')")
        }
        if ($null -eq $phaseStatus -or $Statuses -cnotcontains $phaseStatus) {
            $problems.Add("la fase '$name'$where tiene status $(Get-Shown $phaseStatus)")
        }
        if ($phaseStatus -ceq 'doing') { $phasesDoing.Add($name) }

        if (-not (Test-Has $phase 'units') -or -not (Test-List $phase.units)) { continue }

        foreach ($unit in $phase.units) {
            $id = $null
            if (Test-Has $unit 'id') { $id = Get-RawJson $unit.id }
            if ($null -eq $id) { $label = "una unidad de '$name'$where" } else { $label = "la unidad $id" }
            $unitStatus = Get-Text $unit 'status'

            if ($null -eq $id) { $problems.Add("una unidad de la fase '$name'$where no tiene id") }
            elseif ($ids.Contains($id)) { $problems.Add("el id $id se repite") }
            else { [void]$ids.Add($id) }

            if ($null -eq $unitStatus -or $Statuses -cnotcontains $unitStatus) {
                $problems.Add("$label tiene status $(Get-Shown $unitStatus)")
            }

            $group = Get-Text $unit 'group'
            $here = $name + $where
            if ((Test-Has $unit 'group') -and [string]::IsNullOrEmpty($group)) {
                $problems.Add("$label tiene group $(Get-Shown (Get-Raw $unit.group)): es el id de texto de su grupo en paralelo")
            }
            elseif ($null -ne $group) {
                if (-not $groupPhase.ContainsKey($group)) { $groupPhase[$group] = $here }
                elseif ($groupPhase[$group] -cne $here) {
                    $problems.Add("el grupo $group tiene unidades en '$($groupPhase[$group])' y en '$name'$where; un grupo vive en una fase")
                }
            }

            if (Test-Has $unit 'model') {
                $model = Get-Text $unit 'model'
                if ($null -eq $model -or $Models -cnotcontains $model) {
                    $problems.Add("$label tiene model $(Get-Shown (Get-Raw $unit.model)): son $($Models -join ', ')")
                }
                elseif ($null -eq $group) {
                    $problems.Add("$label tiene model sin group: el modelo es de una unidad en paralelo")
                }
            }

            if ($unitStatus -ceq 'doing') {
                $shownId = $id; if ($null -eq $shownId) { $shownId = '?' }
                $unitsDoing.Add([pscustomobject]@{ Id = $shownId; Group = $group })
                if ($phaseStatus -cne 'doing') {
                    $problems.Add("$label está en doing, pero su fase '$name'$where está en $(Get-Shown $phaseStatus)")
                }
            }

            if ($phaseStatus -ceq 'done' -and ($unitStatus -ceq 'todo' -or $unitStatus -ceq 'doing')) {
                $problems.Add("la fase '$name'$where está done con $label en $unitStatus")
            }
        }
    }
    return , $phasesDoing
}

function Test-Slices($root, $slices, $ids, $unitsDoing, $groupPhase, $problems) {
    if (Test-Has $root 'cadence') {
        $cadence = Get-Text $root 'cadence'
        if ($null -eq $cadence -or $Cadences -cnotcontains $cadence) {
            $problems.Add("cadence es $(Get-Shown (Get-Raw $root.cadence)): son $($Cadences -join ', ')")
        }
    }
    if (-not (Test-List $slices)) { $problems.Add('slices no es una lista'); return }

    $sliceIds = New-Object System.Collections.Generic.HashSet[string]
    $slicesDoing = New-Object System.Collections.Generic.List[string]
    $index = 0
    foreach ($slice in $slices) {
        $index++
        $id = Get-Text $slice 'id'
        $name = $id; if ($null -eq $name) { $name = "#$index" }
        $sliceStatus = Get-Text $slice 'status'

        if ($null -eq $id) { $problems.Add("el tramo #$index no tiene id de texto") }
        elseif (-not $sliceIds.Add($id)) { $problems.Add("el tramo $id se repite") }

        if ($null -eq $sliceStatus -or $Statuses -cnotcontains $sliceStatus) {
            $problems.Add("el tramo $name tiene status $(Get-Shown $sliceStatus)")
        }
        if ($sliceStatus -ceq 'doing') { $slicesDoing.Add($name) }

        if (-not (Test-Has $slice 'phases') -or -not (Test-List $slice.phases)) {
            $problems.Add("el tramo $name no tiene phases, o no es una lista")
            continue
        }

        $phasesDoing = Test-Phases $slice.phases " del tramo $name" $ids $unitsDoing $groupPhase $problems
        if ($phasesDoing.Count -gt 1) {
            $problems.Add("hay $($phasesDoing.Count) fases en doing en el tramo $name ($($phasesDoing -join ', ')); a lo sumo una")
        }
        if ($phasesDoing.Count -gt 0 -and $sliceStatus -cne 'doing') {
            $problems.Add("la fase '$($phasesDoing[0])' del tramo $name está en doing, pero su tramo está en $(Get-Shown $sliceStatus)")
        }

        $seen = New-Object System.Collections.Generic.HashSet[string]
        foreach ($phase in $slice.phases) {
            $phaseName = Get-Text $phase 'name'
            $phaseStatus = Get-Text $phase 'status'
            if ($null -ne $phaseName -and -not $seen.Add($phaseName)) {
                $problems.Add("la fase '$phaseName' se repite en el tramo $name")
            }
            if ($sliceStatus -ceq 'done' -and $phaseStatus -cne 'done' -and $phaseStatus -cne 'dropped') {
                $shownPhase = $phaseName; if ($null -eq $shownPhase) { $shownPhase = '?' }
                $problems.Add("el tramo $name está done con su fase '$shownPhase' en $(Get-Shown $phaseStatus)")
            }
        }
    }
    if ($slicesDoing.Count -gt 1) {
        $problems.Add("hay $($slicesDoing.Count) tramos en doing ($($slicesDoing -join ', ')); a lo sumo uno")
    }
}

function Get-Problems($root) {
    $problems = New-Object System.Collections.Generic.List[string]
    if (-not (Test-Object $root)) { $problems.Add('la raíz no es un objeto'); return , $problems }

    if (-not (Test-Has $root 'approved') -or -not ($root.approved -is [bool])) {
        $problems.Add('approved tiene que ser true o false')
    }
    if (Test-Has $root 'delegation') {
        $delegation = Get-Text $root 'delegation'
        if ($null -eq $delegation -or $DelegationModes -cnotcontains $delegation) {
            $problems.Add("delegation es $(Get-Shown (Get-Raw $root.delegation)): son $($DelegationModes -join ', ')")
        }
    }

    $ids = New-Object System.Collections.Generic.HashSet[string]
    $unitsDoing = New-Object System.Collections.Generic.List[object]
    $groupPhase = @{}
    $hasPhases = Test-Has $root 'phases'
    $hasSlices = Test-Has $root 'slices'
    $version = $null; if (Test-Has $root 'version') { $version = Get-RawJson $root.version }

    if ($hasPhases -and $hasSlices) {
        $problems.Add('phases y slices juntos en la raíz: con tramos, las fases van dentro de cada tramo')
        return , $problems
    }
    if ($hasSlices) {
        if ($version -cne '2') { $problems.Add("slices pide version 2, y version es $(Get-Shown $version)") }
        Test-Slices $root $root.slices $ids $unitsDoing $groupPhase $problems
    }
    elseif ($version -ceq '2') {
        $problems.Add('version 2 pide slices en lugar de phases')
        return , $problems
    }
    elseif (-not $hasPhases -or -not (Test-List $root.phases)) {
        $problems.Add('falta phases, o no es una lista')
        return , $problems
    }
    else {
        $phasesDoing = Test-Phases $root.phases '' $ids $unitsDoing $groupPhase $problems
        if ($phasesDoing.Count -gt 1) {
            $problems.Add("hay $($phasesDoing.Count) fases en doing ($($phasesDoing -join ', ')); a lo sumo una")
        }
    }

    $distinctGroups = New-Object System.Collections.Generic.HashSet[string]
    foreach ($u in $unitsDoing) { if ($null -eq $u.Group) { [void]$distinctGroups.Add('') } else { [void]$distinctGroups.Add('g:' + $u.Group) } }
    $distinct = $distinctGroups.Count
    if ($unitsDoing.Count -gt 1 -and ($distinct -gt 1 -or $null -eq $unitsDoing[0].Group)) {
        $problems.Add("hay $($unitsDoing.Count) unidades en doing ($(($unitsDoing | ForEach-Object { $_.Id }) -join ', ')); a lo sumo una, o las de un mismo grupo en paralelo")
    }

    if ($groupPhase.Count -gt 0 -and [string]::IsNullOrEmpty((Get-Text $root 'work_branch'))) {
        $problems.Add('hay grupos en paralelo y falta work_branch, la rama de trabajo')
    }

    if ((Test-Has $root 'autonomy') -and (Test-Object $root.autonomy)) {
        foreach ($list in @('units', 'keep_stops')) {
            if ((Test-Has $root.autonomy $list) -and (Test-List $root.autonomy.$list)) {
                foreach ($uid in $root.autonomy.$list) {
                    $raw = Get-RawJson $uid
                    if (-not $ids.Contains($raw)) {
                        $problems.Add("autonomy.$list nombra la unidad $raw, que no está en el plan")
                    }
                }
            }
        }
    }
    return , $problems
}

$path = Join-Path $Folder $Relative
if (-not (Test-Path $path -PathType Leaf)) {
    Write-Output "No hay $Relative en esta carpeta: nada que revisar."
    exit 0
}

try {
    $root = Get-Content $path -Raw -Encoding UTF8 | ConvertFrom-Json
    $problems = Get-Problems $root
}
catch {
    $problems = @("no es JSON válido: $($_.Exception.Message)")
}

if ($problems.Count -eq 0) {
    Write-Output "${Relative}: cumple el contrato del kernel."
    exit 0
}
Write-Output "${Relative}: $($problems.Count) problema(s)"
foreach ($problem in $problems) { Write-Output "  $problem" }
exit 1
