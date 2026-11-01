# EF Core mappings — the context and its entities

Builds on `../nzt-backend/references/data-mapping.md` — read it first.

## Rules

1. **One `<Component>DbContext`** (`BillingDbContext`) with a `DbSet<T>` per entity and
   nothing else.
2. **`OnModelCreating` only applies the configurations.**
3. **One `<Entity>Configuration : IEntityTypeConfiguration<T>` per entity**, in its own file.
4. **No data annotations.**

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.ApplyConfigurationsFromAssembly(typeof(BillingDbContext).Assembly);
}
```

## Done when

Every rule holds for the context and configurations you wrote.
