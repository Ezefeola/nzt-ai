#!/bin/sh
# Genera los seis comandos de una línea (D46, specs/nzt-installer.md 10.1):
# install-claude, install-claude-full e install-codex, en .ps1 y .sh, desde las
# dos fuentes de este directorio. Reemplaza la línea marcada `nzt:provider` por
# el proveedor fijo y, si la variante lleva mods, la marcada `nzt:mods`; si una
# marca no está, falla, porque la variante instalaría otra cosa que la pedida.
# Lo corre el workflow de release y se corre igual en local.
# Uso: install/variants.sh <carpeta-de-salida>

set -eu

here=$(cd "$(dirname "$0")" && pwd)
out=${1:?falta la carpeta de salida}
mkdir -p "$out"

variant() {
    name=$1 provider=$2 mods=${3:-}

    # Sin mods la marca queda como está y la variante instala solo el método.
    ps_mods='' sh_mods=''
    if [ -n "$mods" ]; then
        ps_mods="s/\\\$env:NZT_MODS # nzt:mods/'$mods' # nzt:mods/"
        sh_mods="s/\${NZT_MODS:-} # nzt:mods/$mods # nzt:mods/"
    fi

    # En .ps1 la marca puede terminar en CR: el patrón no ancla el fin de línea.
    sed -e "s/\\\$env:NZT_PROVIDER # nzt:provider/'$provider' # nzt:provider/" -e "$ps_mods" \
        "$here/install.ps1" > "$out/install-$name.ps1"
    sed -e "s/\${NZT_PROVIDER:-} # nzt:provider/$provider # nzt:provider/" -e "$sh_mods" \
        "$here/install.sh" > "$out/install-$name.sh"

    grep -q "'$provider' # nzt:provider" "$out/install-$name.ps1" \
        || { echo "install-$name.ps1: no se encontró la marca nzt:provider" >&2; exit 1; }
    grep -q "provider=$provider # nzt:provider" "$out/install-$name.sh" \
        || { echo "install-$name.sh: no se encontró la marca nzt:provider" >&2; exit 1; }

    if [ -n "$mods" ]; then
        grep -q "'$mods' # nzt:mods" "$out/install-$name.ps1" \
            || { echo "install-$name.ps1: no se encontró la marca nzt:mods" >&2; exit 1; }
        grep -q "mods=$mods # nzt:mods" "$out/install-$name.sh" \
            || { echo "install-$name.sh: no se encontró la marca nzt:mods" >&2; exit 1; }
    fi

    echo "install-$name.ps1, install-$name.sh -> $provider${mods:+, mods $mods}"
}

variant claude claude-code
variant claude-full claude-code all
variant codex codex
