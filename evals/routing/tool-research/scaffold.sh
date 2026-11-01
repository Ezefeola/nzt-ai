#!/usr/bin/env bash
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "$here/../../_fixtures/kernel-only.sh" "$PWD"

# A Unity 6 game whose engine is decided and whose packs and agent tools are not: the moment
# DB-03 is about. The catalogue has a unity pack; research may find something newer or more
# official, and both are proposed together.
mkdir -p "$PWD/Docs/Product" "$PWD/Docs/Architecture" "$PWD/ProjectSettings" "$PWD/Packages" \
  "$PWD/Assets/Scripts"

cat > "$PWD/Docs/Product/product.md" <<'MD'
# Producto — Cosecha

Juego de granja para PC, de una sola persona. El jugador siembra, riega y vende lo que
cosecha para ampliar la granja. Entrega 1: un día completo de juego con tres cultivos.
MD

cat > "$PWD/Docs/Architecture/architecture.md" <<'MD'
# Arquitectura — Cosecha

| Componente | Qué es | Áreas |
|---|---|---|
| Cosecha | el juego, en Unity | gameplay, ui |
MD

cat > "$PWD/Docs/Architecture/tech.md" <<'MD'
# Tech — Cosecha

## Cosecha
root: `./` · areas: gameplay, ui · packs: — (QT-04)

| Decision | Choice | When |
|---|---|---|
| Engine | Unity 6000.0.58f2 | — |
| Scripting | C# | every script |
| Target platform | Windows | — |
| Input | Input System 1.14 | every control |

Opt-ins
- **Test levels:** QT-05
- **Test-first:** no
- **End-to-end tool:** no

Evidence: versions read 2026-10-30 from `ProjectSettings/ProjectVersion.txt` and
`Packages/manifest.json`.
MD

cat > "$PWD/ProjectSettings/ProjectVersion.txt" <<'TXT'
m_EditorVersion: 6000.0.58f2
TXT

cat > "$PWD/Packages/manifest.json" <<'JSON'
{
  "dependencies": {
    "com.unity.inputsystem": "1.14.0",
    "com.unity.ugui": "2.0.0"
  }
}
JSON

cat > "$PWD/Assets/Scripts/Crop.cs" <<'CS'
using UnityEngine;

public class Crop : MonoBehaviour
{
    public int daysToGrow = 3;
}
CS
