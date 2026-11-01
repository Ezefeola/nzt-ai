# Mapping the domain model — aggregates and value objects

Builds on `../nzt-backend/references/data-mapping.md`, *A domain model that protects itself* —
read it first, with `ef-core-mappings.md`.

## Rules

1. **Aggregate collections write through their field**:

   ```csharp
   builder.Navigation(order => order.Lines)
       .UsePropertyAccessMode(PropertyAccessMode.Field);
   ```

2. **Another aggregate: the foreign key without a navigation**:

   ```csharp
   builder.HasOne<Customer>()
       .WithMany()
       .HasForeignKey(order => order.CustomerId)
       .OnDelete(DeleteBehavior.Restrict);
   ```

3. **A value object is always a complex type** — `ComplexProperty`, or `ComplexCollection` for
   a collection.
4. **Never `OwnsOne` or `OwnsMany`**: they map an owned entity with a hidden key, and only look
   familiar from older examples.

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

## Done when

Every rule holds for the mappings you wrote.
