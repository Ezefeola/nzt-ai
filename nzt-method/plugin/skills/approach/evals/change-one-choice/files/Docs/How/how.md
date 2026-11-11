# How — Lista de tareas
Updated: 2026-11-09

## All of it
| Topic | Decision | Choice | Why | What it implies |
|---|---|---|---|---|
| Base | Dónde corre | Una página web en mi compu | La uso solo yo (H-01) | No se abre desde el celular |
| Base | Hecha con | .NET 10 (ASP.NET Core) | Es lo que uso en el trabajo (H-02) | Se arranca con `dotnet run` |
| Base | Dónde se guardan las tareas | SQLite, archivo `tareas.db` | Simple, sin servidor (H-03) | Copiar el archivo es el respaldo |
| Base | Mails | Mi cuenta de Gmail | Ya la tengo (H-04) | Hace falta una contraseña de aplicación |
| Structure | Organización del código | Una carpeta por funcionalidad | Como en el trabajo (H-05) | Algo de código se repite entre carpetas |
| Quality | Pruebas | xUnit para las reglas, más prueba a mano en el navegador | (H-06) | Cada regla lleva su prueba |
| Dependencies | Librerías | Microsoft.Data.Sqlite y MailKit | Nada más sin preguntar (H-08) | — |
| Delivery | Cómo la uso | A mano con `dotnet run` | No hace falta publicarla (H-09) | Apagada si la compu está apagada |

## Conventions
- Código en inglés, lo que ve el usuario en español (H-07).
