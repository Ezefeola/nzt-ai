# Vertical slice on .NET

**Read `../nzt-build/references/backend-architecture-vertical-slice.md` first.** It holds the
architecture: the unit, the tree of roles, the slice rule and registration. This file holds
only what is .NET.

## One project per component

A component is **one `.csproj`**. No `.Domain`, no `.Application`, no `.Infrastructure`.
**The compiler enforces *"the domain may not see the database"*** the moment the layers are
projects, and nothing enforces the boundary between operations — which is why they are not.

## The tree on .NET

The generic tree, with these roles filled the .NET way:

```
<Component>/                   at its root, the .csproj and Program.cs
  Contracts/
    Results/                   the result type and its HTTP translation, plus
                               the response filter if there is one
```

**The aggregate's one mapping file is its `<Entity>MappingExtensions`**, at the feature level,
holding the mapping to every operation's DTOs.

## Dependency injection

The entry point is `Program.cs`, and each registration file is a static class extending
`IServiceCollection`:

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

`Persistence/` does the same for the handle and the repositories, so `Program.cs` is two
calls. **Registrations are written out — never discovered by scanning the assembly.**

## Closing checklist

- [ ] One `.csproj` for the component, no layer projects.
- [ ] The aggregate's mapping file is its `<Entity>MappingExtensions`.
- [ ] `Program.cs` calls only the public method of each registration file, and nothing scans
      the assembly.
