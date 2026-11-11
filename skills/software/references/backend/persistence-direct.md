# Backend persistence — direct

**No repositories and no unit of work, anywhere.** The handle is what the data library gives
you to read and write (`data-access.md`).

## Rules

1. **Every use case that touches data receives the concrete handle** as a dependency.
2. **No interface over the handle** — one member per entity is a repository with extra steps
   — except the one a layered architecture declares (`architecture-clean.md`,
   `architecture-hexagonal.md`).
3. **Nothing wraps it**: no repository or unit of work "just for this aggregate", no query
   helper, no function attached to the handle from outside. Changing this is a `tech.md`
   decision.
4. **Neither the handle nor an unexecuted query leaves the use case**: a DTO comes out.
5. **The use case is the unit of work**: it saves once, at the end (`data-writes.md`).
6. **No `try/catch` around persistence**, the save included (`errors.md`). Cleanup uses the
   language's disposal pattern.
7. **Queries are written out in the use case**, in order. The same query in two use cases is
   written twice: extracting it is how the helper of rule 3 is born.

## Done when

Every rule holds for the use cases you wrote.
