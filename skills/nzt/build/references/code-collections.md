# Collections in memory

## Contents
- Existence and counting
- Enumerate once
- Order of operations
- Lookups instead of nested loops
- Pick the operator that says what you mean
- Never return null for a sequence
- Closing checklist

This is a collection read, transformed or checked **in memory**. A query the database runs is
the data access guidance's, even when it is written with the same operators.

**One style of collection operations across a codebase**: whichever the stack and the code
already use, the same one everywhere, so there is one thing to read.

## Existence and counting

**On a materialised collection — anything that knows its size — use the size.** On a lazy
sequence it is the other way round: **ask whether any element exists**, which stops at the
first one, instead of counting, which can walk the whole sequence.

With a predicate, pass it to the operator instead of filtering first: *count matching*, *any
matching*, *first matching* — not *filter, then count*.

## Enumerate once

**A chain is a recipe, not a result.** Enumerating it twice runs it twice — twice the work,
and with a changing source, twice a different answer.

Materialise **once**, when the result is needed more than once. Mid-chain, materialising does
the opposite: it pulls the whole set into memory so the next operator can filter it. **Filter
first, materialise last.**

## Order of operations

Filter before sorting when that preserves the result, and place the projection according to
what the later operators need.

**Never move a filter across a paging step or a grouping**: there it changes which elements
are selected, and the result is wrong rather than slower. Treat *filter, sort, project* as
useful, not universal.

## Lookups instead of nested loops

A repeated linear search over m candidates for n items costs O(n × m). **Build a set or a map
once and look up each item in it**: one hash lookup per item. A map when the matching element
is needed, a multi-map when the key can repeat.

## Pick the operator that says what you mean

| Intent | Say it with |
|---|---|
| The largest or smallest by a key | a max-by or min-by, never sorting to take the first |
| Exactly one, and more than one is a bug | a single-element operator that fails on two |
| The first, and more than one is fine | a first-element operator |
| Distinct by a field | a distinct-by |
| The elements of one type, or the non-absent ones | a filter by type, typed, without asserting absence away |

Operators that fail on an empty sequence are used only where empty is genuinely impossible;
prefer handling the absence.

## Never return null for a sequence

An empty collection is an empty collection. **A null sequence turns every caller into a null
check that someone will forget.**

## Closing checklist

- [ ] One style of collection operations everywhere.
- [ ] The size for a materialised collection, *any* for a lazy one, predicates passed to the
      operator.
- [ ] No chain enumerated twice, nothing materialised mid-chain.
- [ ] No filter moved across paging or grouping.
- [ ] No search inside a loop where a set or a map does it in one pass.
- [ ] Max-by or min-by instead of sorting to take one; a type filter instead of asserting
      absence away.
- [ ] No method returns `null` in place of an empty sequence.
