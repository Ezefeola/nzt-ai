# Data mapping — how the model is stored

Every persistence decision is written in one place per entity, so nothing about storage is
inferred from the domain types.

## The handle

1. **One handle type per component, named after the component**, exposing its entities and
   nothing else — no queries, logic or helpers, or use cases hide decisions in it.
2. **Registered once in the composition root**, provider and connection string from
   configuration, lifetime of one operation.

## Configuration

1. **One configuration per entity, in its own file**, never a shared method, and **nothing
   declared on the domain type** — two places means nobody knows which wins.
2. **Explicit, never left to convention**:

   | Concern | Rule |
   |---|---|
   | key | explicit, even where convention finds it |
   | required, max length | the length cites the entity's constant — never a literal |
   | precision of exact numbers | explicit: the default truncates money |
   | value conversions (enums, dates, ids) | a decision, not a default |
   | table and column names | the property name is the column; never a literal (name-of if stated) |
   | delete behaviour | always explicit: the default cascade takes rows nobody expected |
   | indexes | declared here; which ones is `data-indexes.md` |

3. **Every relationship declares the foreign key property and the navigation**
   (`CustomerId` and `Customer`): assignable without loading, optionality in the type. Collection
   navigations are initialised where declared.

## A domain model that protects itself

With DDD, and for any value object:

1. **Nothing is made public for persistence**: private setters and constructor stay; the
   constructor the mapping uses sits beside the creation method.
2. **Collections behind a private field**, exposed read-only; the mapping writes through the
   field, **declared even where convention finds it**, so a rename fails in that file.
3. **A relationship to another aggregate keeps the foreign key, its index and delete behaviour,
   and has no outward navigation** — that is what stops a load walking out of the aggregate.
4. **A value object is stored with value semantics** — no key, no identity, its columns part
   of the owner's row (one value or a collection). Never an entity with a hidden key. Lengths
   from the value type's constants.

## Loading the minimum aggregate

Load only what the operation changes, filtering large collections; a read-only read projects
and loads nothing. **A filtered load leaves a partial navigation: never count or sum over it** —
an invariant over a whole collection takes its number from the database (`nzt-ddd`'s
`ddd.md`).

## Done when

One handle per component, one configuration per entity with every concern explicit and no
literal names, nothing made public for the ORM, cross-aggregate relationships without
navigation, and no invariant computed over a partial load.
