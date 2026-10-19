# nzt-look

> Versión **0.4.0** · spec en [`specs/mods/nzt-look/spec.md`](../../specs/mods/nzt-look/spec.md)

Cambia **cómo se ve una sesión de Claude Code**: un tema de colores, una banda sobre el prompt
con lo que llevás gastado, y la conversación redibujada para leerla de un vistazo. Reemplaza a
`nzt-context`: el contexto con las marcas 20/30/40 del método sigue en la banda, y el agente
sigue recibiendo la cifra con cada prompt.

```
┃ ● Bash pnpm test --filter hub                           2.1s ▸
┃ ● Edit apps/hub/src/server.ts                  +18 −3   0.4s ▸
┃ ● Read 2 · Grep 1                                            ▸
✻ Baked for 41s · 6 herramientas · +18 −3

▰▰▰▰▰▰▱▱▱▱▱▱▱  34% contexto · 68k/200k · limpiá pronto   ▰▰▰▱▱▱▱▱ 41% 5h · 2h15   $1.84   0: /clear
```

**Es opcional** y sirve en cualquier proyecto, use NZT o no. Funciona solo en Claude Code
(terminal y app de escritorio), porque Codex no tiene mods.

## Instalarlo

```
/plugin install nzt-look --marketplace Ezefeola/nzt-ai
```

Al instalarlo el tema es `nzt` y la variante sigue a la de Claude Code. Si tenés otro mod que
redibuja la conversación, usá uno de los dos: con los dos, dibuja el que Claude Code ponga primero.

## Cómo se usa

| Comando | Hace |
|---|---|
| `/nzt-look` | abre o cierra el panel de opciones |
| `/nzt-look <tema>` | cambia el tema (`nzt`, `dracula`, `nord`, …) |
| `/nzt-look off` | devuelve el dibujo a Claude Code; la banda y la línea al agente siguen |
| `/nzt-look on` | lo vuelve a prender |
| `/nzt-look copy` | copia la última respuesta del agente (`copy code`: su último bloque de código) |

**El panel** deja elegir el tema con una vista previa, la variante (`auto`, oscura, clara),
fijar un tema a la carpeta, prender y apagar cada parte de la banda y de la conversación, el
modo calmo (sin movimiento), las **palabras** del spinner y del pie (`claude`, las de Claude Code,
por defecto; `mod`, las del tema) y repintar un color: lo guarda como un tema tuyo, `mi-<tema>`, y el
original queda como estaba. También podés **pedirle a Claude un tema** ("uno que se sienta como un
atardecer"): lo arma y lo aplica.

**La banda** es una línea: el modelo con su effort (`◇ Opus 5.5 · high`; el effort aparece con el
primer pedido al modelo), `Contexto` con las marcas 20, 30 y 40 (amarillo desde el 20%, naranja desde el
30% y rojo desde el 40%), `Límite 5h` y `Límite semanal` con lo que falta para que se renueven, `Costo`
y `0: /clear`. El botón se apaga mientras Claude trabaja y **pide
una segunda pulsación** antes de limpiar: limpiar borra la conversación y no se deshace. Si no
entra en el ancho, se van primero los tokens, las cuentas regresivas, el costo, el effort, el modelo, el semanal, el de 5
horas y el botón.

**NZT oscuro y NZT claro** también están en `/theme`, para que el borde del prompt y el spinner
de Claude Code lleven la marca: elegilos ahí una vez. El mod no puede cambiar ese tema por vos.

## Qué redibuja

Filas de herramientas (con `▸` para ver entrada y respuesta, y los fallos abiertos solos),
lecturas y búsquedas agrupadas, tarjeta de consola (salida en color, stderr aparte, plegada a
8 + 4 líneas), diff numerado y resaltado como el código de su archivo, tablas (las más anchas que
la terminal bajan el texto de sus celdas de línea), avisos (`> [!NOTE]`), listas de tareas,
código resaltado, fórmulas (`$…$` y `$$…$$`), diagramas Mermaid (flujo, estados, secuencia,
torta y mapa mental), el spinner (con el tiempo, los tokens y el effort del turno), el pie del
turno, el contorno de tu prompt y la salida de comandos como `/cost`. **Cambia el estilo, no los
textos de Claude Code**: las filas dicen `Bash`, `Read` o `Edit`, una llamada cortada dice
`Interrupted` y el pie es la línea de Claude Code con las herramientas y las líneas del turno al final. **Lo que no puede dibujar fielmente queda como lo dibuja Claude Code**:
un lenguaje que no conoce, un diagrama de otro tipo o más ancho que la conversación, un comando
en segundo plano. Los subagentes, el modo plan, las tareas y el pedido de permiso quedan siempre
como en Claude Code. **El mod solo cambia cómo se ve**: la conversación guardada y lo que lee el
modelo no cambian.

## Desinstalarlo

```
/plugin uninstall nzt-look
```

## Créditos

Los colores de los quince temas que no son `nzt` son los de los temas públicos que llevan su
nombre (Dracula, Nord, Catppuccin, Rosé Pine, Gruvbox, Tokyo Night, Kanagawa, Everforest, One
Dark, Solarized, Night Owl, Ayu, GitHub). El código de `nzt-look` es propio. Donde un color no llegaba a leerse bien sobre su
fondo, el mod lo aclara u oscurece sin cambiarle el tono.
