# Backend use cases — one operation of the system

## Contents
- The shape
- Validate before you touch anything
- What the validator cannot answer
- `try/catch` is the exception, and it says why
- The status code is decided here
- What a use case never does
- Closing checklist

A use case is **one operation, written once and reachable from anywhere**: an endpoint, a
job, a test. Everything the operation decides — including its status code — is decided here.

## The shape

- **The name is the operation and nothing else**: `CreateOrder`, `CancelOrder`. **No
  `UseCase` suffix**, and no `Handler`, `Service` or `Manager`. **If the name needs an *and*,
  there are two use cases.**
- **One public entry.** A second public entry point is a second use case sharing a type.
- **It always returns a Result** (`backend-results.md`), and its input and output are its own
  DTOs. Where the language has asynchronous I/O, the entry is asynchronous and takes the
  cancellation signal.
- **Interface and implementation are two files**, where the language has interfaces. The
  interface is what gets registered and what the endpoint asks for.

Where those files live is the architecture reference's business, never this one's.

## Validate before you touch anything

Call the operation's validator first in the entry — before queries, writes or external
calls. **A failed validation is a failed Result like any other**: never an exception, never
framework state, never something the endpoint has to interpret.

For a failure the use case decides itself: if it names a business concept, its message was
already written on that concept's entity. What the use case owns is what names none — a
dependency that did not answer, a permission the caller lacks.

## What the validator cannot answer

**A rule that needs the database is not the validator's job**: it validates the shape of the
input, never the state of the world.

Uniqueness is the case that always comes up. *There is no other one of these* is checked **in
the use case, after validation and before anything is written**, and a value already taken
fails right there with the message that lives on its entity.

- **The check is mandatory**, as an existence query that stops at the first match, with the
  cancellation signal — directly under direct persistence, or as a repository method
  returning a boolean when repositories were selected. **Never load the entity or count all
  matches to find out whether one exists.**
- The predicate matches the rule as the constraint defines it: its scope or tenant,
  normalisation, null semantics, active or deleted rows. **On an update it excludes the
  record being updated.** Account for query filters, so they do not hide rows the unique
  constraint still covers.
- **Two requests can both pass the check**, so the database constraint stays. **The loser is
  not caught here**: its exception reaches the global handler (`backend-errors.md`), which
  answers with a clear message. The same holds for a version compared before saving and for
  dependants counted before a delete.

## `try/catch` is the exception, and it says why

**Expected failures are checks that return a Result, never caught exceptions.** A
`try/catch` in a use case is allowed in two cases only:

| Case | What the catch does |
|---|---|
| The operation already caused a side effect **outside its database transaction** — a file stored, a message sent — and has to undo it if a later step fails | Compensates, then rethrows — the failure still reaches the global handler |
| An **external dependency** signals an outcome the spec gives a business response to **only through an exception** — a payment declined by a provider SDK | Catches that one documented exception type and returns the failed Result |

- **Each catch carries a one-line comment naming its case.** A catch that fits neither is
  removed.
- **Never around the save or a query** to turn a database error into a Result — no
  filtered catch, no provider-error classifier.
- **Never to log and rethrow, and never to swallow.** The global handler logs once.

## The status code is decided here

The status code inside the Result is an accepted dependency: jobs and tests consume the same
Result with no HTTP request in sight. Do not invent a transport-independent variant.

**There is no fixed table.** The operation knows what happened and picks accordingly — what
was not found, what conflicted, what the caller may not do.

What the choice is not free from is the rest of the project: **if an equivalent failure
already answers `404` somewhere, this one answers `404` too.** The code is part of the
contract, and two operations disagreeing about the same kind of failure is a bug no compiler
will catch.

## What a use case never does

| It does not | Who does |
|---|---|
| Build HTTP responses — framework response types, error bodies, headers | The endpoint |
| Throw for an expected failure | Nobody: it returns a failed Result |
| Reach persistence its own way | The persistence axis of the stack |
| Map entity to DTO by hand | The aggregate's mapping file |
| Catch a database error to build a Result | Nobody: a check before writing, and the global handler for the race |
| Read the HTTP request | Who is calling arrives as an injected dependency |

**A caller's identity is never taken from what the client asserted.** It arrives as trusted
server-supplied data, and a protected resource has its own guidance (`backend-security.md`).

**And it does not wrap its own returns.** The Result is built at each return — status and
message visible right there — never behind a private `Rejected()` or `NotFound()`, however
many branches end the same way. The reason is in `backend-results.md`, and it is the same
one: at a return, the status and the message are what the reader came for.

## Closing checklist

- [ ] One type per operation, named after the operation, **with no suffix**, its interface
      in its own file, and a single public entry.
- [ ] The interface is what is registered and what the endpoint injects.
- [ ] Returns a Result, always.
- [ ] Validation runs before any query, write or external call, and its failure is a failed
      Result.
- [ ] Uniqueness is checked with an existence query through the selected persistence, outside
      the validator, with the cancellation signal, and the predicate excludes self on updates.
- [ ] The database constraint stays, and its race is left to the global handler — nothing
      catches it here.
- [ ] Any `try/catch` is one of the two allowed cases, with its comment; none wraps the save
      or a query, logs and rethrows, or swallows.
- [ ] The status code is set here and matches how the project already answers that kind of
      failure.
- [ ] Every Result built at its own return, with no private helper returning one.
- [ ] No HTTP request, no framework response types, no hand-written mapping, no exceptions for
      expected failures.
