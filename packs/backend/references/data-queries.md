# Data queries — reading

**Ask the database for exactly what the response needs** — no more columns, rows or round
trips. **The unexecuted query never leaves the method that built it** (the use case, or the
repository method); a DTO or an entity comes out.

## Rules

1. **Project to the response DTO inside the query** — the default. A related field comes
   through the relationship and a count comes back as a number, with nothing loaded or
   tracked. Prefer an explicit projection over a mapping helper at the end, which can run in
   memory.
2. **Load entities only when the query cannot express the read** (a result composed from two
   queries, data deciding what to read next) — not because it is comfortable. Then untracked,
   only the related data used, mapped at the end.
3. **Sibling collections multiply rows** (10 lines × 5 shipments = 50). Splitting into one
   query per collection trades duplication for round trips and consistency: decide per query.
   A consistent snapshot uses the provider's strategy, not a transaction around every read.
4. **Optional filters chain**, each added only when its value arrived, executed once. A
   performance claim about the alternative is settled with the generated query and the plan,
   never the code's shape.
5. **Filter, order and page on the server, in that order**; materialise after.
6. **The operator for the intent**:

   | Intent | Ask for | Not |
   |---|---|---|
   | does it exist? | an existence check | count and compare, or fetch the row |
   | one by unique key | the first match | a single-match operator (fetches a second row) |
   | one, absence is an error | the first match and a failed Result when absent | an operator that throws |
   | how many? | a count | materialise and count |
   | a single value | the aggregate in the database | rows aggregated in memory |

   Single-match only where duplicates are possible and finding them matters.
7. **Never materialise to make a translation failure go away.** Necessary in-memory work
   selects only its inputs and bounds them first.
8. **A raw query only when the query language cannot express it** (an untranslated function, a
   CTE, a window function), **always parameterised** — no concatenation, no pasted value.

## Done when

Every read projects or justifies its load, filters and pages on the server, uses the operator
for its intent, and no unexecuted query leaves its method.
