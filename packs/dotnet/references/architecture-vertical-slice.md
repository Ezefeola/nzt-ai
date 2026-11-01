# Vertical slice on .NET

Builds on `../nzt-backend/references/architecture-vertical-slice.md` — read it first.

## Rules

1. **One `.csproj` per component**, in `src/<Component>/`.
2. **`Contracts/Results/`** also holds the response filter, if any.
3. **Each registration file is a static class extending `IServiceCollection`.**

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

Every rule holds for the project you touched.
