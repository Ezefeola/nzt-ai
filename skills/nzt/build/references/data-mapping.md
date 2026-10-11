# Data mapping — how the model is stored

## Contents
- The persistence handle
- Configuration lives in one place per entity
- Relationships: the foreign key is a property
- Mapping a domain model that protects itself
- Loading: the minimum aggregate
- Closing checklist

The mapping is where persistence decisions are written down, **in one place per entity**, so
that nothing about how the model is stored has to be inferred from the domain types.

## The persistence handle

**One handle type per component, named after the component** — never a name derived from what
it happens to store. **It is the persistence handle**: whatever the architecture says about
where the handle lives and how it reaches a use case applies to this type.

It exposes **the entities it stores and nothing else**: no queries, no business logic, no
helper methods. **A handle that grows methods becomes the place where use cases hide their
decisions**, and none of them are reviewable as behaviour any more.

**It is registered once, in the composition root**, with the provider and the connection string
read from configuration — never a literal in code — and with a lifetime of one operation.

## Configuration lives in one place per entity

**One configuration per entity**, in its own file, named after the entity. Nothing is
configured in a shared method, so **two unrelated changes never edit the same place**.

**Persistence is never declared on the domain type itself** — not even the easy parts. A model
configured in two places is a model where nobody knows which one wins, and declaring storage on
the type puts persistence concerns inside the domain.

| Concern | Why it is not left to convention |
|---|---|
| Key | explicit, even where the convention would find it |
| Required and max length | the database rejects what the type alone allows; **the length is the entity's, cited — never a literal or a local constant** |
| Precision of exact numbers | the default precision silently truncates money |
| Relationships and delete behaviour | below |
| Value conversions (enums, dates, ids) | how a value is stored is a decision, not a default |
| Table and column names | **the property name is the column name**: no literal ever, the language's name-of operator if one must be stated |
| Indexes | declared here; which ones, in the data indexes guidance |

## Relationships: the foreign key is a property

**Every relationship declares both the foreign key property and the navigation** —
`CustomerId` and `Customer` — **except a cross-aggregate relationship in a DDD model, which
keeps the foreign key and drops the outward navigation** (below). Three things follow, and they
are the reason:

- **A relationship can be assigned without loading the other entity.** Setting an id does not
  need a round trip.
- **Optionality is expressed in the type**: a required id or a nullable one. The navigation's
  nullability never has to be interpreted.
- **Filtering and grouping read naturally** without walking into the navigation.

Collection navigations are initialised where they are declared, so no consumer null-checks a
list that always exists. **Delete behaviour is always explicit**: the default cascade is
convenient right up to the day a delete takes rows nobody expected with it.

## Mapping a domain model that protects itself

What the aggregate needs when the domain axis selected DDD, and the value object in any model
that has one, on top of everything above.

- **Nothing has to be made public for persistence.** The private setters and the private
  constructor the model requires stay private; the constructor the mapping uses lives alongside
  the creation method, never replacing it. **Nothing is relaxed for the ORM.** A public setter
  added *because the ORM needs it* is an invariant given away.
- **Collections live behind a private field.** The aggregate exposes its children read-only and
  keeps the real list private, and the mapping is told to write through the field. **It is
  declared even where a convention would find it**: the mapping states its own contract, and
  **a field renamed later fails in the file that configured it**, instead of somewhere else at
  runtime.
- **Relationships to another aggregate keep the foreign key and have no navigation outwards.**
  The foreign key column, its index and its delete behaviour are all still declared. What is
  gone is the property — **which is what stops a load from walking out of the aggregate**.
  Inside the aggregate, relationships are configured normally.
- **A value object is stored with value semantics: no key, no identity, no separately tracked
  instance** — the columns are simply part of the owner's row, for one value or for a
  collection of them. **Never as an entity with a hidden key** pretending to be a value: sharing
  one instance between two owners then misbehaves, and it is a different thing from what a
  value object is. The lengths come from the constants the value type already exposes, never
  from a literal written in the mapping.
- **A column keeps the name of its property**, and a column name written as a literal is a name
  no rename will ever follow.

## Loading: the minimum aggregate

The aggregate is the consistency boundary, **not an instruction to materialise everything**.
What that means for a query:

- **Load to change** what the operation is going to change.
- **Load only the parts the operation touches**, and filter them where the collection is large.
- **A read-only read does not load the aggregate at all**: it projects to its DTO like any
  other query.

**The guardrail of the domain model comes first here, and it has an order**: an invariant over
an entire collection **gets its number from the database** — a count, a sum, a max — passed
into the method as a parameter. Loading the collection whole is the fallback, for when there is
no more performant way to answer.

The reason the order matters: **a filtered load leaves the navigation partially populated, and
anything counted or summed in memory over it is wrong** — with no error to show for it. Pulling
the whole collection back to avoid that is the same mistake in the other direction, and it is
the one that survives testing and dies in production.

## Closing checklist

- [ ] One handle per component, named after it, exposing its entities and nothing else.
- [ ] Registered once in the composition root, with provider and connection string from
      configuration.
- [ ] One configuration per entity, in its own file, with nothing declared on the domain type.
- [ ] Keys, required, lengths, precision and conversions are explicit, and lengths cite the
      entity's own constant.
- [ ] No table or column name written as a literal.
- [ ] Every relationship declares its foreign key property, its optionality in the type and its
      delete behaviour; collection navigations are initialised.
- [ ] Nothing was made public for the ORM; aggregate collections are written through their
      private field, declared.
- [ ] Relationships to other aggregates are configured **without a navigation**, keeping the
      foreign key, its index and its delete behaviour.
- [ ] Every value object is stored with no key of its own.
- [ ] Only the part of the aggregate the operation needs was loaded, with filtered loads where
      the collection is large.
- [ ] No invariant was computed in memory over a partially loaded collection.
