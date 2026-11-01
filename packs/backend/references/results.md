# Backend results — the Result pattern

A use case never throws for what the business expects: **it returns a Result**, and every
caller — endpoint, job, test — reads the same answer. Exceptions stay for what nobody can
handle where it happened.

## The shape

- A **base** without the payload type: success, status code, errors. It exists for code that
  receives a Result without knowing its payload — the HTTP layer.
- A **typed Result** adding the payload — the only thing deriving from the base, and nothing
  derives from it.
- **A private constructor and exactly two ways in**: `Success(status, payload)` and
  `Failure(status, errors)`. A failure with a payload or a success with errors cannot be
  built. `Success` always takes a payload; `Failure` none.
- **No free-text description**: a second summary of the errors drifts from them.

A technology pack gives the exact code: copy it, never adapt it.

## Rules

1. **Every return builds its own Result** — no private `Rejected()` or `NotFound()`, even
   when three returns fail alike. The reader at a return needs the status and the message;
   the message already exists once on the entity, and returns that agree today diverge
   tomorrow. A private method that computes is fine; one that returns a Result is not.
2. **The status code travels inside the Result and the use case decides it** — never the
   endpoint, never an adapter. No second transport-free Result: jobs and tests read this one.
3. **Read success first**: the payload means something only there.
4. **How it reaches HTTP is `tech.md`'s Result to HTTP axis**, and its options answer
   differently: read only the selected one.
5. **Never**: an exception for an expected failure or a Result turned into one on the way
   out, a Result fabricated for a failure before the use case ran (authentication, routing
   and unexpected exceptions are the host's), the constructor called, a mapper deciding any
   of this.

## Done when

Every use case returns a Result built at its return, the status is set only in the use case,
and the payload is read only after success.
