#!/bin/sh
# Instalador de una línea de NZT (D46, specs/nzt-installer.md sección 10).
#
#   curl -fsSL https://github.com/Ezefeola/nzt-ai/releases/latest/download/install-claude.sh | sh
#   curl -fsSL https://github.com/Ezefeola/nzt-ai/releases/latest/download/install-codex.sh | sh
#
# Esta es la fuente de las dos variantes: install/variants.sh reemplaza la línea
# marcada `nzt:provider` por el proveedor fijo. Sin variante, el proveedor sale
# de NZT_PROVIDER, que es como se prueba.
#
# Instala NZT en un proveedor, no el CLI: lo baja a una carpeta temporal,
# verifica su SHA256, corre `install --provider` una vez y lo borra. Todo lo que
# se escribe en CLAUDE.md, AGENTS.md o las carpetas de skills lo hace el CLI con
# sus propias reglas.
#
# Variables: NZT_UNINSTALL, NZT_DRY_RUN, NZT_VERSION, NZT_DOWNLOAD_BASE (tabla en
# la sección 10.3 de la spec).
#
# Todo vive en main y main se llama en la última línea: si la descarga se corta
# a la mitad, sh no ejecuta un script incompleto.

set -eu

REPO="https://github.com/Ezefeola/nzt-ai"

say() { printf '  %s\n' "$*"; }
fail() { printf '  %s\n' "$*" >&2; exit 1; }

detect_rid() {
    os=$(uname -s)
    arch=$(uname -m)

    case "$os" in
        Linux) os=linux ;;
        Darwin) os=osx ;;
        *) fail "No hay binario de NZT para este sistema: $os." ;;
    esac

    case "$arch" in
        x86_64 | amd64) arch=x64 ;;
        aarch64 | arm64) arch=arm64 ;;
        *) fail "No hay binario de NZT para esta arquitectura: $arch." ;;
    esac

    # Una terminal bajo Rosetta dice x86_64 en un Mac Apple Silicon: se baja el nativo.
    if [ "$os" = osx ] && [ "$arch" = x64 ] \
        && [ "$(sysctl -n sysctl.proc_translated 2>/dev/null || echo 0)" = 1 ]; then
        arch=arm64
    fi

    # Los binarios de Linux se compilan contra glibc; en musl no arrancan.
    if [ "$os" = linux ] && [ -f /etc/alpine-release ]; then
        fail "Alpine usa musl y el binario de NZT necesita glibc. No se instaló nada."
    fi

    echo "$os-$arch"
}

download() {
    if command -v curl >/dev/null 2>&1; then
        curl -fsSL "$1" -o "$2"
    elif command -v wget >/dev/null 2>&1; then
        wget -q "$1" -O "$2"
    else
        fail "Hace falta curl o wget para bajar NZT."
    fi
}

sha256_of() {
    if command -v sha256sum >/dev/null 2>&1; then
        sha256sum "$1" | cut -d ' ' -f 1
    elif command -v shasum >/dev/null 2>&1; then
        shasum -a 256 "$1" | cut -d ' ' -f 1
    else
        fail "Hace falta sha256sum o shasum para verificar el binario. No se instaló nada."
    fi
}

main() {
    provider=${NZT_PROVIDER:-} # nzt:provider
    [ -n "$provider" ] || fail "Falta el proveedor. Usá install-claude.sh o install-codex.sh."

    action=install
    if [ "${NZT_UNINSTALL:-}" = 1 ]; then action=uninstall; fi

    rid=$(detect_rid)
    asset="nzt-$rid"

    if [ -n "${NZT_DOWNLOAD_BASE:-}" ]; then
        base=${NZT_DOWNLOAD_BASE%/}
    elif [ -n "${NZT_VERSION:-}" ]; then
        base="$REPO/releases/download/$NZT_VERSION"
    else
        base="$REPO/releases/latest/download"
    fi

    # La carpeta temporal se borra siempre: no queda nada del instalador.
    temp=$(mktemp -d 2>/dev/null || mktemp -d -t nzt)
    trap 'rm -rf "$temp"' EXIT INT TERM

    # 1-2. Binario y hashes del mismo release.
    say "Bajando $asset..."
    download "$base/$asset" "$temp/nzt" \
        || fail "No se pudo bajar $base/$asset. No se instaló nada."
    download "$base/SHA256SUMS" "$temp/SHA256SUMS" \
        || fail "No se pudo bajar $base/SHA256SUMS. No se instaló nada."

    # 3. Hash. Sin coincidencia exacta no se corre nada.
    expected=$(awk -v a="$asset" '{ f = $2; sub(/^\*/, "", f); if (f == a) print tolower($1) }' "$temp/SHA256SUMS")
    [ -n "$expected" ] || fail "SHA256SUMS no tiene una línea para $asset. No se instaló nada."
    actual=$(sha256_of "$temp/nzt" | tr 'A-F' 'a-f')
    if [ "$expected" != "$actual" ]; then
        say "esperado  $expected"
        say "bajado    $actual"
        fail "El SHA256 de $asset no coincide. No se instaló nada."
    fi
    chmod +x "$temp/nzt"
    say "Binario verificado."
    echo

    # 4. Una sola corrida, sin menú: las reglas de qué se escribe son del CLI.
    status=0
    if [ "${NZT_DRY_RUN:-}" = 1 ]; then
        "$temp/nzt" "$action" --provider "$provider" --dry-run || status=$?
    else
        "$temp/nzt" "$action" --provider "$provider" || status=$?
    fi

    if [ "$status" -eq 0 ] && [ "$action" = install ] && [ "${NZT_DRY_RUN:-}" != 1 ]; then
        say "Para actualizar, la misma línea de nuevo."
    fi
    return "$status"
}

main "$@"
