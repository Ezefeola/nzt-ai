# nzt-method (nombre provisorio)

Exploración en la rama `metodo-generico`, sacada de `pendientes-post-v5` el 2026-11-08.
Puede terminar descartada: nada de esto está decidido ni toca `nzt-software/`.

## Qué buscamos

Un método NZT **genérico**: la forma de trabajar (entender, proponer, ejecutar, verificar,
registrar) sin palabras atadas al software. Tiene que servir para cualquier producto: un
software, un juego, un documento, un curso.

## Restricciones

- **Vive en el monorepo `nzt-ai`**, como una carpeta más en la raíz, al lado de
  `nzt-software/`.
- **Se publica por su cuenta.** Cada producto tiene su pipeline, y ese pipeline corre solo si
  se tocó su carpeta (hoy `nzt-software-release.yml` filtra por `nzt-software/**`).
- **Se trabaja sin NZT**, solo con Claude: sin `Plan/state.json` ni el flujo de unidades.

## Abierto

- El nombre: `nzt`, `nzt-method` u otro.
- Qué relación tiene con `nzt-software`: si lo reemplaza, si `nzt-software` se apoya en él, o
  si conviven.
