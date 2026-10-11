# Data writes — staging and saving

A write is **changes staged and saved once**. What the save cannot express set-based — many
rows by criteria — belongs to the guidance on operations by criteria (`data-bulk.md`).

## One entity at a time

- **Insert:** add the new entity, or several. Adding several is a readability convention, not a
  database bulk insert.
- **Update:** load it, change the properties, save. **Nothing writes columns the operation
  never touched** — where the library tracks changes, an entity already tracked is not marked
  modified as a whole.
- **Delete:** remove the loaded entity.

**Nothing is loaded that is not going to be used.** Loading an entity to check that it exists,
to count its children, or only to delete it pays a full materialisation for an answer the
database could have given directly — that is a query, or a statement by criteria.

## One save, at the end

**Accumulate the changes and save once.** Where the provider supports transactions and the save
is atomic by default, **do not add a manual transaction or turn that default off**. The
guarantee covers that save — not earlier reads, not external side effects.

An explicit transaction is written **only when an operation cannot avoid two writes that must
land together**: it needs a database-generated id before it can build the next step, or it
mixes a statement by criteria with staged changes. That is the exception, it is visible, and it
is worth a comment saying why.

When it is needed it is **opened, the writes run, and it is committed**, with the language's
disposal pattern rolling back what was not committed. Do not add a catch just to roll back, log
and rethrow: that is three lines whose only effect is to make the failure path longer.
Unexpected failures propagate to the global handler. **Never commit after a failure, and never
commit each step on its own** — a later failure would leave half the work done.

## Check before saving, never catch the save

**What the save could reject is checked before it, and fails as a Result**: a value already
taken with an existence check, a stale version against the one the client sent, dependants
before a delete. The constraint in the database stays — it is what makes the rule true.

**The save is not wrapped in a `try/catch`.** A competing write can still pass the check; when
it does, the exception propagates to the global handler (`backend-errors.md`), which answers
with a clear message by exception type.

- **No catch that turns the race into the pre-check's Result.**
- **No classifier of provider errors**: no error numbers, no constraint names, no matching on
  the message text.
- **The concurrency failure is not caught either.** With a concurrency token, the version is
  compared before saving; the token only catches the race, and the race goes to the handler.

Idempotency is its own policy, decided per operation.

## Closing checklist

- [ ] Entities to modify were loaded to be changed, and no untouched column is written.
- [ ] Nothing was loaded without a use; many rows by criteria went to a statement by criteria.
- [ ] One save at the end, with the cancellation, and no manual transaction around it.
- [ ] An explicit transaction exists only for an unavoidable multi-write, commits only after
      success, and is disposed on failure without a catch that only rethrows.
- [ ] What the save could reject was checked before it and failed as a `Result`, with the
      database constraint still in place.
- [ ] The save is not inside a `try/catch`; races and unknown failures reach the global
      handler, and nothing classifies provider errors.
