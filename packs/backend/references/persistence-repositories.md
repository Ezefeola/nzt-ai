# Backend persistence — repositories and unit of work

## Contents
- One per aggregate root, with its own interface
- It returns results, never an unexecuted query
- Reads go through it too, projections included
- What a repository does not do
- The unit of work is the single door
- It is the only thing that saves
- What comes with the single door
- Closing checklist

The persistence axis says repositories with a unit of work, so **every access to the database
goes through a repository**, and the repositories are reached **through the unit of work** —
never injected on their own.

## One per aggregate root, with its own interface

An `OrderRepository` and its interface, **one pair per aggregate root** — not per table, and
**never a generic repository over every entity**. A generic repository over an ORM wraps
something that is already a repository, and **it always ends in a `GetAll` that every caller
filters afterwards.**

The interface declares **only the methods this project uses**, each named after what the
domain asks for: `GetById`, `GetPendingForCustomer`, `Search` — **never a method that takes
an arbitrary filter expression**, which is an unexecuted query with an extra step. Adding and
removing only stage.

## It returns results, never an unexecuted query

**A method executes its query and returns what it found.** Handing out a query still being
composed leaves it half-built outside: the use case ends up composing SQL and **the repository
stops being a boundary — nobody can tell any more what hits the database or where.**

## Reads go through it too, projections included

**Every read is a method here**, including listings that filter, page and project to a DTO,
which they return.

The consequence is deliberate: **the repository grows with the screens.** A new listing adds a
method, not a query somewhere else. That is the price of a single door to the database, and it
is the point of the pattern — everything touching this aggregate is in one file.

## What a repository does not do

- **It does not save.** Adding, removing and changes to a loaded entity are pending until the
  unit of work saves. **A repository that saves breaks the transaction: two repositories
  become two commits.**
- **It does not decide.** No rules, no validation, no Result, no status codes.
- **It does not map DTOs of another aggregate and does not reach other repositories.** What
  crosses aggregates is composed by the use case.
- **It does not expose the persistence handle** it holds.

## The unit of work is the single door

- **Repositories are properties of it**, named after the aggregate in plural, beside the one
  save.
- **Repositories are never injected into a use case.** The use case takes the unit of work and
  nothing else from persistence.
- The implementation holds the handle and **gives the same instance to every repository**,
  which is what makes them share one transaction. It lives as long as the handle does.

## It is the only thing that saves

**The save lives here and nowhere else. One call, at the end of the use case.** That single
save is what makes several repositories commit **together**: an order added and a customer
updated either both land or neither does.

When two writes genuinely cannot be one save, **the unit of work is what exposes the
transaction** — one method that begins it, returning the handle the data access guidance
defines, which the use case commits and disposes.

**There is no `Commit` and no `Rollback` on this interface**: a rollback that has to be called
is a rollback that gets skipped on the failure paths nobody wrote. The method is declared only
when a use case actually needs it, never just in case.

## What comes with the single door

Injecting one type means **every use case can reach every aggregate**. That is the accepted
trade, and it comes with one discipline: **a use case touches the repositories its operation
needs and no others.** Reaching for a third aggregate *while we are here* is how an operation
quietly grows a scope nobody asked it to have.

The unit of work **holds no logic and translates no failure**: its save does not catch, and no
repository or unit of work turns a provider error into a typed conflict. What the save could
reject is checked before it, through a repository method returning a boolean; whatever
escapes reaches the global handler (`backend-errors.md`). **No catch around each repository
call.**

## Closing checklist

- [ ] One repository per aggregate root, its interface declaring only what is used, with no
      generic repository.
- [ ] Methods named after the domain, none returning an unexecuted query.
- [ ] Reads, listings and projections are methods here, returning their DTO.
- [ ] No repository saves, decides, or exposes the handle, and every asynchronous method takes
      the cancellation signal.
- [ ] The use case injects the unit of work only, and repositories are properties of it
      sharing one handle.
- [ ] The save exists only here, is called once at the end, and catches nothing.
- [ ] No explicit transaction unless two writes cannot be one save.
- [ ] The use case used only the repositories its operation needs.
