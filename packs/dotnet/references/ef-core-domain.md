# Mapping the domain model — aggregates and value objects

Builds on `../nzt-backend/references/data-mapping.md`, *A domain model that protects itself* —
read it first, with `ef-core-mappings.md`.

## Rules

1. **Nothing is made public for EF**: it sets private setters and calls the private constructor
   through reflection.
2. **Aggregate collections write through their field**, declared even though convention finds it:

   ```csharp
   builder.Navigation(order => order.Lines)
       .UsePropertyAccessMode(PropertyAccessMode.Field);
   ```

3. **Another aggregate: the foreign key without a navigation**, so no `Include` walks out:

   ```csharp
   builder.HasOne<Customer>()
       .WithMany()
       .HasForeignKey(order => order.CustomerId)
       .OnDelete(DeleteBehavior.Restrict);
   ```

4. **A value object is always a complex type** — `ComplexProperty`, or `ComplexCollection` for a
   collection — with lengths from the value type's constants (`domain-value-objects.md`). **Never
   `OwnsOne` or `OwnsMany`**: they map an owned entity with a hidden key — identity pretending to
   be a value; they only look familiar from older examples.

   ```csharp
   builder.ComplexProperty(order => order.ShippingAddress, address =>
   {
       address.Property(value => value.Street).HasMaxLength(ShippingAddress.StreetMaxLength);
   });

   builder.ComplexCollection(order => order.Discounts, discount =>
   {
       discount.Property(value => value.Percentage);
   });
   ```

5. **No `HasColumnName` literal**; `nameof` if a name must be stated.
6. **Load the minimum aggregate tracked** (no `AsNoTracking()` — it will change), `Include` only
   what the operation touches, filtered on large collections
   (`Include(order => order.Lines.Where(…))`). An invariant's number comes from `CountAsync`,
   `SumAsync` or `MaxAsync` on the `DbSet` — never computed over a filtered `Include`.

## Done when

Nothing is public for EF, collections use field access, cross-aggregate relationships have no
navigation, every value object is a complex type, and no `Owns*` exists.
