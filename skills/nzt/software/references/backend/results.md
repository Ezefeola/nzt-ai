# Backend results — the Result pattern

A use case never throws for what the business expects: **it returns a Result**, and every
caller — endpoint, job, test — reads the same answer. Exceptions stay for what nobody can
handle where it happened.

## The shape

1. **A base without the payload type**: success, status code, errors — for code that receives
   a Result without knowing its payload.
2. **A typed Result adding the payload**: the only thing deriving from the base; nothing
   derives from it.
3. **A private constructor and exactly two ways in**: `Success(status, payload)` and
   `Failure(status, errors)`. A success always has a payload and no errors; a failure, errors
   and no payload.
4. **No free-text description**: it drifts from the errors.

The technology's file gives the exact code: copy it, never adapt it.

## Rules

1. **Every return builds its own Result**, with status and message visible — no private
   `Rejected()` or `NotFound()`, even when three returns fail alike. A private method that
   computes is fine; one that returns a Result is not.
2. **The use case decides the status code**, never the endpoint or an adapter.
3. **No second, transport-free Result**: jobs and tests read this one.
4. **Read success first**: the payload means something only there.
5. **How it reaches HTTP is `tech.md`'s Result to HTTP axis**: read only the selected option.
6. **Never**: an exception for an expected failure, a Result turned into an exception on the
   way out, a Result fabricated before the use case ran (authentication, routing and
   unexpected exceptions are the host's), the constructor called, a mapper deciding any of
   this.

## Done when

Every rule holds for the Results you built and read.
