# Instalador de una linea de NZT (D46, specs/nzt-installer.md seccion 10).
#
#   powershell -ExecutionPolicy ByPass -c "irm https://github.com/Ezefeola/nzt-ai/releases/latest/download/install-claude.ps1 | iex"
#   powershell -ExecutionPolicy ByPass -c "irm https://github.com/Ezefeola/nzt-ai/releases/latest/download/install-codex.ps1 | iex"
#
# Esta es la fuente de las dos variantes: install/variants.sh reemplaza la linea
# marcada `nzt:provider` por el proveedor fijo. Sin variante, el proveedor sale
# de NZT_PROVIDER, que es como se prueba.
#
# Instala NZT en un proveedor, no el CLI: lo baja a una carpeta temporal,
# verifica su SHA256, corre `install --provider` una vez y lo borra. Todo lo que
# se escribe en CLAUDE.md, AGENTS.md o las carpetas de skills lo hace el CLI con
# sus propias reglas.
#
# Variables: NZT_UNINSTALL, NZT_DRY_RUN, NZT_VERSION, NZT_DOWNLOAD_BASE (tabla en
# la seccion 10.3 de la spec).
#
# Corre dentro de & { } y nunca llama a `exit`: pegado en una consola abierta,
# un `exit` cerraria la ventana del usuario, y el bloque no deja variables ni
# funciones en su sesion. El texto va sin tildes por precaucion: como decodifica
# irm un asset sin charset en Windows PowerShell 5.1 no esta verificado.

& {
    $ErrorActionPreference = 'Stop'
    $ProgressPreference = 'SilentlyContinue'
    [Net.ServicePointManager]::SecurityProtocol =
        [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12

    $repo = 'https://github.com/Ezefeola/nzt-ai'
    $provider = $env:NZT_PROVIDER # nzt:provider

    if (-not $provider) {
        Write-Host '  Falta el proveedor. Usa install-claude.ps1 o install-codex.ps1.' -ForegroundColor Red
        return
    }

    $action = if ($env:NZT_UNINSTALL -eq '1') { 'uninstall' } else { 'install' }

    # 1. Plataforma. OSArchitecture ve el hardware real aunque la consola corra
    # emulada; las variables de entorno quedan como respaldo.
    $arch = $null
    try {
        $arch = [System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture.ToString()
    } catch {
        $arch = if ($env:PROCESSOR_ARCHITEW6432) { $env:PROCESSOR_ARCHITEW6432 } else { $env:PROCESSOR_ARCHITECTURE }
    }

    $rid = switch -Regex ($arch) {
        '^(X64|AMD64)$' { 'win-x64' }
        '^(Arm64|ARM64)$' { 'win-arm64' }
        default { $null }
    }
    if (-not $rid) {
        Write-Host "  No hay binario de NZT para esta arquitectura: $arch." -ForegroundColor Red
        return
    }

    $asset = "nzt-$rid.exe"
    $base = if ($env:NZT_DOWNLOAD_BASE) { $env:NZT_DOWNLOAD_BASE.TrimEnd('/') }
            elseif ($env:NZT_VERSION) { "$repo/releases/download/$($env:NZT_VERSION)" }
            else { "$repo/releases/latest/download" }

    $temp = Join-Path ([System.IO.Path]::GetTempPath()) ("nzt-" + [guid]::NewGuid().ToString('N'))
    New-Item -ItemType Directory -Path $temp -Force | Out-Null

    try {
        # 2. Binario y hashes del mismo release, a la carpeta temporal.
        Write-Host "  Bajando $asset..."
        $binary = Join-Path $temp 'nzt.exe'
        $sums = Join-Path $temp 'SHA256SUMS'
        try {
            Invoke-WebRequest -UseBasicParsing -Uri "$base/$asset" -OutFile $binary
            Invoke-WebRequest -UseBasicParsing -Uri "$base/SHA256SUMS" -OutFile $sums
        } catch {
            Write-Host "  No se pudo bajar de $base : $($_.Exception.Message)" -ForegroundColor Red
            Write-Host '  No se instalo nada.'
            return
        }

        # 3. Hash. Sin coincidencia exacta no se corre nada.
        $expected = $null
        foreach ($line in Get-Content -LiteralPath $sums) {
            $parts = $line.Trim() -split '\s+', 2
            if ($parts.Count -eq 2 -and $parts[1].TrimStart('*') -eq $asset) { $expected = $parts[0].ToLowerInvariant() }
        }
        $actual = (Get-FileHash -LiteralPath $binary -Algorithm SHA256).Hash.ToLowerInvariant()

        if (-not $expected) {
            Write-Host "  SHA256SUMS no tiene una linea para $asset. No se instalo nada." -ForegroundColor Red
            return
        }
        if ($expected -ne $actual) {
            Write-Host "  El SHA256 de $asset no coincide. No se instalo nada." -ForegroundColor Red
            Write-Host "    esperado  $expected"
            Write-Host "    bajado    $actual"
            return
        }
        Write-Host '  Binario verificado.'
        Write-Host ''

        # 4. Una sola corrida, sin menu: las reglas de que se escribe son del CLI.
        $arguments = @($action, '--provider', $provider)
        if ($env:NZT_DRY_RUN -eq '1') { $arguments += '--dry-run' }
        & $binary @arguments
    } finally {
        # 5. No queda nada del instalador: solo NZT en el proveedor y su manifiesto.
        Remove-Item -LiteralPath $temp -Recurse -Force -ErrorAction SilentlyContinue
    }

    if ($LASTEXITCODE -eq 0 -and $action -eq 'install' -and $env:NZT_DRY_RUN -ne '1') {
        Write-Host '  Para actualizar, la misma linea de nuevo.'
    }
}
