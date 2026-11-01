# Data writes — staging and saving

A write is **changes staged and saved once**. Many rows by criteria is `data-bulk.md`.

## Rules

1. **One entity at a time**: insert adds (several is still not a bulk insert); update loads,
   changes, saves — never marking a tracked entity modified as a whole, never writing columns
   the operation did not touch; delete removes the loaded entity.
2. **Load only what will be changed.** Loading to check existence, count children or only to
   delete is a query or a statement by criteria.
3. **One save, at the end**, with the cancellation signal. Where the save is atomic by
   default, no manual transaction around it and the default never turned off — it covers that
   save, not earlier reads or external effects.
4. **An explicit transaction only for two writes that must land together and cannot be one
   save** (a generated id needed for the next step, a statement by criteria mixed with staged
   changes), with a comment saying why. Open, write, commit; the language's disposal pattern
   rolls back. No catch to roll back, log and rethrow; never commit after a failure or per
   step.
5. **Check before saving, never catch the save**: what the save could reject (a taken value,
   a stale version, dependants) is checked first and fails as a Result; the constraint stays.
   A race that passes the check reaches the global handler (`errors.md`) — no catch turning it
   into a Result, no error classifier, no catch for the concurrency token either.
6. Idempotency is a policy decided per operation.

## Done when

Nothing untouched is written or loaded without use, each operation saves once, an explicit
transaction exists only for an unavoidable multi-write, and nothing catches the save.
