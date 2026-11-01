# EF Core migrations

Builds on `../nzt-backend/references/data-migrations.md` — read it first.

## Rules

1. **Every migration starts with `dotnet ef migrations add <Name>`.** It writes three artefacts —
   the migration, its designer file and the **model snapshot** EF compares against next time —
   which is why none is hand-written. Remove the latest unapplied one with
   `dotnet ef migrations remove`.
2. Identify first the EF version, the provider, the `DbContext`, and the target and startup
   projects. Customise only `Up` and `Down`; review the provider-specific SQL.
3. The usual reasons the command fails: EF tooling not installed, or no design-time factory or
   startup it can use.
4. **Never `dotnet ef database update` as a consequence, never `Database.Migrate()` at startup.**
   A shared environment is `ship-migrations.md`.
5. **PascalCase names** (`AddCustomerTaxId`). Look for an unrequested `DropColumn`/`DropTable`;
   a rename generated as drop + add becomes a proposed `RenameColumn`.

## Done when

The migration came from `dotnet ef migrations add` with its snapshot, and nothing was applied
beyond a disposable database.
