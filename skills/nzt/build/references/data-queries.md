# Data queries — reading

## Contents
- Project to the response inside the query
- When loading the entity is the right call instead
- Optional filters chain onto the query
- The operator for the intent
- Moving work to memory is deliberate or it is a bug
- Raw queries
- Closing checklist

This is **reading**. Two rules frame everything below:

> **Ask the database for exactly what the response needs — no more columns, no more rows, no
> more round trips.**
>
> **The unexecuted query never leaves the method that built it** — the use case with direct
> persistence, the repository method where there is one. It is built, executed and
> materialised in the same place; what comes back out is a DTO or an entity.

## Project to the response inside the query

**The default is projecting to the response DTO as part of the query**, so the database
returns only the columns the response carries: no eager loading of related entities, no
entities materialised, nothing tracked.

What the projection does for free: **a related field comes through the relationship without
loading it**, and **a count comes back as a number instead of loading the collection**. That
is where a read is won.

Prefer an explicit projection over handing a whole entity to a mapping helper at the end of
the query: the helper can run in memory and materialise more than intended. It is an
efficiency convention, not a ban — inspect which columns the projection actually needs.

## When loading the entity is the right call instead

Projection is the default, **not a prohibition**. Loading entities is justified when the read
genuinely cannot be expressed as one projected query — a result composed in memory from two
queries, or a case where the entity's data decides what to read next. **The bar is *the query
cannot express it*, not *this is more comfortable*.**

Then: load without tracking where the library tracks, load only the related data that will be
used, and map at the end.

**Sibling collection joins multiply rows**: 10 lines and 5 shipments on one order can come
back as 50. Splitting the read into one query per collection removes the duplication at the
cost of extra round trips, buffering and consistency across separate reads — decide it per
query, not because two collections exist. If a consistent snapshot is required, choose the
query or isolation strategy the provider offers; do not wrap every read in a transaction by
default.

## Optional filters chain onto the query

A listing whose filters may or may not arrive is built step by step — a filter added only when
its value arrived — and executed once.

This is the readability convention, and it is not justified by claiming that *filter is null
or column equals filter* always plans badly: simplification and index use depend on the
provider, the parameters and the database. **A performance claim is settled with the generated
query, the actual plan and representative data**, never with the shape of the code.

Keep filtering, ordering and paging **on the server, in that order**. Moving a filter after the
page is taken changes what it means. Materialise only once the server-side work is done.

## The operator for the intent

| Intent | Ask the database for | Not |
|---|---|---|
| Does it exist? | an existence check | counting and comparing to zero, or fetching the row to check for absence |
| Get one by a unique key | the first match | a single-match operator, which fetches a second row to prove there is none |
| Get one, absence is an error | the first match, and a failed Result when absent | an operator that throws when the row is missing |
| How many? | a count | materialising the list and counting it |
| A single value | the aggregate — sum, max, min | bringing rows back to aggregate in memory |

The single-match operator earns its extra row only where duplicates are genuinely possible and
finding them matters — with a unique index in place, the first match is the honest one.

## Moving work to memory is deliberate or it is a bug

**Never materialise the query to make a translation failure go away** — that moves the whole
table into memory to run one comparison. When in-memory computation is genuinely necessary,
select only its inputs and bound the result before materialising.

## Raw queries

**The library's query language is the normal path.** A raw query is written **only when that
language cannot express the query**: an engine function it does not translate, a common table
expression, a window function. Forbidding it outright is worse: it pushes people to fetch extra
rows and filter in memory.

**Always parameterised.** **String concatenation never appears in a query**, and neither does a
value pasted into the text.

## Closing checklist

- [ ] The query projects to its response DTO, untracked, with no eager loading where a
      projection would do.
- [ ] Any entity load is justified by the query being unable to express the read; one query or
      one per collection accounts for duplication, round trips and read consistency.
- [ ] Optional filters chain; filter, order and page ran on the server, in that order.
- [ ] The operator matches the intent: an existence check, the first match over a single
      match, aggregates in the database.
- [ ] No materialisation added to hide a translation failure.
- [ ] A raw query only where the query language cannot express it, and always parameterised.
- [ ] The unexecuted query did not leave the method that built it.
