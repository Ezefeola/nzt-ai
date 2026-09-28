#!/bin/sh
# Genera los cuatro comandos de una línea (D46, specs/nzt-installer.md 10.1):
# install-claude y install-codex, en .ps1 y .sh, desde las dos fuentes de este
# directorio. Reemplaza la línea marcada `nzt:provider` por el proveedor fijo;
# si la marca no está, falla, porque la variante instalaría sin proveedor.
# Lo corre el workflow de release y se corre igual en local.
# Uso: install/variants.sh <carpeta-de-salida>

set -eu

here=$(cd "$(dirname "$0")" && pwd)
out=${1:?falta la carpeta de salida}
mkdir -p "$out"

variant() {
    name=$1 provider=$2

    # En .ps1 la marca puede terminar en CR: el patrón no ancla el fin de línea.
    sed "s/\\\$env:NZT_PROVIDER # nzt:provider/'$provider' # nzt:provider/" \
        "$here/install.ps1" > "$out/install-$name.ps1"
    sed "s/\${NZT_PROVIDER:-} # nzt:provider/$provider # nzt:provider/" \
        "$here/install.sh" > "$out/install-$name.sh"

    grep -q "'$provider' # nzt:provider" "$out/install-$name.ps1" \
        || { echo "install-$name.ps1: no se encontró la marca nzt:provider" >&2; exit 1; }
    grep -q "provider=$provider # nzt:provider" "$out/install-$name.sh" \
        || { echo "install-$name.sh: no se encontró la marca nzt:provider" >&2; exit 1; }

    echo "install-$name.ps1, install-$name.sh -> $provider"
}

variant claude claude-code
variant codex codex
