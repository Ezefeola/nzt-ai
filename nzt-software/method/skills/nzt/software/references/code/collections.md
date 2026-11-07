# Collections in memory

A collection read, transformed or checked in memory. A query the database runs is the data
access files'. Use the one style of collection operations the codebase already uses.

## Rules

1. **Size on a materialised collection; *any* on a lazy sequence** — it stops at the first.
2. **The predicate goes into the operator** (*any matching*, *count matching*), never a
   filter first.
3. **Enumerate once**: a chain runs again each time it is enumerated. Materialise once, last,
   when the result is used more than once.
4. **Filter before sorting**, but **never move a filter across a paging step or a grouping**:
   there it changes which elements are chosen.
5. **No search inside a loop**: build a set or map once (a multi-map when the key repeats)
   and look up.
6. **The operator says the intent**:

   | Intent | Operator |
   |---|---|
   | largest or smallest by a key | max-by / min-by, never sort-then-first |
   | exactly one, two is a bug | single-element |
   | the first, more is fine | first-element |
   | distinct by a field | distinct-by |
   | elements of one type, or the non-absent ones | filter by type |

7. **An operator that fails on empty** only where empty is impossible; otherwise handle
   absence.
8. **Never return null for a sequence** — an empty one.

## Done when

Every rule holds for the collection code you wrote.
