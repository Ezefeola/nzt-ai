# Backend architecture — what holds in every style

The style's file decides units and folders; what a file is and what it is called comes from
its own reference.

## Rules

1. **The tree is a catalogue of roles, not folders to create**: a folder exists when
   something fills it.
2. **Folder names are plurals**; the only exception is `<Operation>/`, named after its use
   case.
3. **One folder per operation**, holding only what would disappear with it: the use case,
   its interface, its validator, its DTOs.
4. **What a feature's operations share sits in `<AggregatePlural>/`**, the aggregate's one
   mapping file included (`nzt-code`'s `dtos.md`).
5. **An aggregate's children and their enums** live in `Domain/Entities/<AggregatePlural>/`;
   what several aggregates share, in `Domain/Common/`.
6. **Persistence**: the handle and the transaction boundary at the root of the persistence
   folder; one mapping file per entity in `Configurations/`; `Migrations/` only generated.
7. **A pattern not in use (`Repositories/`, `UnitOfWork/`) has no folder anywhere.**
8. **The global exception handler** sits in `Exceptions/Handlers/` of the host, with no
   exception classes of the project's own beside it (`errors.md`).
9. **Registration is written out, never discovered by scanning**: a missing one fails at
   startup, not at the first request.
   - One registration file per root folder or unit, with one public entry.
   - One private method per feature, never per operation.
10. **Only DTOs and the result type reach the endpoints.** An entity there is a skipped
    mapping.

## Done when

Every rule holds for the folders and registrations you touched.
