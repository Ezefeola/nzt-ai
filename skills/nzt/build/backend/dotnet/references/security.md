# Resource authorisation

This applies whenever an operation reads or changes a protected resource, whenever a permission
is defined or changed, and whenever unauthorised access is being investigated. **It is not an
optional methodology like TDD**: an access requirement that exists is enforced while that
behaviour is implemented, with no flag in the stack asking for it.

## The rule comes from the project, not from here

Find the project's rule for caller, resource and action: ownership, tenant membership, role, or
whatever permission was agreed. Read the requirements and the access mechanism that already
exist.

**Do not invent an ownership restriction for every resource**, and **do not assume read implies
update or delete**. A permission the project never defined is a question for analysis — ask it
and keep going on the independent work meanwhile.

## The caller's authority is server-trusted

- Identity and scope come from **server authentication or the authorised execution context**. A
  user id or tenant id arriving in a body, a URL or a header is **input, not authority**; a
  requested scope is validated against the trusted context, and model binding never overwrites
  it.
- Use the project's existing caller abstraction. **The use case does not read `HttpContext`.**
- **Jobs and other entry points are not an implicit bypass**: they run with their agreed
  execution identity and permissions.
- **Being authenticated, knowing a resource id, or not seeing the button are not proof of
  access.**

## Enforce through the architecture that is there

Keep the endpoint convention and the persistence strategy of the project. **`[Authorize]` on the
endpoint does not establish permission over a particular resource** — it answers *who are you*,
not *is this yours*. The access decision runs through the adopted mechanism, invoked by the use
case or its existing dependencies, while endpoints keep binding, calling and returning. **No new
framework, role model or named policy is introduced to satisfy this skill.**

**After input validation and before exposing data or causing an effect**: constrain the query to
the allowed scope, or load what the decision needs and decide explicitly. Reuse the project's
authorisation service — **a second implementation of the same rule, scattered across operations,
is how the two drift apart.**

- **Scope lists, counts, exports and related resources**, not only single-record reads.
- **Check that parent and child ids belong to the permitted relationship.** A tenant filter is
  enough only when the tenant *is* the operation's access rule.
- **For writes, keep the affected set inside the authorised scope.** Where access-relevant state
  can change between the check and the write, use the project's conditional write or concurrency
  strategy. **A previous read does not protect a later write**, and a manual transaction is not
  added by default to pretend it does.

## Rejection

- **Preserve the project's failure contract**, including whether it forbids or conceals
  existence. Nothing leaks protected data or the existence of a resource against that contract.
- An application failure is the agreed `Result` with the status the use case chooses; host
  authentication failures keep the host's handling.
- **A rejection modifies no data and triggers no external effect.**

## Verification

Cover **an allowed caller and a caller outside the permitted scope, with real resource ids** —
including the cross-user or cross-tenant attempt — and confirm both the intended result and that
the rejected call left nothing behind.

- **Where permissions differ by action, verify the distinction.** One successful read proves one
  permission.
- Include the list and relationship paths when they changed.
- Use isolated, authorised test data.
- **Reading the code is not an executed access test.** Record what was expected, what was
  observed and what could not be executed.

When the unit also plans and runs application circuits, that is application testing with its own
documents (`nzt-verify`) — do not duplicate them here. **In a read-only review, report the
findings and change neither authorisation nor data.**

## Closing checklist

- [ ] The permission rule came from the project and covers resource **and** action.
- [ ] Caller authority is server-trusted; nothing was taken from client input.
- [ ] Every protected read and effect enforces access through the adopted mechanism, before
      anything is exposed.
- [ ] Lists, counts, exports, relationships and writes are scoped, not just single reads.
- [ ] Failure preserves the contract and leaves no effect behind.
- [ ] An allowed case and a denied case have executed evidence, or the limit is stated.
- [ ] No security redesign or permission model was introduced along the way.
