# Clean architecture on .NET

## Rules

1. **Each layer is a project, `<Component>.<Layer>`**: the compiler enforces the references.
2. **The entry point is `Program.cs`.**
3. **`Api/Results/`** also holds the response filter, if any.
4. **The transaction boundary's interface is `IUnitOfWork`** in `UnitOfWork/`; with direct
   persistence, the interface over the handle is the handle's name with `I`.
5. **One registration file per project** with one public method (`AddApplication()`,
   `AddInfrastructure()`) and a private one per feature; `Program.cs` makes two calls.

## Done when

Every rule holds for the projects you touched.
