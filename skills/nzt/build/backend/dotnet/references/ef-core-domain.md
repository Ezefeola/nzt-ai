# Mapping the domain model — aggregates and value objects

## Contents
- Private setters and the private constructor stay private
- Collections live behind a backing field
- Relationships to another aggregate
- Value objects are complex types, always
- Column names are never literals
- Loading: the minimum aggregate
- Closing checklist

Everything in `nzt-build-backend-dotnet-ef-core-mappings` still applies: one context, one
configuration file per entity, no annotations, explicit delete behaviour. This is **what a model
that protects itself needs on top of that** — the aggregate when the domain axis selected DDD,
and the value object in any model that has one.

## Private setters and the private constructor stay private

EF sets properties and calls constructors **through reflection**, so a model with private
setters and a private constructor maps with no concession: **nothing has to be made public for
persistence**.

The private constructor the domain model already requires is enough, as long as EF can call one
— a parameterless private one is the simplest thing that works, and it lives alongside
`Create`, never replacing it.

**Nothing is relaxed for the ORM.** A public setter added *because EF needs it* is an invariant
given away, and EF did not need it.

## Collections live behind a backing field

The aggregate exposes its children read-only and keeps the real list private. EF is told to
write through the field, right after the relationship that declares the navigation:

```csharp
builder.Navigation(order => order.Lines)
    .UsePropertyAccessMode(PropertyAccessMode.Field);
```

EF has a convention that finds a field named after its property, so this often works without
being declared. **It is declared anyway**: the mapping states its own contract instead of
resting on two names matching, and **a field renamed later fails here, in the file that
configured it**, instead of somewhere else at runtime.

## Relationships to another aggregate

The DDD model says there is a foreign key and **no navigation outwards**, so the relationship is
configured without one:

```csharp
builder.HasOne<Customer>()
    .WithMany()
    .HasForeignKey(order => order.CustomerId)
    .OnDelete(DeleteBehavior.Restrict);
```

The FK column, its index and its delete behaviour are all still declared. What is gone is the
property — **which is what stops an `Include` from walking out of the aggregate**.

Inside the aggregate, relationships are configured normally: the root has its children and they
are loaded with it.

## Value objects are complex types, always

**A value object is mapped as a complex type.** That is the mapping with real value semantics:
**no key, no identity, no separately tracked instance** — the columns are simply part of the
owner's row.

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
(`nzt-build-backend-dotnet-domain-value-objects`), never from a literal written here.

### `OwnsOne` and `OwnsMany` are never used

Not for a single value object, not for a collection of them, not *just this one because it is
easier*.

`Owns*` maps the value object as an **owned entity**: EF gives it a hidden key and tracks it as
its own instance — **a type with identity pretending to be a value**. That is why sharing one
instance between two owners misbehaves, and it is a different thing from what a value object is.
It is the historical mapping, from before complex types existed, and most DDD examples still
show it. That is the only reason it looks familiar.

## Column names are never literals

**A column keeps the name of its property.** `HasColumnName` with a string literal is a name no
rename will ever follow. If a name has to be stated at all, it comes from `nameof`.

## Loading: the minimum aggregate

The aggregate is the consistency boundary, **not an instruction to materialise everything**.
What that means for a query:

- **Load tracked** what the operation is going to change — this is the case where
  `AsNoTracking()` is not written.
- **`Include` only the parts the operation touches**, and filter them where the collection is
  large: `Include(order => order.Lines.Where(…))` brings back the slice that matters.
- **A read-only read does not load the aggregate at all**: it projects to its DTO like any
  other query.

**The guardrail of the domain model comes first here, and it has an order**: an invariant over
an entire collection **gets its number from the database** — a `CountAsync`, a `SumAsync`, a
`MaxAsync` on the `DbSet`, passed into the method as a parameter. Loading the collection whole
is the fallback, for when there is no more performant way to answer.

The reason the order matters: **a filtered `Include` leaves the navigation partially populated,
and anything counted or summed in memory over it is wrong** — with no error to show for it.
Pulling the whole collection back to avoid that is the same mistake in the other direction, and
it is the one that survives testing and dies in production.

## Closing checklist

- [ ] Private setters and the private constructor stayed private; nothing was made public for EF.
- [ ] Every collection navigation of an aggregate is configured with `PropertyAccessMode.Field`.
- [ ] Relationships to other aggregates are configured **without a navigation**, keeping the FK,
      its index and its delete behaviour.
- [ ] Every value object is a complex type — `ComplexProperty` or `ComplexCollection` — with no
      key of its own, and **no `OwnsOne` or `OwnsMany` anywhere**.
- [ ] Lengths cite the domain constants, and no column name is written as a literal.
- [ ] Only the part of the aggregate the operation needs was loaded, tracked, with filtered
      includes where the collection is large.
- [ ] No invariant was computed in memory over a partially loaded collection.
