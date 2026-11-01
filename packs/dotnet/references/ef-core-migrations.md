# EF Core migrations

Builds on `../nzt-backend/references/data-migrations.md` — read it first.

## Rules

1. **Generate with `dotnet ef migrations add <Name>`**; remove the latest unapplied one with
   `dotnet ef migrations remove`.
2. **Customise only `Up` and `Down`.**
3. **When the command fails**, check first that the EF tooling is installed and that it has a
   design-time factory or a startup it can use.
4. **Never `dotnet ef database update` as a consequence, never `Database.Migrate()` at
   startup.** A shared environment is `ship-migrations.md`.
5. **PascalCase names** (`AddCustomerTaxId`).

## Done when

Every rule holds for the migration you generated.
