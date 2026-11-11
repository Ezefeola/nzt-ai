# Backend errors — one global handler

**An exception that escapes a use case ends in one global handler.** Nothing else catches to
translate.

## Expected failures never get here

Each is checked **before** writing (`use-cases.md`, step 3) and returned as a failed Result
with the entity's message:

| The rule | Checked before writing with |
|---|---|
| no other one of these | an existence query on the unique index's scope |
| nobody changed it since it was read | the version the client sent against the stored one |
| nothing still points at it | an existence query on the dependants before deleting |

1. **The database constraint stays.**
2. **What reaches the handler is what no check prevents**: two requests passing the same
   check, the database down, a bug.
3. **Nothing catches a database error to build a Result**: no catch around a save, no
   filtered catch, no error classifier, no exception types written to be caught in one place.

## The handler

1. **One handler, one dispatch over the exception type**, most specific first. No handler per
   exception, no second layer catching.
2. **By type only**: never provider error numbers, SQLSTATE, constraint names or message
   text, and no package that classifies provider errors unless `tech.md` adopted one. What
   type cannot tell apart gets its broader kind's message.
3. **Same shape as a failed Result**, and **the same status as the rule's pre-check** (the
   version check's `412` is the race's `412`).
4. **Nothing internal reaches a user** — no stack trace, SQL, table, constraint or exception
   message — except a detail field in development.
5. **The messages are the project's agreed wording** (spec or design), in the product's
   language; the base ones are placeholders.
6. **Logged once, whole**: by the handler or by the framework, never both.
7. **It lives with the host's HTTP translation**, never under `Persistence/`.

## Done when

Every rule holds, and each exception is logged once.
