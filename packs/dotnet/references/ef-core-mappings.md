# EF Core mappings — the context and its entities

Builds on `../nzt-backend/references/data-mapping.md` — read it first.

## Rules

1. **One `<Component>DbContext`** (`BillingDbContext`) with a `DbSet<T>` per entity and nothing
   else; `OnModelCreating` only applies the configurations. Registered scoped.
2. **One `<Entity>Configuration : IEntityTypeConfiguration<T>` per entity, in its own file. No
   data annotations.**
3. Explicit `decimal` precision; lengths cite the entity's constant; a stated column name comes
   from `nameof`; indexes per `ef-core-indexes.md`.
4. **Every relationship declares the FK property and the navigation** (`CustomerId`, `Customer`) —
   except across aggregates (`ef-core-domain.md`) — with optionality in the type (`int` required,
   `int?` optional) and explicit delete behaviour.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.ApplyConfigurationsFromAssembly(typeof(BillingDbContext).Assembly);
}
```

## Done when

One context per component exposing only `DbSet`s, and one configuration file per entity with no
data annotations.
