# How — Lista de tareas
Updated: 2026-11-09

## All of it
| Topic | Decision | Choice | Why | What it implies |
|---|---|---|---|---|
| Base | Con qué se hace | .NET 10 con Blazor WebAssembly | Es lo que uso en el trabajo (H-02) | La primera carga tarda un par de segundos |
| Base | Dónde se guardan las tareas | SQLite, un archivo en la carpeta | Simple, sin servidor (H-03) | Se respalda copiando el archivo |
| Structure | Forma | Dos piezas: `TaskList.Api/` y `TaskList.Web/` | Quiero sumar el celular después (H-04) | Hay que arrancar las dos |
