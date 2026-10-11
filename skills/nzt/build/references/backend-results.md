# Backend results — the Result pattern

## Contents
- The shape
- Why it is shaped like that
- Every return builds its own Result
- The status code travels inside the Result
- Reading one
- How it reaches the transport is not decided here
- What never happens
- Closing checklist

A use case does not throw for something the business expects. **It returns a Result**, and
every caller — an endpoint, a job, a test — reads the same answer in the same shape.
Exceptions stay for the exceptional: what nobody planned for and nobody can handle where it
happened.

## The shape

- A **base** that does not know the payload's type: whether it succeeded, its status code and
  its list of errors.
- A **typed Result** that adds the payload, and is the only thing deriving from the base.
- **Exactly two ways in**: `Success`, with a status and a payload, and `Failure`, with a
  status and its errors.

Where the stack has an area reference, the exact code is written there and copied, **not
used as a starting point to adapt**.

## Why it is shaped like that

- **The base carries what does not depend on the payload**, for the code that receives a
  Result without knowing its payload type — the HTTP layer. Without it, that code has no type
  to ask and the only way left to read the status is to inspect the object at runtime.
- **The hierarchy is closed**: the typed Result is the only thing deriving from the base, and
  nothing derives from it.
- **The constructor is private and there are exactly two ways in.** A Result that can only
  be built through `Success` or `Failure` cannot be a failure carrying a payload or a success
  carrying errors: **the impossible states stop being something to remember and become
  something that does not compile** — or, in a language without that check, something no
  code path can build.
- **`Success` always takes a payload.** A success with nothing to return is a use case whose
  response type should say so.
- **`Failure` takes none**, which is why the payload is optional: on that path there is
  nothing to carry, and the signature is what says it.
- **There is no free-text description.** What a failure has to say, it says in its errors. A
  second field summarising the same failure drifts from it the first time somebody fills one
  and forgets the other — and then the API reports two versions of what happened.

## Every return builds its own Result

**`Failure` is called where the return happens, never behind a private helper.** A
`Rejected()`, a `NotFound()` or any private method whose job is to hand back a Result is
forbidden — including when three returns produce exactly the same failure.

- **What the reader needs at a return is the status and the message**, and the helper hides
  exactly those two behind a name. Reading the operation turns into jumping to the bottom of
  the file and back, once per branch.
- **It saves nothing**: the call it replaces is already one expression.
- **The repetition is not duplication.** The message exists once, on the entity's errors.
  What repeats is the decision to answer that way — and those are independent decisions that
  agree today. Merging them into one helper is what makes it expensive the day one of them
  changes: the sign-in that answers differently on the third attempt is that day.
- One helper becomes three, each named by whoever wrote it, and the operation ends up with a
  private vocabulary no other operation shares.

**This is about the Result, not about private methods.** A private method that computes
something is fine; one that returns a Result is not.

## The status code travels inside the Result

The coupling to the HTTP status code is deliberate and agreed. **Do not add a second
transport-independent Result**: a job or a test reads this same object without an HTTP
request and without building a response.

**The use case decides it; the endpoint never does.** That is the rule the whole HTTP layer
leans on — the same operation answers the same way from HTTP, from a job and from a test, and
the same business rule cannot be a `400` in one endpoint and a `409` in the next. It is also
why no endpoint sets a status by hand: there is nothing left for it to decide.

## Reading one

**Success first, always.** The payload is meaningful only on the success branch, and reading
it before checking is reading something that may not be there.

## How it reaches the transport is not decided here

The **Result to HTTP** axis of the stack names what does it, and **the options do not produce
the same response**. Read the guidance for the one this project selected; the other is not
your business.

## What never happens

- **No exception thrown to signal an expected failure**, and no Result swallowed into an
  exception on the way out.
- **No adapter reassigns a use case's status code.** Authentication, routing and
  unexpected-exception responses stay the host's, and **a Result is never fabricated for a
  failure that happened before the use case ran**.
- **No Result built through the constructor** — it is private for a reason.
- **No mapper deciding any of this**: a mapper transforms data.

## Closing checklist

- [ ] Every use case returns a Result, and expected failures are not exceptions.
- [ ] Closed base, typed Result, private constructors, `Success` and `Failure`, nothing added.
- [ ] `Failure` never receives a payload; `Success` always does.
- [ ] Every Result is built at the return that produces it, and no private method returns
      one.
- [ ] The status code is set in the use case and nowhere else.
- [ ] The payload is read only after success was checked.
