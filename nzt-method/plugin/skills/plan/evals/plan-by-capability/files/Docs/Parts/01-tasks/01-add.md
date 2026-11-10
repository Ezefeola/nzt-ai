# 01 · Agregar
part: 01-tasks
Status: approved · 2026-11-09

Anoto una tarea, con fecha o sin ella, para no perderla.

## Acceptance criteria
- **AC-01 · Con fecha.** (orden) Cuando anoto «pagar el alquiler» con fecha 1/12, aparece en la lista en su lugar por fecha.
- **AC-02 · Ya vencida.** (atrasada) Cuando anoto «pagar la luz» con fecha de ayer, aparece en rojo.
- **AC-03 · Vacía (bad case).** Cuando intento agregar sin texto, no se agrega nada.
- **AC-04 · Muy larga (bad case).** Cuando el texto pasa de 200 caracteres, no se puede agregar y se ve el límite.
