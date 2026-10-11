# EF Core mappings — the context and its entities

**Read `../nzt-build/references/data-mapping.md` first.** It holds the handle that exposes only
its entities, one configuration per entity, the concerns that are never left to convention, and
the foreign key as a property. This file holds only what is EF Core.

## The `DbContext`

**One `DbContext` per component, named after the component** and ending in `DbContext` — the
component `Billing` gets `BillingDbContext`. It exposes **a `DbSet<T>` per entity and nothing
else**. **A `DbContext` that grows methods becomes the place where use cases hide their
decisions.**

`OnModelCreating` has **one job**:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.ApplyConfigurationsFromAssembly(typeof(BillingDbContext).Assembly);
}
```

The lifetime is the default **scoped**.

## Entity configuration

**One `IEntityTypeConfiguration<T>` per entity**, in its own file, named `<Entity>Configuration`.

**Data annotations are not used** — not even the easy ones.

- `decimal` precision is explicit.
- **The length is the entity's, cited — never a literal or a local `const`.**
- A column name, if one must be stated, comes from `nameof`. Indexes: which ones, in
  `nzt-build-backend-dotnet-ef-core-indexes`.
- **Every relationship declares both the FK property and the navigation** — `CustomerId` and
  `Customer` — except across aggregates (`nzt-build-backend-dotnet-ef-core-domain`).
- **Optionality is expressed in the type**: `int` means required, `int?` means optional. Setting
  an `int` does not need a round trip.

## Closing checklist

- [ ] One `DbContext` per component, named after it, carrying `DbSet`s and
      `ApplyConfigurationsFromAssembly` and nothing else.
- [ ] Registered scoped in the composition root, with provider and connection string from
      configuration.
- [ ] One `IEntityTypeConfiguration<T>` per entity, in its own file, with no data annotations.
- [ ] Every relationship declares its FK property, its optionality in the type and its delete
      behaviour; collection navigations are initialised.
