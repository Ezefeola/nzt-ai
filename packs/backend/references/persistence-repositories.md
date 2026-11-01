# Backend persistence — repositories and unit of work

**Every database access goes through a repository**, and repositories are reached **through
the unit of work**, never injected on their own.

## Repositories

1. **One per aggregate root, with its own interface** — never per table, never generic (a
   generic one over an ORM wraps a repository and ends in a `GetAll` every caller filters).
2. **The interface declares only what is used**, named after what the domain asks
   (`GetById`, `GetPendingForCustomer`) — never a method taking an arbitrary filter. Add and
   remove only stage.
3. **A method executes its query and returns what it found**, never an unexecuted query: a
   half-built query outside means nobody can tell what hits the database.
4. **Every read is a method here**, listings and projections to DTOs included. The
   repository grows with the screens — the price of one door per aggregate.
5. **A repository never** saves (two repositories would be two commits), decides, validates,
   returns a Result, reaches another repository, maps another aggregate's DTOs or exposes
   its handle.

## The unit of work

1. **Repositories are its properties**, named after the aggregate in plural, beside one save.
   It gives every repository the same handle — that is what shares the transaction — and
   lives as long as the handle.
2. **The use case injects the unit of work and nothing else from persistence**, and touches
   only the repositories its operation needs.
3. **The save lives only here**, called once at the end of the use case: everything lands or
   nothing does.
4. **No `Commit` or `Rollback`**: when two writes cannot be one save, one method begins the
   transaction and returns the handle `data-writes.md` defines, which the use case commits
   and disposes. Declared only when a use case needs it.
5. **No logic and no translated failures**: the save catches nothing. What it could reject is
   checked before, through a repository method returning a boolean; the rest reaches the
   global handler (`errors.md`).

## Done when

One repository per root declaring only what is used, no query leaving a repository, and one
save per use case through the unit of work.
