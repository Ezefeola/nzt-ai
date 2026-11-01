# Data writes — staging and saving

A write is **changes staged and saved once**. Many rows by criteria is `data-bulk.md`.

## Rules

1. **Insert adds** one entity at a time (several is still not a bulk insert).
2. **Update loads, changes, saves**: never marks a tracked entity modified as a whole, never
   writes columns the operation did not touch.
3. **Delete removes the loaded entity.**
4. **Load only what will be changed.** Loading to check existence, count children or only to
   delete is a query or a statement by criteria.
5. **One save, at the end.** Where the save is atomic by default, no manual transaction
   around it, and the default never turned off. It covers that save, not earlier reads or
   external effects.
6. **An explicit transaction only for two writes that must land together and cannot be one
   save** (a generated id needed for the next step, a statement by criteria mixed with staged
   changes), with a comment saying why.
   - Open, write, commit; the language's disposal pattern rolls back.
   - No catch to roll back, log and rethrow; never commit after a failure or per step.
7. **Check before saving, never catch the save** (`errors.md`), the concurrency token
   included.
8. **Idempotency is a policy decided per operation.**

## Done when

Every rule holds for the writes you wrote.
