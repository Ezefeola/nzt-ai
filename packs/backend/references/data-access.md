# Data access — what holds for every operation

Read before any data row: the operation's own file adds to these, never replaces them. The
handle is what `tech.md`'s data library names (context, session, connection).

## Rules

1. **One handle per operation, living exactly as long as it.** Created per operation,
   injected, never held after it — not in a long-lived object, not captured by a background
   task. A second handle opened to dodge a conflict hides it.
2. **The connection string lives in configuration**, never in code or a committed file
   (`nzt-build`'s `references/secrets.md`).
3. **Nothing reaches the database inside a loop over items** — the classic listing that
   becomes a timeout in production:

   | In a loop | Instead |
   |---|---|
   | a query per item (N+1) | one projected query (`data-queries.md`) |
   | a save per item | stage everything, save once (`data-writes.md`) |
   | an update or delete per loaded entity | one statement by criteria (`data-bulk.md`) |

4. **No lazy loading** — N+1 with no visible call. What an operation needs, it asks for.
5. **Every call is async where the language allows, and passes the cancellation signal.**
6. **What the provider decides is verified**: translation, generated SQL, the plan, concurrency
   tokens — against this project's provider and version, never argued from the code's shape.

## Done when

One handle per operation, no database call or save in a loop, no lazy loading, and every
provider claim checked against the project.
