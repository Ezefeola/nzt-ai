# Backend use cases — one operation of the system

One operation, written once and reachable from anywhere — an endpoint, a job, a test.
Everything it decides, its status code included, is decided here.

## Steps

1. **Shape it**: named after the operation and nothing else (`CreateOrder` — no `UseCase`,
   `Handler`, `Service` or `Manager`; a name needing *and* is two use cases). One public
   entry, async with the cancellation signal where I/O is async. Its interface in its own
   file is what gets registered and injected. Its own DTOs in and out; **always a Result**
   (`results.md`).
2. **Validate first** with its validator, before any query, write or external call. A
   failure is a failed Result — never an exception or framework state.
3. **Check what needs the database after validation, before writing.** Uniqueness above all:
   - an existence query that stops at the first match, through the selected persistence
     (direct, or a repository method returning a boolean) — never loading or counting;
   - the predicate matches the constraint: scope or tenant, normalisation, nulls, deleted
     rows; **on an update it excludes the record itself**; query filters do not hide rows
     the constraint covers;
   - the database constraint stays, and the race's loser reaches the global handler
     (`errors.md`), never a catch here. Same for a version compared before saving and
     dependants counted before a delete.
4. **Decide, write, return** — each Result built at its own return with status and message
   visible, never behind a private `NotFound()` helper.

## Rules

1. **Messages**: a failure naming a business concept uses the message on that entity's
   `Errors`; the use case owns only failures naming none (a dependency down, a missing
   permission).
2. **`try/catch` only in two cases**, each with a one-line comment naming it:

   | Case | The catch |
   |---|---|
   | a side effect outside the transaction (a file stored, a message sent) must be undone when a later step fails | compensates, then rethrows |
   | an external SDK signals an outcome the spec answers **only** through an exception | catches that documented type, returns the failed Result |

   Never around a save or query, never log-and-rethrow, never swallow.
3. **The status code is chosen here**, with no fixed table, but **consistent with the
   project**: if an equivalent failure answers `404` elsewhere, this one does too.
4. **Never**: build HTTP responses or read the request (the endpoint), throw for an expected
   failure, reach persistence its own way, map by hand (the aggregate's mapping file).
   The caller's identity arrives as trusted server data, never as what the client asserted
   (`security.md`).

## Done when

Validation runs first, uniqueness is checked and excludes self on update, every catch is one
of the two cases, and every return builds its own Result.
