# Spike · temas de plugin, tema desde el mod y banda compartida — 2026-10-17

Unidad 219 del plan del mod de skins. Responde los tres puntos sin verificar de la investigación,
antes de escribir la spec (216). Claude Code **2.1.302**, Windows 11.

**El spike:** un plugin descartable en la carpeta temporal del job,
`~/.claude/jobs/1db5e93f/tmp/spike-skin/`, con:
- `themes/nzt.json`: un tema "NZT (spike)" con la paleta de `specs/nzt-brand.md`, sobre `dark`;
- `hooks/register.tsx`: el comando `/spike-skin` (muestra la opción de tema de `/config`),
  `/spike-skin set <valor>` (intenta cambiarla desde el mod), `/spike-skin usage` (lo que da
  `$.session.usage()`), y una línea propia sobre el prompt que deja debajo lo que dibujen los
  otros mods.

`claude plugin validate .` pasa.

## Resultados

| # | Pregunta | Resultado | Evidencia |
|---|---|---|---|
| S-01 | ¿El mod puede ver los temas en `/config`? | **observado: solo los de Claude Code** | `claude -p "/spike-skin" --plugin-dir .` → la opción `theme` es `choice` con `auto, dark, light, light-daltonized, dark-daltonized, light-ansi, dark-ansi`; el tema del plugin no figura |
| S-02 | ¿El mod puede activar un tema propio? | **observado: no** | `/spike-skin set custom:nzt-spike-skin:nzt` → `{"deny":"takes one of: auto, dark, light, …"}` |
| S-03 | ¿Qué da `$.session.usage()` antes de la primera respuesta? | **observado** | `{"startedAt":…,"context":{"window":1000000},"rateLimits":[],"cost":{"usd":0}}`: sin porcentaje ni límites hasta que llega una respuesta de la API, como dicen los tipos |
| S-04 | ¿El tema del plugin aparece en `/theme` y recolorea la terminal? | **observado: no aparece**, con el mod cargado desde la carpeta de mods de la sesión (`~/.claude/dev-mods/<sesión>/`) | usuario, 2026-10-17: `/spike-skin` respondió (el mod cargó, `surfaces → ["terminal"]`) y en `/theme` no estaba el tema. Falta separar la causa: esa carpeta puede no leer `themes/`. Prueba siguiente: S-04b |
| S-04b | ¿Un tema propio de usuario (`~/.claude/themes/nzt-spike.json`, la misma paleta) aparece y recolorea? | **observado: sí aparece y recolorea** | usuario, 2026-10-17: tras reiniciar, `/theme` respondió `Using custom theme "NZT (spike, usuario)"` y "se ve muy bien". El tema de usuario funciona en terminal; falta ver si el de plugin también (S-04c) |
| S-04c | ¿El tema del plugin aparece cargándolo con `--plugin-dir`? | pending: **en vivo, usuario**, en una sesión nueva | — |
| S-05 | ¿La app de escritorio respeta un tema propio? | pending: **en vivo, usuario** | — |
| S-06 | Con el tema elegido, ¿qué valor queda en la opción `theme`? | pending: **en vivo, usuario** (después de S-04, correr `/spike-skin`) | — |
| S-07 | Con `nzt-context` instalado, ¿se ven las dos bandas, la del spike arriba? | pending: **en vivo, usuario** | — |

**Lo que ya se puede decir (inferido de S-01 y S-02):** el tema de NZT lo elige la persona una vez
en `/theme`; el mod no lo puede prender ni apagar. El panel de opciones del mod puede **decir**
cómo hacerlo, pero no hacerlo. Las paletas de lo que dibuja el mod (banda, tarjetas, filas) sí las
cambia el mod en el acto, como la referencia.

`-p` no tiene interfaz (`surfaces → []`), así que S-04 a S-07 no se pueden ver desde acá.

## Cómo correr lo pendiente

**Pospuesto** por el usuario el 2026-10-17: S-04c a S-07 se prueban al final, con el mod construido
(unidad 224 del plan), y la spec (`specs/mods/nzt-look/spec.md`; el mod se llamaba `nzt-skins`
hasta el 2026-10-18) los deja como notas técnicas.

1. **Terminal:** `claude --plugin-dir "C:\Users\ezefe\.claude\jobs\1db5e93f\tmp\spike-skin"`.
   `/theme` → ¿aparece **NZT (spike)**, marcado de `nzt-spike-skin`? Elegirlo y mirar el borde
   del prompt, el spinner y los textos (S-04). Correr `/spike-skin` y traer el `value` (S-06).
   Con `nzt-context` instalado, mirar encima del prompt (S-07).
2. **App de escritorio:** copiar `themes/nzt.json` del spike a `~/.claude/themes/nzt-spike.json`
   (un tema propio de usuario, sin plugin), elegirlo en `/theme` desde la pestaña Code y ver si
   cambia algo (S-05). Después borrar ese archivo.
