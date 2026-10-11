# Mapping the domain model — aggregates and value objects

**Read `../nzt-build/references/data-mapping.md` first.** Its section on a domain model that
protects itself holds why nothing is made public for persistence, the collection behind a
field, the cross-aggregate foreign key with no navigation, value semantics for value objects
and loading the minimum aggregate. This file holds only what is EF Core.

Everything in `nzt-build-backend-dotnet-ef-core-mappings` still applies.

## Private setters and the private constructor stay private

EF sets properties and calls constructors **through reflection**, so a model with private
setters and a private constructor maps with no concession: **nothing has to be made public for
persistence**. A parameterless private constructor is the simplest thing that works, and it
lives alongside `Create`, never replacing it. A public setter added *because EF needs it* is an
invariant given away, and EF did not need it.

## Collections live behind a backing field

EF is told to write through the field, right after the relationship that declares the
navigation:

```csharp
builder.Navigation(order => order.Lines)
    .UsePropertyAccessMode(PropertyAccessMode.Field);
```

EF has a convention that finds a field named after its property. **It is declared anyway.**

## Relationships to another aggregate

```csharp
builder.HasOne<Customer>()
    .WithMany()
    .HasForeignKey(order => order.CustomerId)
    .OnDelete(DeleteBehavior.Restrict);
```

No navigation property — **which is what stops an `Include` from walking out of the
aggregate**.

## Value objects are complex types, always

**A value object is mapped as a complex type.** That is the mapping with real value semantics:
**no key, no identity, no separately tracked instance**.

```csharp
builder.ComplexProperty(order => order.ShippingAddress, address =>
{
    address.Property(value => value.Street).HasMaxLength(ShippingAddress.StreetMaxLength);
    address.Property(value => value.City).HasMaxLength(ShippingAddress.CityMaxLength);
});
```

A **collection** of value objects is mapped the same way, with `ComplexCollection`:

```csharp
builder.ComplexCollection(order => order.Discounts, discount =>
{
    discount.Property(value => value.Percentage);
});
```

The lengths come from the constants the value type already exposes
(`nzt-build-backend-dotnet-domain-value-objects`).

### `OwnsOne` and `OwnsMany` are never used

Not for a single value object, not for a collection of them, not *just this one because it is
easier*.

`Owns*` maps the value object as an **owned entity**: EF gives it a hidden key and tracks it as
its own instance — **a type with identity pretending to be a value**. It is the historical
mapping, from before complex types existed, and most DDD examples still show it. That is the
only reason it looks familiar.

## Column names are never literals

`HasColumnName` with a string literal is a name no rename will ever follow. If a name has to be
stated at all, it comes from `nameof`.

## Loading the minimum aggregate

- **Load tracked** what the operation is going to change — this is the case where
  `AsNoTracking()` is not written.
- **`Include` only the parts the operation touches**, and filter them where the collection is
  large: `Include(order => order.Lines.Where(…))` brings back the slice that matters.
- The guardrail's number comes from a `CountAsync`, a `SumAsync`, a `MaxAsync` on the `DbSet`.
  **A filtered `Include` leaves the navigation partially populated, and anything counted or
  summed in memory over it is wrong.**

## Closing checklist

- [ ] Private setters and the private constructor stayed private; nothing was made public for EF.
- [ ] Every collection navigation of an aggregate is configured with `PropertyAccessMode.Field`.
- [ ] Every value object is a complex type — `ComplexProperty` or `ComplexCollection` — with no
      key of its own, and **no `OwnsOne` or `OwnsMany` anywhere**.
- [ ] Lengths cite the domain constants, and no column name is written as a literal.
- [ ] Only the part of the aggregate the operation needs was loaded, tracked, with filtered
      includes where the collection is large.
