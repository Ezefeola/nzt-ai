# Hexagonal architecture on .NET

## Rules

1. **Each unit is a project**: no adapter's `.csproj` names another, so the compiler enforces
   it.
2. **`Adapter.Api` holds `Program.cs`** and `Results/` with the response filter, if any.
3. **Registration**: each adapter exposes `AddAdapter<Motive>`, `Core` exposes `AddCore()`
   with a private method per feature, and `CompositionRoot`'s method calls `AddCore()` then
   every adapter's.

## Done when

Every rule holds for the projects you touched.
