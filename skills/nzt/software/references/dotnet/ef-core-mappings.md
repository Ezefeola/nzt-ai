# EF Core mappings — the context and its entities

## Rules

1. **One `<Component>DbContext`** (`BillingDbContext`) with a `DbSet<T>` per entity and
   nothing else.
2. **`OnModelCreating` only applies the configurations.**
3. **One `<Entity>Configuration : IEntityTypeConfiguration<T>` per entity**, in its own file.
4. **No data annotations.**
5. **The `DbContext` is registered scoped.**
6. **No lazy-loading proxies.**
7. **Tracking stays EF's default**: never `NoTracking` globally — an unmarked update would
   silently not save.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.ApplyConfigurationsFromAssembly(typeof(BillingDbContext).Assembly);
}
```

## Done when

Every rule holds for the context and configurations you wrote.
