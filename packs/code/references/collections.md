# Collections in memory

A collection read, transformed or checked **in memory**. A query the database runs is the
data pack's, even written with the same operators. **One style of collection operations
across the codebase** — the one the code already uses.

## Rules

1. **Existence and counting**: a materialised collection uses its size; a lazy sequence asks
   whether *any* element exists, which stops at the first. Pass the predicate to the operator
   (*any matching*, *count matching*), never filter first.
2. **Enumerate once.** A chain is a recipe: enumerating it twice runs it twice, and on a
   changing source answers twice differently. Materialise once, when the result is needed
   more than once — never mid-chain: **filter first, materialise last**.
3. **Order of operations**: filter before sorting when that keeps the result. **Never move a
   filter across a paging step or a grouping** — there it changes which elements are chosen.
4. **Lookups instead of nested loops**: a repeated search over m candidates for n items is
   O(n × m). Build a set or map once — a multi-map when the key repeats — and look up each.
5. **The operator says the intent**:

   | Intent | Operator |
   |---|---|
   | largest or smallest by a key | max-by / min-by, never sort-then-first |
   | exactly one, two is a bug | single-element, failing on two |
   | the first, more is fine | first-element |
   | distinct by a field | distinct-by |
   | elements of one type, or the non-absent ones | filter by type, typed, no absence asserted away |

   Operators that fail on empty only where empty is impossible; otherwise handle absence.
6. **Never return null for a sequence** — an empty one.

## Done when

No chain runs twice, no filter crosses paging or grouping, no search runs inside a loop, and
no method returns null for a sequence.
