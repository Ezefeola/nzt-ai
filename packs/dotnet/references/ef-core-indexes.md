# EF Core indexes

Builds on `../nzt-backend/references/data-indexes.md` — read it first.

## Rules

1. **EF indexes foreign key columns by convention**: never declare a second one.
2. **Test uniqueness with two independent contexts on the real relational provider**, never
   the in-memory one.

## Done when

Every rule holds for the indexes you declared.
