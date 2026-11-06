# Data indexes — which ones, and in what shape

Declared in the entity's configuration, reaching the database through a generated migration.
**The query decides the index, not the entity.**

## Rules

1. **Which columns**, from the queries on that table — the new one and those already there:

   | The column appears in | Index? |
   |---|---|
   | a filter on a growing table | yes — the main case |
   | a join or foreign key | check: some libraries and engines index it by convention |
   | an ordering over many rows, with paging | yes, usually in a composite |
   | a business uniqueness rule | yes, unique |
   | only the projection, or a table that stays small | no |

2. **Low cardinality alone** (a boolean, a skewed status) earns no index; it helps inside a
   composite or a filtered index.
3. **A composite puts equality columns first**, the range or ordering last
   (`(CustomerId, CreatedOn)`).
4. **Never an index that is the left prefix of another.**
5. **A uniqueness index has the pre-check's scope** (`errors.md`): tenant, normalisation,
   collation, nulls, active or deleted. Unique *among the active ones* is a filtered index.
6. **Test uniqueness on the real engine with two connections**: both pre-checks return false,
   then both save; one record exists and the loser fails. Bounded synchronisation, not sleeps;
   an in-memory fake proves nothing. Also an update keeping its value, a taken value, the
   scope cases. Not run: report it pending.
7. **Every index is paid on every write**: decide by how often the read runs and how big the
   table gets.

## Done when

Every index traces to a query or a uniqueness rule, and every rule holds.
