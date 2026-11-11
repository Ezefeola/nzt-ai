# Data mapping — how the model is stored

Every persistence decision is written in one place per entity, so nothing about storage is
inferred from the domain types.

## The handle

1. **One handle type per component, named after the component**, exposing its entities and
   nothing else — no queries, logic or helpers.
2. **Registered once in the composition root**, provider and connection string from
   configuration, lifetime of one operation.

## Configuration

1. **One configuration per entity, in its own file**, never a shared method.
2. **Nothing declared on the domain type**: two places means nobody knows which wins.
3. **Explicit, never left to convention**:

   | Concern | Rule |
   |---|---|
   | key | explicit, even where convention finds it |
   | required, max length | the length cites the entity's constant — never a literal |
   | precision of exact numbers | explicit: the default truncates money |
   | value conversions (enums, dates, ids) | a decision, not a default |
   | table and column names | the property name is the column; never a literal (name-of if stated) |
   | delete behaviour | always explicit: the default cascade takes rows nobody expected |
   | indexes | declared here; which ones is `data-indexes.md` |

4. **Every relationship declares the foreign key property and the navigation**
   (`CustomerId` and `Customer`): assignable without loading, optionality in the type.
5. **Collection navigations are initialised where declared.**

## A domain model that protects itself

With DDD, and for any value object:

1. **Nothing is made public for persistence**: private setters and constructor stay; the
   constructor the mapping uses sits beside the creation method.
2. **Collections behind a private field**, exposed read-only; the mapping writes through the
   field, **declared even where convention finds it**, so a rename fails in that file.
3. **A relationship to another aggregate keeps the foreign key, its index and delete
   behaviour, and has no outward navigation**: a load cannot walk out of the aggregate.
4. **A value object is stored with value semantics**: no key, no identity, its columns part
   of the owner's row (one value or a collection), lengths from its constants. Never an
   entity with a hidden key.

## Loading the minimum aggregate

1. **Load only what the operation changes**, filtering large collections; a read-only read
   projects and loads nothing.
2. **Never count or sum over a filtered load**: its navigation is partial. An invariant over a
   whole collection takes its number from the database (`references/ddd/ddd.md`).

## Done when

Every rule holds for the mappings and loads you wrote.
