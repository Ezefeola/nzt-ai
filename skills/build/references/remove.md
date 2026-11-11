# Remove a behavior

Produces a behavior that is **gone**, with nothing left that reads as live. The build catches
what you broke, never what you left.

## Steps — outside in

1. The entry point — screen, route, menu item, command, scene trigger.
2. The operation it triggers, and everything only it called.
3. Its registration — dependency injection, route table, scheduler, handlers.
4. Its surface text — labels, translations, messages, help.
5. Its data access — queries, mappings, indexes that existed for it.
6. The model — fields and types that served only it.
7. What fed it — jobs, imports, flags, configuration keys, permissions, secrets.
8. Its tests, fixtures and test data.

**At every step: does anything else use this?** Search by name, route, string and
configuration key — reflection and configuration do not show in a rename. Shared stays;
unsure stays, named as unresolved.

## Data is a separate decision

Deleting stored data is irreversible: the user decides it explicitly, told what is lost.
Until then the code goes and the data stays. Authorised, it goes through a generated
migration.

## Documents

- The rule comes out of `spec.md`; its slug is never reused. Criteria and stories of the
  removed behavior go too. `tech.md`, designs and `architecture.md` are updated.
- The `[remove]` marker that authorised this stays until the feature's close.
- **The criterion that proves the absence keeps its test.**
- Something outside the project depends on it → deprecate in two dated stages: what keeps
  working, until when, who is told. No date is no plan.

## Done when

No trace suggests it still works, and the report lists what you searched (names, routes,
keys) and what you deliberately left, with why.
