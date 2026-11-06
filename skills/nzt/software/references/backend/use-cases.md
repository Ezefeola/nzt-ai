# Backend use cases — one operation of the system

One operation, written once and reachable from an endpoint, a job or a test. Everything it
decides, its status code included, is decided here.

## Steps

1. **Shape it**:
   - Named after the operation and nothing else (`CreateOrder`; no `UseCase`, `Handler`,
     `Service` or `Manager`). A name needing *and* is two use cases.
   - One public entry, async where I/O is.
   - Its interface in its own file is what gets registered and injected.
   - Its own DTOs in and out; always a Result (`results.md`).
2. **Validate first** with its validator, before any query, write or external call. A failure
   is a failed Result, never an exception or framework state.
3. **Check what needs the database**, after validation and before writing — uniqueness, the
   version, dependants (`errors.md`):
   - an existence query that stops at the first match, through the selected persistence,
     never loading or counting;
   - its predicate matches the constraint: scope or tenant, normalisation, nulls, deleted
     rows; query filters do not hide rows the constraint covers;
   - **on an update it excludes the record itself**.
4. **Decide, write, return.**

## Rules

1. **A failure naming a business concept uses the message on that entity's `Errors`**; the
   use case owns only failures naming none (a dependency down, a missing permission).
2. **`try/catch` only in two cases**, each with a one-line comment naming it:

   | Case | The catch |
   |---|---|
   | a side effect outside the transaction (a file stored, a message sent) must be undone when a later step fails | compensates, then rethrows |
   | an external SDK signals an outcome the spec answers **only** through an exception | catches that documented type, returns the failed Result |

   Never around a save or query, never log-and-rethrow, never swallow.
3. **The status code is chosen here, with no fixed table, consistent with the project**: an
   equivalent failure that answers `404` elsewhere answers `404` here.
4. **The caller's identity arrives as trusted server data** (`security.md`).
5. **Never**: build HTTP responses, read the request, throw for an expected failure, reach
   persistence its own way, or map by hand.

## Done when

Every step ran in order and every rule holds for the use cases you wrote.
