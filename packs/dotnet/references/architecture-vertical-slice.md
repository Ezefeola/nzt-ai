# Vertical slice on .NET

Builds on `../nzt-backend/references/architecture-vertical-slice.md` — read it first.

## Rules

1. **One `.csproj` per component** — no `.Domain`, `.Application` or `.Infrastructure`. It sits in
   `src/<Component>/`; the component's root holds `src/`, `tests/` and `Docs/`.
2. **`Contracts/Results/`** holds the result type, its HTTP translation and the response filter
   if there is one.
3. **The aggregate's mapping file is its `<Entity>MappingExtensions`**, at the feature level.
4. **Each registration file is a static class extending `IServiceCollection`**; `Program.cs`
   makes two calls (features, persistence). Never assembly scanning.

```csharp
// Features/FeaturesDependencyInjection.cs
public static class FeaturesDependencyInjection
{
    public static IServiceCollection AddFeatures(this IServiceCollection services)
    {
        AddOrders(services);
        return services;
    }

    private static void AddOrders(IServiceCollection services)
    {
        services.AddScoped<ICancelOrder, CancelOrder>();
    }
}
```

## Done when

One `.csproj`, `<Entity>MappingExtensions` per aggregate, and `Program.cs` calling only the
registration files' public methods.
