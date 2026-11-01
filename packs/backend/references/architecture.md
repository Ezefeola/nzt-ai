# Backend architecture — what holds in every style

Read before the style's file (`architecture-vertical-slice.md`, `architecture-clean.md`,
`architecture-hexagonal.md`). The style decides units and folders, and nothing else does; what a file
*is* and what it is called comes from its own reference.

## Rules

1. **The tree is a catalogue of roles, not folders to create.** A folder exists when
   something fills it — an empty one invites something unrelated in.
2. **Folder names are plurals**, the form that never collides with the type beside it. The
   only exception is `<Operation>/`, named after its use case.
3. **One folder per operation**, holding only what would disappear with it: the use case, its
   interface, its validator, its DTOs. What the feature's operations share sits one level up
   in `<AggregatePlural>/`: **the aggregate's one mapping file**, never a copy per operation.
4. **An aggregate's children and their enums** live in its folder under
   `Domain/Entities/<AggregatePlural>/`; what several aggregates share, in `Domain/Common/`.
5. **Persistence**: the handle and the transaction boundary sit at the root of the
   persistence folder (a folder named after the boundary would collide with its class); one
   mapping file per entity in `Configurations/`; `Migrations/` only generated. A pattern not
   in use (`Repositories/`, `UnitOfWork/`) has no folder anywhere.
6. **The global exception handler** sits in `Exceptions/Handlers/` of the host, with no
   exception classes of the project's own beside it (`errors.md`).
7. **Registration is written out, never discovered by scanning**: a missing one fails at
   startup, not at the first request. One registration file per root folder or unit, one
   public entry each, one private method per feature — never per operation.
8. **Nothing but DTOs and the result type reaches the endpoints.** An entity named there is a
   skipped mapping.

## Done when

No empty or singular folder but `<Operation>/`, no mapping copied into an operation, no
unused pattern with a folder, and every registration explicit.
