# Resource authorisation on .NET

**Read `../nzt-build/references/backend-security.md` first.** It holds the whole practice:
where the rule comes from, trusted authority, enforcement, rejection and verification. This
file holds only the .NET names.

- **The use case does not read `HttpContext`.** The caller arrives through the project's
  caller abstraction, injected.
- **`[Authorize]` on the endpoint does not establish permission over a particular resource**
  — it answers *who are you*, not *is this yours*. **No new framework, role model or named
  policy is introduced to satisfy this skill.**
- An application failure is the agreed `Result` with the status the use case chooses.
