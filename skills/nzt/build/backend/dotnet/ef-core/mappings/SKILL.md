---
name: nzt-build-backend-dotnet-ef-core-mappings
description: Use when configuring the DbContext, an entity mapping, a relationship or a conversion - one context per component, one configuration file per entity, no data annotations, nothing left to convention.
---

# EF Core mappings — the context and its entities

The mapping is where persistence decisions are written down, **in one place per entity**, so
that nothing about how the model is stored has to be inferred from the domain types.

Load `nzt-build-backend-dotnet` and `nzt-build-backend-dotnet-ef-core` before applying this.

## The `DbContext`

**One `DbContext` per component, named after the component** and ending in `DbContext` — the
component `Billing` gets `BillingDbContext`, never a name derived from what it happens to
store. **It is the persistence handle**: whatever the architecture says about where the handle
lives and how it reaches a use case applies to this type.

It exposes **a `DbSet<T>` per entity and nothing else**: no queries, no business logic, no
helper methods. **A `DbContext` that grows methods becomes the place where use cases hide their
decisions**, and none of them are reviewable as behaviour any more.

`OnModelCreating` has **one job**:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.ApplyConfigurationsFromAssembly(typeof(BillingDbContext).Assembly);
}
```

Nothing is configured inline there, so **two unrelated changes never edit the same method**.

**It is registered once, in the composition root**, with the provider and the connection string
read from configuration — never a literal in code. The lifetime is the default **scoped**.

## Entity configuration lives in its own file

**One `IEntityTypeConfiguration<T>` per entity**, in its own file, named `<Entity>Configuration`.

**Data annotations are not used** — not even the easy ones. A model configured in two places is
a model where nobody knows which one wins, and attributes put persistence concerns inside the
domain type.

| Concern | Why it is not left to convention |
|---|---|
| Key | explicit, even where the convention would find it |
| Required and max length | the database rejects what the type alone allows; **the length is the entity's, cited — never a literal or a local `const`** |
| `decimal` precision | the default precision silently truncates money |
| Relationships and delete behaviour | below |
| Value conversions (enums, dates, ids) | how a value is stored is a decision, not a default |
| Table and column names | **the property name is the column name**: no literal ever, `nameof` if one must be stated |
| Indexes | declared here; which ones, in `nzt-build-backend-dotnet-ef-core-indexes` |

## Relationships: the foreign key is a property

**Every relationship declares both the FK property and the navigation** — `CustomerId` and
`Customer` — **except a cross-aggregate relationship in a DDD model, which keeps the FK and
drops the outward navigation** (`nzt-build-backend-dotnet-ef-core-domain`). Three things follow,
and they are the reason:

- **A relationship can be assigned without loading the other entity.** Setting an `int` does not
  need a round trip.
- **Optionality is expressed in the type**: `int` means required, `int?` means optional. The
  navigation's nullability never has to be interpreted.
- **Filtering and grouping read naturally** without walking into the navigation.

Collection navigations are initialised where they are declared, so no consumer null-checks a
list that always exists. **Delete behaviour is always explicit**: the default cascade is
convenient right up to the day a delete takes rows nobody expected with it.

## Closing checklist

- [ ] One `DbContext` per component, named after it, carrying `DbSet`s and
      `ApplyConfigurationsFromAssembly` and nothing else.
- [ ] Registered scoped in the composition root, with provider and connection string from
      configuration.
- [ ] One `IEntityTypeConfiguration<T>` per entity, in its own file, with no data annotations.
- [ ] Keys, required, lengths, precision and conversions are explicit, and lengths cite the
      entity's own constant.
- [ ] No table or column name written as a literal.
- [ ] Every relationship declares its FK property, its optionality in the type and its delete
      behaviour; collection navigations are initialised.
