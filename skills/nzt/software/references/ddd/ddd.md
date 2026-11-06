# DDD entities and aggregates in code

**The entity protects its own invariants**: what must always be true about a thing is enforced
by the thing. Persistence (repositories or direct) is another axis and works with all of this;
mapping is the data pack's, folders the architecture's.

**`tech.md`'s DDD line decides how far this goes.** A piece not `yes` is not built, and a
missing line builds none: no value object (the field stays primitive, checked by the entity),
no domain event (a reaction elsewhere is the use case's), no id wrapper.

## Rules

1. **An entity has identity; its id is a primitive** (number or UUID) unless *typed ids yes* —
   a wrapper is a conversion at every boundary.
2. **The aggregate is the consistency boundary**: entities that change together, loaded,
   changed and saved as a unit.
3. **Only its root is named from outside**: nothing loads a line without its order.
4. **State is writable only from inside; collections are exposed read-only.** What changes from
   outside without a method is an unprotected invariant.
5. **`Rules` and `Errors` live on the entity the rule is about**: the values a rule fixes and
   the messages, in the story's language.
   - Every layer cites them — the validator, the mapping's column length, the use case — and
     declares none of its own.
   - A rule about a value the entity does not store (a password behind a hash) is still the
     entity's; a failure naming no business concept is the operation's.
6. **Between aggregates, only the id**: `Order` carries `CustomerId`, no `Customer`; data from
   another aggregate is a second read (the mapping: the data pack's).
7. **Layout, in order**: what closes construction from outside · `Rules` · `Errors` ·
   properties · the creation entry · behaviour.
8. **Create through one entry that validates, then builds**, returning the errors and the
   entity, which exists only without errors. Nothing else builds it; values are set by name.
9. **The use case checks the entity, not the error list.**
10. **A method that changes the aggregate returns its errors** (empty means it worked), named
    after the operation (`Cancel`, `AddLine`), never `SetStatus`.
11. **The domain never throws for an expected failure** and knows no HTTP, `Result`,
    persistence or I/O.

   | Check | Where |
   |---|---|
   | the input's shape | the operation's validator, first |
   | what must be true about the thing | the entity: creation entry or method |
   | what depends on other aggregates or the outside | the use case, before calling the domain |

12. **Load the minimum aggregate**: the part the operation decides on and changes — never forty
   thousand lines to cancel an order. **An invariant over a whole collection (total, count,
   max) is never computed over a partial load**: compute it in the database and pass it in; load
   the collection whole only when nothing faster answers.

## Done when

Every rule holds for the entities and aggregates you wrote.
