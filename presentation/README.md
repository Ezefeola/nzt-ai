# Presentación de NZT

Deck HTML autocontenido para una sesión profesional de **55 minutos**: 34 minutos de
concepto, 18 minutos de demo y 3 minutos de cierre. No descarga fuentes, librerías ni
recursos externos; alcanza con abrir `index.html` en un navegador moderno.

## Cómo abrirla

Opción directa:

```powershell
start presentation/index.html
```

Opción recomendada, para que el navegador la sirva por HTTP:

```powershell
cd presentation
python -m http.server 8080
```

Después abrir `http://localhost:8080`. El servidor es opcional; el deck también funciona
con `file://`.

## Controles

| Tecla | Acción |
|---|---|
| `←` `→`, espacio, Page Up/Down | Navegar |
| `O` | Vista general |
| `S` | Notas del presentador |
| `F` | Pantalla completa |
| `T` | Iniciar o pausar el cronómetro |
| `?` | Mostrar atajos |
| Home / End | Primera / última diapositiva |

Los cuatro prompts de la diapositiva **Cabina de demo** tienen botón para copiarlos. La
URL conserva el número de slide (`#/14`), por lo que se puede volver a un punto exacto.

## Timing sugerido

| Bloque | Slides | Tiempo acumulado | Objetivo |
|---|---:|---:|---|
| Apertura | 1–3 | 6 min | Presentar NZT, el origen del nombre y la agenda |
| El problema | 4–5 | 12 min | Mostrar por qué velocidad no equivale a control |
| Cómo funciona | 6–12 | 30 min | Explicar capas, ciclo, frenos, estado, fases y artefactos |
| Confianza | 13–14 | 34 min | Guardrails, límites, instalación y medición |
| Demo | 15–19 | 52 min | Observar NZT sobre un producto desde cero |
| Cierre | 20 | 55 min | Proponer una adopción pequeña y medible |

El cronómetro de la barra superior no arranca solo: hacer clic o presionar `T` al comenzar.

La slide 11 muestra once capacidades alrededor de NZT, con una órbita lenta y un brillo
suave. **Pausar movimiento** detiene la órbita y la iluminación; el mismo botón permite
reanudarlas. Las etiquetas permanecen horizontales. Con movimiento reducido se muestra
una composición estática; en pantallas angostas, las capacidades se ordenan en una grilla.
La impresión también conserva una versión estática sin el botón.

Las notas de esa slide explican **Specs** (especificaciones), **SDD** (desarrollo guiado
por especificaciones) y **TDD** (desarrollo guiado por pruebas).

Los boxes flotan suavemente hasta 3 px en ciclos de 7–9 segundos, con pequeños desfases
y una iluminación tenue que nunca se apaga. Al pasar el mouse o enfocar un control dentro
del box, se detienen en su posición y aumenta su brillo para facilitar la lectura.
Las slides 3, 6, 7 y 19 no tienen un box destacado por defecto.
En la portada, NZT tiene un halo suave y las etiquetas orbitales se mantienen derechas;
al pasar el mouse por la órbita, esta se pausa para poder señalar cada etiqueta.
La slide 15 tiene un arco luminoso que gira y un resplandor suave detrás del título.
El botón **Ⅱ** de la barra superior pausa o reanuda las animaciones ambientales, incluida
la flotación, el brillo de los boxes y la slide 11. Su pausa local se conserva. La preferencia de movimiento reducido desactiva
estos efectos de movimiento; la impresión queda estática.

## Preparación de la demo

La demo usa **Pulso**, un tablero mínimo de estado del equipo. El guion completo, las
respuestas preparadas, los resultados esperados y el plan de contingencia están en
[`demo/prompts.md`](demo/prompts.md).

Antes de la reunión:

1. Verificar que NZT esté instalado en el proveedor elegido.
2. Crear una carpeta vacía fuera de este repositorio para la demo.
3. Confirmar `dotnet --version` con .NET 10 si se hará la implementación.
4. Ejecutar el recorrido una vez y conservar checkpoints locales de cada fase.
5. Cerrar datos sensibles, notificaciones y otras ventanas antes de compartir pantalla.
6. Tener `presentation/demo/prompts.md` abierto como respaldo.

La presentación no depende de terminar todo el producto en vivo. Lo importante es que el
equipo vea cuatro comportamientos: **ruteo**, **plan aprobado antes de ejecutar**, **stop en
un límite de unidad** y **evidencia separada de opinión**.

## Presentar sin conexión

- El deck es offline.
- La demo con el agente sí necesita el acceso que requiera Codex o Claude Code.
- Si el agente no está disponible, usar los resultados esperados del guion y recorrer los
  archivos producidos en el ensayo previo.

## Exportar a PDF

Abrir la presentación y usar la impresión del navegador en orientación horizontal. La hoja
de estilos define páginas 16:9 y muestra todas las diapositivas sin controles ni notas.
