# Data indexes — which ones, and in what shape

Declared in the entity's configuration, reaching the database through a generated migration.
**The query decides the index, not the entity**: an index serves a read the code performs.

## Rules

1. **Which columns**, from the queries on that table — the new one and those already there:

   | The column appears in | Index? |
   |---|---|
   | a filter on a growing table | yes — the main case |
   | a join or foreign key | check: some libraries and engines index it by convention |
   | an ordering over many rows, with paging | yes, usually in a composite |
   | a business uniqueness rule | yes, unique |
   | only the projection, or a table that stays small | no |

   Low cardinality alone (a boolean, a skewed status) earns no index: it helps inside a
   composite or a filtered index.
2. **A composite is used from the left**: equality columns first, the range or ordering last
   (`(CustomerId, CreatedOn)` answers *this customer's orders, latest first*). Never an index
   that is the left prefix of another.
3. **Uniqueness takes two parts**: the existence pre-check (the operation's own message) and the
   unique index **with the same scope** — tenant, normalisation, collation, nulls, active or
   deleted. The race's loser reaches the global handler (`errors.md`), never caught at the
   save. Unique *among the active ones* is a **filtered index** with the condition in it.
4. **Verify uniqueness on the real engine with two connections**: both pre-checks return false,
   then both save; one record exists and the loser fails. Bounded synchronisation, not sleeps;
   an in-memory fake proves nothing. Also an update keeping its value, a taken value, the scope
   cases. Not run: report it pending.
5. **Every index is paid on every write.** Missing ones degrade a query until it times out;
   unnecessary ones slow every write forever. Decide by how often the read runs and how big the
   table gets.

## Done when

Every index traces to an existing query or a uniqueness rule, composites put equality first
with no left-prefix duplicates, and each uniqueness rule has a matching-scope index verified
on the real engine or reported pending.
