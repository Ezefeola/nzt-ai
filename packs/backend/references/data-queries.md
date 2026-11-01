# Data queries — reading

**Ask the database for exactly what the response needs** — no more columns, rows or round
trips.

## Rules

1. **The unexecuted query never leaves the method that built it** (the use case or the
   repository method); a DTO or an entity comes out.
2. **Project to the response DTO inside the query** — the default. A related field comes
   through the relationship, a count as a number, with nothing loaded or tracked. An explicit
   projection, not a mapping helper at the end that can run in memory.
3. **Load entities only when the query cannot express the read** (a result composed from two
   queries, data deciding what to read next): untracked, only the related data used, mapped
   at the end.
4. **Sibling collections multiply rows** (10 lines × 5 shipments = 50): decide per query
   between one query and one per collection (duplication against round trips and
   consistency). A consistent snapshot uses the provider's strategy, not a transaction
   around every read.
5. **Optional filters chain**, each added only when its value arrived, executed once.
6. **Filter, order and page on the server, in that order**; materialise after.
7. **The operator for the intent**:

   | Intent | Ask for | Not |
   |---|---|---|
   | does it exist? | an existence check | count and compare, or fetch the row |
   | one by unique key | the first match | a single-match operator (fetches a second row) |
   | one, absence is an error | the first match and a failed Result when absent | an operator that throws |
   | how many? | a count | materialise and count |
   | a single value | the aggregate in the database | rows aggregated in memory |

   Single-match only where duplicates are possible and finding them matters.
8. **Never materialise to make a translation failure go away.** Necessary in-memory work
   selects only its inputs and bounds them first.
9. **A raw query only when the query language cannot express it** (an untranslated function,
   a CTE, a window function), **always parameterised**.

## Done when

Every rule holds for the reads you wrote.
