---
name: nzt-build-backend-dotnet-ef-core-indexes
description: Use when a query is added or a uniqueness rule has to be enforced - which index the read earns, the order of a composite, and the unique index that is the only thing making the rule true.
---

# EF Core indexes — which ones, and in what shape

An index is **declared in the entity configuration file** and reaches the database **through a
generated migration**, like every other mapping change. This is the hard part: which ones.

> **The query decides the index, not the entity.** An index exists to serve a read the code
> actually performs. Adding one because a column *looks searchable* pays for a read nobody
> makes.

Load `nzt-build-backend-dotnet` and `nzt-build-backend-dotnet-ef-core` before applying this.

## When a column earns an index

Look at the queries this component runs against that table — the one just written and the ones
already there:

| The column appears in | Index it? |
|---|---|
| A `Where` on a table that grows | **Yes** — this is the main case |
| A `Join` or a foreign key | **Already** — EF indexes FK columns by convention |
| An `OrderBy` over many rows, especially with paging | **Yes**, usually as part of a composite |
| A business uniqueness rule | **Yes, unique** — below |
| Only the projection (`Select`) | No — it is never used to find rows |
| A table that stays small | No — scanning a few hundred rows is cheaper than maintaining an index |

**Low cardinality alone does not earn an index.** A boolean, or a three-value status where most
rows share one value, will be ignored by the planner; that column is useful **inside a
composite**, or in a filtered index, not on its own.

## In a composite, the order of the columns is the decision

A composite index can only be used **from the left**. An index on `(CustomerId, CreatedOn)`
serves a query filtering by `CustomerId`, and one filtering by both — **but not** one filtering
only by `CreatedOn`.

The order that works:

1. **Equality first** — the columns a `Where` pins to a value.
2. **The range or the ordering last** — the `>=`, the *between*, the `OrderBy`.

That order is what lets one index answer *"this customer's orders, most recent first"* without
sorting anything afterwards.

**Never declare an index that is the left prefix of another one.** With
`(CustomerId, CreatedOn)` in place, an index on `(CustomerId)` adds write cost and serves
nothing new.

## Unique indexes: where a business rule becomes real

When a rule says *there cannot be two of these*, **the unique index is the only thing that
actually enforces it**: two requests read *no duplicate* at the same time and both write, and
only the index stops the second.

The rule needs two parts, and it is not enforced with fewer:

- **The `AnyAsync` pre-check before writing**, so an existing value comes back as the operation's
  own message instead of a database error.
- **The unique index**, which rejects the competing write both pre-checks passed. **Its scope
  has to match the query's**: tenant, normalisation, collation, null semantics, and any
  active-or-deleted condition. A constraint scoped differently from the check enforces a
  different rule than the one that was specified.

**The loser of that race is not caught at the save.** Its exception reaches the global
handler (`nzt-build-backend-dotnet-exceptions`), which answers with a clear message by type —
never by error number, constraint name or message text.

**Verify it with two independent contexts on the real relational provider**: synchronise them
after both pre-checks return false, then let both save, and assert one record and that the
loser's save throws. Bounded synchronisation, not sleeps. **The in-memory provider cannot
prove relational constraint behaviour** — a test that passes there proves nothing here. Also
check an update that leaves the unique value unchanged, an already-taken value and the scope
cases.

If the uniqueness holds only under a condition — unique **among the active ones** — that is a
**filtered index**, with the condition declared in the index. Without the filter the constraint
is wrong, and the workaround people reach for is deleting rows they wanted to keep.

## What an index costs

**Every index is paid on every write.** Insert, update and delete all maintain it, and the
storage grows. That is why none of the rules above is *index everything that is queried*: an
index serving a read that runs once a month slows down writes that run all day.

The two failure modes are symmetric and both are real:

- **Missing index** — one query degrades as the table grows, silently, until it times out.
- **Unnecessary index** — every write on that table is slower, forever, and nothing points at
  the cause.

In doubt, the deciding question is **how often that read runs and how big the table gets**, not
how important the column looks.

## Closing checklist

- [ ] Every index declared traces back to **a query that exists**, or to a business uniqueness
      rule.
- [ ] Composites put equality first and the range or ordering last, and no index is the left
      prefix of another.
- [ ] A uniqueness rule has its pre-check and its unique index with matching scope, and the
      race is left to the global handler, not caught at the save.
- [ ] Concurrency was verified with two contexts on the real provider, or the verification is
      reported as pending.
- [ ] Conditional uniqueness uses a **filtered index**, with the condition in the index.
- [ ] No index on a projection-only column, on a small table, or on a low-cardinality column by
      itself.
- [ ] It was declared in the entity configuration file and reached the database through a
      generated migration.
