# EF Core indexes

Builds on `../nzt-backend/references/data-indexes.md` — read it first.

## Rules

1. Declared in the entity's `IEntityTypeConfiguration<T>`, reaching the database through a
   generated migration.
2. **EF indexes foreign key columns by convention**: they already have one.
3. The pre-check is `AnyAsync` before writing; the race reaches `exceptions.md`.
4. **Verify uniqueness with two independent contexts on the real relational provider** — never
   the in-memory one.

## Done when

Each index is in its entity's configuration, and uniqueness was verified with two contexts on
the real provider or reported pending.
