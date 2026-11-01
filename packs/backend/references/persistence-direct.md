# Backend persistence — direct

**No repositories and no unit of work, anywhere** — the name of a decision, not its absence.
The handle is what the data library gives you to read and write (`data-access.md` says how);
this file says where it goes and what is never built around it.

## Rules

1. **Every use case that touches data receives the concrete handle** as a dependency held for
   its life. No interface over it — one member per entity is a repository with extra steps —
   except the one a layered architecture declares (`architecture-clean.md`,
   `-hexagonal.md`).
2. **Nothing wraps it**: no repository or unit of work "just for this aggregate", no query
   helper, no function attached to the handle from outside. Half the project wrapped is the
   inconsistency this axis prevents; changing it is a `tech.md` decision.
3. **Neither the handle nor an unexecuted query leaves the use case**: built, executed and
   materialised inside it; a DTO comes out.
4. **The use case is the unit of work**: everything it changes is saved once, at the end
   (`data-writes.md`).
5. **No `try/catch` around persistence, the save included**, and no classifier of provider
   errors. What the save could reject is checked before it; the rest reaches the global
   handler (`errors.md`). Cleanup uses the language's disposal pattern.
6. **Queries are written out in the use case**, in order. The same query in two use cases is
   written twice: extracting it is how the helper of rule 2 is born.

## Done when

No repository, unit of work, query helper or error classifier exists, nothing catches around
persistence, and each use case saves once.
