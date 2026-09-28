# Presentación de NZT

Deck HTML autocontenido para una sesión profesional de **35 minutos**: 10 minutos de presentación (incluidos la introducción a la demo y el cierre) y 25 minutos de demo. No descarga fuentes, librerías ni
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
URL conserva el número de slide (`#/12`), por lo que se puede volver a un punto exacto.

## Timing sugerido

| Bloque | Slides | Tiempo acumulado | Objetivo |
|---|---:|---:|---|
| Apertura | 1 | 0:30 min | Presentar NZT |
| El problema | 2–3 | 2 min | Mostrar por qué velocidad no equivale a control |
| Cómo funciona | 4–8 | 6 min | Explicar ciclo, frenos, estado, fases y artefactos |
| Confianza | 9 | 6:30 min | Qué no hace NZT |
| Introducción a la demo | 10–11 | 7:30 min | Presentar Radar |
| Demo en vivo | 12 | 32:30 min | Observar NZT sobre un producto desde cero |
| Cierre | 13 | 33:30 min | Proponer una adopción pequeña y medible |

El cronómetro de la barra superior no arranca solo: hacer clic o presionar `T` al comenzar.

Los boxes flotan suavemente hasta 3 px en ciclos de 7–9 segundos, con pequeños desfases
y una iluminación tenue que nunca se apaga. Al pasar el mouse o enfocar un control dentro
del box, se detienen en su posición y aumenta su brillo para facilitar la lectura.
Las slides 4 y 12 no tienen un box destacado por defecto.
En la portada, NZT tiene un halo suave y las etiquetas orbitales se mantienen derechas;
al pasar el mouse por la órbita, esta se pausa para poder señalar cada etiqueta.
La slide 10 tiene un arco luminoso que gira y un resplandor suave detrás del título.
El botón **Ⅱ** de la barra superior pausa o reanuda las animaciones ambientales, incluida
la flotación y el brillo de los boxes. La preferencia de movimiento reducido desactiva
estos efectos de movimiento; la impresión queda estática.

## Preparación de la demo

La demo usa **Radar**, un tablero mínimo de estado del equipo. El guion completo, las
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
