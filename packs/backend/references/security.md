# Backend security — resource authorisation

An access requirement that exists is enforced while its behaviour is built, with no
`tech.md` flag.

## Steps

1. **Find the project's rule** for caller, resource and action — ownership, tenant, role, an
   agreed permission — and the access mechanism already there.
   - Never invent an ownership rule, never assume read implies update or delete.
   - An undefined permission is a question for discovery; keep going on independent work.
2. **Take authority only from the server**: authentication or the authorised execution
   context.
   - An id in a body, URL or header is input, never authority; binding never overwrites the
     trusted context.
   - The use case uses the project's caller abstraction, never the HTTP request.
   - A job runs with its agreed identity, not as a bypass.
   - Being authenticated, knowing an id or not seeing a button proves nothing.
3. **Enforce through the existing architecture**, after validation and before exposing data
   or causing an effect: scope the query, or load what the decision needs and decide.
   - Endpoint authorisation answers *who are you*, not *is this yours*.
   - Reuse the project's authorisation service; no new framework, role model or policy.
   - Scope lists, counts, exports and related resources, not only single reads.
   - Check that parent and child ids belong to the permitted relationship.
   - Keep a write's affected set in scope; where access can change between check and write,
     use the project's conditional write or concurrency strategy.
4. **Reject by the project's contract** — forbid or conceal existence as agreed — as a Result
   with the use case's status. A rejection changes no data and triggers no effect.
5. **Test with real ids** on isolated data: an allowed caller and one outside the scope
   (cross-user, cross-tenant), each action that differs, the lists and relationships that
   changed; the rejected call left nothing behind. Application circuits are `nzt-verify`'s.
6. **In a read-only review**, report and change nothing.

## Done when

Every step ran, and an allowed and a denied case have executed evidence or a stated limit.
