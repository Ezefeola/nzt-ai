# 13 — Refactor de skills, referencias y packs

> Abierto el 2026-11-01. Pedido del usuario: hacer menos y unificar mejor. Cada skill y
> referencia tiene que ser **genérica**, **sin redundancias** y **en pasos simples**, y el
> refactor se hace con la skill de crear skills. Ejemplo dado: los DTOs de C# se reducen a
> 1. `sealed record` · 2. siempre `set`, nunca `init` · 3. nunca constructores primarios,
> siempre propiedades declaradas.

## Lo observado (relevamiento del 2026-11-01)

- 12 skills (`skills/nzt/`) y 8 packs (`packs/`; `unity` está vacío): ~150 archivos, 7.448
  líneas medidas con `wc -l`.
- La separación genérica → área ya existe (regla 15 del §10 del spec): `nzt-code` →
  `nzt-csharp`, `nzt-backend` → `nzt-dotnet`, `nzt-frontend` → `nzt-blazor`.
- La redundancia está **dentro** de los archivos y entre hermanos, no entre niveles:
  - `nzt-csharp` regla 2 (constructores primarios) y regla 8 (`record` con propiedades) repiten
    `csharp/references/dtos.md` regla 1.
  - Los *Done when* y las checklists reescriben las reglas (`nzt-csharp` las repite todas).
  - Las reglas cargan su justificación ("returns that agree today diverge tomorrow"),
    excepciones entre paréntesis y sub-viñetas: una regla de tres palabras ocupa cinco líneas.
- No hay en el repo una skill NZT para escribir skills o packs. Las reglas de autoría viven en
  `specs/nzt-core.md` §10 (23 reglas; 17–19 son las tres del pedido, D83).

## Preguntas

- **QT-92 · Qué es "tu skill para crear skills".** Opciones: A · una referencia NZT de autoría
  (dueña de las reglas del §10, que pasa a nombrarla), usada en cada unidad del refactor y por
  quien escriba sus propios packs; B · `skill-creator` de Anthropic, con su ciclo de evals
  versión vieja contra nueva; C · las dos: la referencia NZT para la forma, `skill-creator`
  para medir. **Decidido por el usuario (2026-11-01): B**, `skill-creator`. Sin referencia NZT
  nueva: el §10 sigue siendo el dueño de las reglas de autoría.
- **QT-93 · El porqué de cada regla.** A · nunca, solo la regla, como el ejemplo de DTOs;
  B · una cláusula corta solo donde sin ella la regla se aplicaría mal. *Pendiente*: el usuario
  preguntó si se refiere a la `description` o a las filas del router; no, es la justificación
  dentro de la regla (ej.: "unsealing later is free, re-sealing… is not"). Repreguntada.
  **Decidido por el usuario (2026-11-01): B**, una cláusula corta solo donde sin ella la regla
  se aplicaría mal.
- **QT-95 · Qué entra en un pack.** Surgida al revisar el piloto: el usuario duda si `linq.md`
  hace falta con el MCP de Microsoft Learn. Propuesta del agente: un pack lleva solo lo que el
  usuario elige entre opciones válidas y los errores que el agente comete; lo que dice la
  documentación (qué hace un operador) sale. A · aplicarlo como regla del §10 y en todos los
  packs, empezando por rehacer `linq.md`; B · dejar los packs como quedaron. **Decidido por el
  usuario (2026-11-01): A** (unidad 457, regla 24 del §10).
- **Choque de guías (observado):** `skill-creator` pide explicar el porqué y tolera 500
  líneas; el §10 pide instrucciones sin narrativa y 200 líneas. Donde choquen manda el §10,
  dicho al usuario el 2026-11-01.
- **QT-94 · Evidencia de que el recorte no pierde nada.** A · chequeo de no-pérdida (D58) por
  unidad, puertas, y los evals existentes en una muestra, versión vieja contra nueva; B · solo
  no-pérdida y puertas. **Decidido por el usuario (2026-11-01): B**, sin correr evals.
