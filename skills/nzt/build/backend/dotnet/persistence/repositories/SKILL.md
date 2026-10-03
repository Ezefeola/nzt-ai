---
name: nzt-build-backend-dotnet-persistence-repositories
description: Use when the stack selects repositories with a unit of work and an operation reaches persistence - one repository per aggregate root, reached through the unit of work, which is the only thing that saves.
---

# Repositories and unit of work

The persistence axis says repositories with a unit of work, so **every access to the database
goes through a repository**, and the repositories are reached **through the unit of work** —
never injected on their own.

Load `nzt-build-backend-dotnet` before applying this.

## One per aggregate root, with its own interface

`IOrderRepository` / `OrderRepository`, **one pair per aggregate root** — not per table, and
**never a generic `IRepository<T>`**. A generic repository over an ORM wraps something that is
already a repository, and **it always ends in a `GetAll` that every caller filters
afterwards.**

The interface declares **only the methods this project uses**, each named after what the
domain asks for:

```csharp
public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(int id, CancellationToken cancellationToken);

    Task<PagedResponseDto<OrderSummaryResponseDto>> SearchAsync(
        SearchOrdersRequestDto request,
        CancellationToken cancellationToken);

    void Add(Order order);
    void Remove(Order order);
}
```

`GetPendingForCustomerAsync`, `SearchAsync` — **never `Get(Expression<...>)`**, which is
`IQueryable` with an extra step.

## It returns results, never an `IQueryable`

**A method executes its query and returns what it found.** Handing out an `IQueryable` leaves
the query half-built outside: the use case ends up composing SQL and **the repository stops
being a boundary — nobody can tell any more what hits the database or where.**

## Reads go through it too, projections included

**Every read is a method here**, including listings that filter, page and project to a DTO,
which they return.

The consequence is deliberate: **the repository grows with the screens.** A new listing adds a
method, not a query somewhere else. That is the price of a single door to the database, and it
is the point of the pattern — everything touching this aggregate is in one file.

## What a repository does not do

- **It does not save.** `Add`, `Remove` and changes to a tracked entity are pending until the
  unit of work saves. **A repository that calls `SaveChangesAsync` breaks the transaction: two
  repositories become two commits.**
- **It does not decide.** No rules, no validation, no `Result`, no status codes.
- **It does not map DTOs of another aggregate and does not reach other repositories.** What
  crosses aggregates is composed by the use case.
- **It does not expose the persistence handle** it holds.

Loading through `GetByIdAsync` returns the aggregate **tracked**: changing it is enough, with
no `Update` call. `Add` and `Remove` are synchronous — they only stage.

## The unit of work is the single door

```csharp
public interface IUnitOfWork
{
    IOrderRepository Orders { get; }
    ICustomerRepository Customers { get; }

    Task SaveChangesAsync(CancellationToken cancellationToken);
}
```

- **Repositories are properties of it**, named after the aggregate in plural.
- **Repositories are never injected into a use case.** The constructor takes `IUnitOfWork` and
  nothing else from persistence.
- The implementation holds the handle and **gives the same instance to every repository**,
  which is what makes them share one transaction. It is registered scoped, like the handle.

## It is the only thing that saves

**`SaveChangesAsync` lives here and nowhere else. One call, at the end of the use case.** That
single save is what makes several repositories commit **together**: an order added and a
customer updated either both land or neither does.

When two writes genuinely cannot be one save, **the unit of work is what exposes the
transaction** — one method, `BeginTransactionAsync`, returning the handle the ORM skill
defines, which the use case commits with `await using`.

**There is no `Commit` and no `Rollback` on this interface**: a rollback that has to be called
is a rollback that gets skipped on the failure paths nobody wrote. The method is declared only
when a use case actually needs it, never just in case.

## What comes with the single door

Injecting one type means **every use case can reach every aggregate**. That is the accepted
trade, and it comes with one discipline: **a use case touches the repositories its operation
needs and no others.** Reaching for a third aggregate *while we are here* is how an operation
quietly grows a scope nobody asked it to have.

The unit of work **holds no logic and translates no failure**: its `SaveChangesAsync` does not
catch, and no repository or unit of work turns a provider error into a typed conflict. What
the save could reject is checked before it, through a repository method returning a boolean;
whatever escapes reaches the global handler (`nzt-build-backend-dotnet-exceptions`). **No catch
around each repository call.**

## Closing checklist

- [ ] One repository per aggregate root, its interface declaring only what is used, with no
      generic `IRepository<T>`.
- [ ] Methods named after the domain, none returning `IQueryable`.
- [ ] Reads, listings and projections are methods here, returning their DTO.
- [ ] No repository saves, decides, or exposes the handle, and every async method takes the
      token.
- [ ] The use case injects `IUnitOfWork` only, and repositories are properties of it sharing
      one handle.
- [ ] `SaveChangesAsync` exists only here, is called once at the end, and catches nothing.
- [ ] No explicit transaction unless two writes cannot be one save.
- [ ] The use case used only the repositories its operation needs.
