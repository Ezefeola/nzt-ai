# Resource authorisation on .NET

Builds on `../nzt-backend/references/security.md` — read it first; it holds the whole practice.

- The caller arrives through the project's injected caller abstraction — the use case never reads
  `HttpContext`.
- `[Authorize]` answers *who are you*, not *is this yours*; no new policy or role model is added
  for this.
- A rejection is the agreed `Result` with the use case's status.

## Done when

No use case reads `HttpContext`, and resource access is decided in the use case.
