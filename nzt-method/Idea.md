# Idea: un método de trabajo genérico

Anotado el 2026-11-08, en la rama `metodo-generico`. Es una exploración: puede terminar
descartada. Lo que sigue es lo que pidió el usuario. Lo marcado como *propuesta de Claude* no
está decidido.

## Qué se quiere

Un **método de trabajo genérico**, **no atado a nada**: ni a software ni a ningún dominio,
herramienta o tipo de producto. Tiene que servir para trabajar en **cualquier cosa**
(software, un juego, un documento, un curso, una investigación, una mudanza) y lograr tres
cosas:

1. **Mantener el contexto.** El trabajo se puede retomar en otra sesión sin explicarlo otra
   vez.
2. **Trabajo ágil.** Nada es obligatorio. El método permite ajustar en cada momento qué se
   hace y cuánto proceso lleva: no es una cascada de fases que hay que recorrer enteras.
3. **Trabajo de calidad.** Lo hecho se puede revisar, se verifica y se reporta lo que pasó de
   verdad.

Y tiene que **poder apoyarse en plugins, MCPs o ambos**, y en las herramientas que tenga el
agente, **cuando el trabajo las necesite** o el agente lo considere útil. No como requisito.

## De dónde viene

- **`nzt-software`** (`../nzt-software/README.md`) define su forma de trabajo al principio
  del README: las fases DISCOVERY → ARCHITECTURE → DESIGN → BUILD → VERIFY → SHIP, y en cada
  unidad el loop Entender → Proponer → Ejecutar → Verificar → Registrar, con el estado en
  `Plan/state.json`. **La idea es tomar esa forma, pero genérica:** las fases y sus nombres
  son de software; lo que se quiere es lo que queda debajo de ellas, y que ninguna sea
  obligatoria.
- **BMAD-Method** y métodos parecidos: según el usuario, ninguno es genérico. Antes de
  diseñar hay que comprobarlo en sus fuentes oficiales y ver qué toman de bueno y dónde se
  atan a un dominio.
- **Lo que ya se decidió en `nzt-software` y probablemente sirva** (*propuesta de Claude*):
  la regla de herramientas de D96 (*Agent tools*: cualquier MCP o plugin en cualquier fase,
  registrado por para qué sirve), las paradas al final de cada unidad, el estado persistido,
  y decir qué se comprobó en vez de qué se cree.

## Reglas para este trabajo

- **Todo va dentro de `nzt-method/`**: specs, ideas, decisiones, borradores. Fuera de esta
  carpeta no se toca nada.
- **Se trabaja sin NZT**, solo con Claude: sin `Plan/state.json`, sin unidades ni routers de
  NZT. El usuario lo desactiva para estas sesiones.
- **Vive en el monorepo `nzt-ai`** y se despliega por su cuenta: su pipeline corre solo si se
  tocó su carpeta, como pasa hoy con `nzt-software`.
- **No se mergea** a `pendientes-post-v5` ni a `main` mientras sea exploración.

## Preguntas abiertas

- **El nombre:** `nzt-method` es provisorio. *Propuesta de Claude:* no usar solo `nzt`,
  porque es la marca y el monorepo entero.
- **La relación con `nzt-software`:** lo reemplaza, `nzt-software` se apoya en él, o
  conviven.
- **Qué es lo mínimo** que tiene que tener el método para mantener el contexto sin volverse
  burocracia en un trabajo chico.
- **Cómo se adapta a un dominio** sin nombrarlo: quién aporta el vocabulario y las
  prácticas de cada tipo de trabajo (el usuario, un plugin, un MCP, el propio agente).
- **En qué hosts corre:** Claude Code y Codex como `nzt-software`, o también otros.

## Primer paso sugerido

*Propuesta de Claude:* antes de escribir el método, investigar BMAD-Method y dos o tres
métodos más en sus fuentes. Después, separar en `nzt-software` lo que es genérico de lo que
es de software, y escribir en esta carpeta los principios del método antes que su
estructura.
