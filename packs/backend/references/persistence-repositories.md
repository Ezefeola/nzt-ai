# Backend persistence — repositories and unit of work

**Every database access goes through a repository**, and repositories are reached **through
the unit of work**, never injected on their own.

## Repositories

1. **One per aggregate root, with its own interface**: never per table, never generic (a
   generic one ends in a `GetAll` every caller filters).
2. **The interface declares only what is used**, named after what the domain asks
   (`GetById`, `GetPendingForCustomer`), never a method taking an arbitrary filter.
3. **Add and remove only stage.**
4. **A method executes its query and returns what it found**, never an unexecuted query.
5. **Every read is a method here**, listings and projections to DTOs included.
6. **A repository never** saves, decides, validates, returns a Result, reaches another
   repository, maps another aggregate's DTOs or exposes its handle.

## The unit of work

1. **Repositories are its properties**, named after the aggregate in plural, beside one save.
2. **It gives every repository the same handle**, which shares the transaction, and lives as
   long as the handle.
3. **The use case injects the unit of work and nothing else from persistence**, and touches
   only the repositories its operation needs.
4. **The save lives only here**, called once at the end of the use case.
5. **No `Commit` or `Rollback`**: when two writes cannot be one save, one method begins the
   transaction and returns the handle `data-writes.md` defines; the use case commits and
   disposes it. Declared only when a use case needs it.
6. **No logic and no translated failures**: the save catches nothing (`errors.md`). A
   pre-check is a repository method returning a boolean.

## Done when

Every rule holds for the repositories and use cases you wrote.
