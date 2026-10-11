# EF Core indexes

**Read `../nzt-build/references/data-indexes.md` first.** It holds which columns earn an index,
the order in a composite, the unique index with its pre-check and matching scope, how to verify
the race, filtered indexes and what an index costs. This file holds only what is EF Core.

An index is **declared in the entity configuration file** (`IEntityTypeConfiguration<T>`) and
reaches the database **through a generated migration**.

- **EF indexes FK columns by convention**: a `Join` or a foreign key is **already** indexed.
- The pre-check is **the `AnyAsync` pre-check before writing**. The race's exception reaches
  `nzt-build-backend-dotnet-exceptions`.
- **Verify it with two independent contexts on the real relational provider.** **The in-memory
  provider cannot prove relational constraint behaviour.**

## Closing checklist

- [ ] Concurrency was verified with two contexts on the real provider, or the verification is
      reported as pending.
- [ ] It was declared in the entity configuration file and reached the database through a
      generated migration.
