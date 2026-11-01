# Backend security — resource authorisation

Whenever an operation reads or changes a protected resource, a permission is defined or
changed, or unauthorised access is investigated. **Not optional**: an access requirement that
exists is enforced while its behaviour is built, with no `tech.md` flag.

## Steps

1. **Find the project's rule** for caller, resource and action — ownership, tenant, role, an
   agreed permission — and the access mechanism already there. Never invent an ownership rule
   per resource, never assume read implies update or delete. An undefined permission is a
   question for discovery; keep going on independent work meanwhile.
2. **Take authority only from the server**: authentication or the authorised execution
   context. An id in a body, URL or header is input, never authority; binding never
   overwrites the trusted context. The use case uses the project's caller abstraction, never
   the HTTP request. Jobs run with their agreed identity, not as a bypass. Being
   authenticated, knowing an id or not seeing a button proves nothing.
3. **Enforce through the existing architecture**, after validation and before exposing data or
   causing an effect: scope the query, or load what the decision needs and decide. Endpoint
   authorisation answers *who are you*, not *is this yours*. Reuse the project's
   authorisation service — a second copy of a rule drifts. No new framework, role model or
   policy.
   - Scope **lists, counts, exports and related resources**, not only single reads.
   - Check that parent and child ids belong to the permitted relationship.
   - Keep a write's affected set in scope; where access state can change between check and
     write, use the project's conditional write or concurrency strategy.
4. **Reject by the project's contract** — forbid or conceal existence as agreed — as a Result
   with the use case's status. A rejection changes no data and triggers no effect.
5. **Verify with real ids**: an allowed caller and one outside the scope (cross-user,
   cross-tenant), each action that differs, lists and relationships that changed, on
   isolated test data; the rejected call left nothing behind. Reading code is not an executed
   test. Application circuits are `nzt-verify`'s. In a read-only review, report and change
   nothing.

## Done when

The rule came from the project and covers resource and action, every protected path is scoped
before exposure, and an allowed and a denied case have executed evidence or a stated limit.
