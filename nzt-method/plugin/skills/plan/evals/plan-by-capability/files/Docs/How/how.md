# How — Aplicación de tareas
Updated: 2026-11-09

## All of it
| Topic | Decision | Choice | Why | What it implies |
|---|---|---|---|---|
| Base | Con qué se hace | Web local en .NET 10 con Blazor en el servidor | Ya uso .NET (H-01, H-03) | Tiene que estar corriendo mientras la uso |
| Base | Dónde se guardan | Archivo SQLite en la carpeta | Se puede copiar (H-02) | Copiar el archivo es el respaldo |
| Structure | Forma | Una sola pieza, en `TaskList/` | Solo la uso yo (H-09) | Una app de celular después pide separar una API |
| Structure | Código | Una carpeta por función | Simple (H-04) | Sumar algo es sumar una carpeta |
| Quality | Pruebas | Pruebas automáticas de cada criterio | Cambiar sin miedo (H-05) | Cada capacidad trae sus pruebas |
| Quality | Versiones | git, un commit por unidad terminada | Volver atrás (H-10) | Nada se sube a ningún lado |
| Delivery | Cómo la abro | Acceso directo en el escritorio | Doble clic (H-06) | Arranca y abre el navegador |
