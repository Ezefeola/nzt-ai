# Data access — what holds for every operation

The operation's own file adds to these, never replaces them. The handle is what `tech.md`'s
data library names (context, session, connection).

## Rules

1. **One handle per operation, living exactly as long as it**: injected, never held after it
   — not in a long-lived object, not captured by a background task.
2. **Never a second handle to dodge a conflict**: it hides it.
3. **The connection string lives in configuration** (`nzt-build`'s `references/secrets.md`).
4. **Nothing reaches the database inside a loop over items**:

   | In a loop | Instead |
   |---|---|
   | a query per item (N+1) | one projected query (`data-queries.md`) |
   | a save per item | stage everything, save once (`data-writes.md`) |
   | an update or delete per loaded entity | one statement by criteria (`data-bulk.md`) |

5. **No lazy loading**: what an operation needs, it asks for.
6. **What the provider decides is verified** — translation, generated SQL, the plan,
   concurrency tokens — against this project's provider and version, never argued from the
   code's shape.

## Done when

Every rule holds for the data access you wrote.
