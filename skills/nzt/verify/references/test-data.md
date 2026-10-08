# Test data — setup and teardown

## Contents
- The data is yours to create
- Ask the mechanism once, not scenario by scenario
- Two scripts per scenario, written together
- The environment, and what is never touched
- Around the run
- Recording it
- Done when

Produces, per scenario, the two scripts that make it runnable and undoable:

```
Plan/specs/<feature>/testing/data/<story>/E-NN-setup.sql
Plan/specs/<feature>/testing/data/<story>/E-NN-teardown.sql
```

Both are written **with the plan, before anything runs**, and both are part of what the user
approves. The extension follows the mechanism: `.sql`, `.http`, `.sh`.

## The data is yours to create

A scenario declares its preconditions with concrete values; creating them is part of running
it. *"I have no expired coupon to test with"* is not a result — it is a coupon to create.
**`blocked` is for what you cannot resolve, never for what you did not think to create.**

## Ask the mechanism once, not scenario by scenario

How data gets created is the user's decision, and it is asked **in the plan**, with the
engine and the environment named — never mid-run, and never again once it is answered.

| Mechanism | Cheapest when | Cannot reach | What it costs |
|---|---|---|---|
| The project's own seeding — fixtures, factories, a seed migration | it already exists | whatever it was not built to seed | reading it first |
| Through the API under test | the product can produce the state itself | states the product refuses to produce: expired, migrated, inconsistent, enormous | one call per record, and a create endpoint that must exist |
| SQL the agent runs against the engine | volume, impossible states, and runs repeated many times | anything not held in the database: a file in storage, state in a third party, a cache | access to a non-production environment |
| SQL the user runs | you have no access to the engine, or the environment is not yours | — | one round trip: batch the whole run's data into one script |

- **Record the answer as an opt-in in the component's stack document** — `Test data: SQL
  scripts, run by the agent against <env>` — through `nzt-architecture-stack`. From then on
  it is read, not asked.
- **Reuse before you write.** If the project already seeds data, that mechanism wins; a
  hand-written insert that duplicates a factory rots the moment the schema moves.
- **Writing behind the product's back has a price, and you say it when you propose SQL:** it
  can create a row the application's own rules would never allow, and the scenario then
  proves something about a state that cannot exist. For a state the product *can* produce,
  its own entry point is the safer script.
- **Not being authorised to execute never becomes `blocked`.** The script is written either
  way and handed over: what to run, against which environment, and what to send back.

## Two scripts per scenario, written together

**Setup** creates everything the preconditions name, with the exact values the scenario
declares. **Teardown** deletes exactly what setup created, and nothing else.

- **Write the teardown at the same time as the setup**, never after the run. A cleanup
  written from memory deletes what you remember creating.
- **Mark every row you create** — a tag the scenario owns (`NZT-E02-…` in a code, a name or
  an e-mail), or the ids the setup collects — and let the teardown delete **by that mark
  only**. `DELETE FROM orders WHERE created_at > '2026-09-17'` deletes someone else's work.
- **Never `TRUNCATE`, never `DROP`, never a condition wider than the mark.** A teardown that
  can empty a table is a teardown that will.
- **Delete in the order the foreign keys demand**, children first, so a partial teardown
  fails loudly instead of leaving orphans.
- **The setup is re-runnable**: it either clears its own mark first or fails on the
  collision. A setup that half-ran on the previous attempt is why the next run lies.
- **Values are deterministic** — the ids, dates and amounts the criterion already gave you.
  Random data makes a failure impossible to reproduce.
- **Shared data gets its own pair**: `_shared-setup` / `_shared-teardown` per story, for the
  catalogue rows every scenario reads. Everything else stays per scenario — one that depends
  on another's leftovers passes alone and fails in a suite.

## The environment, and what is never touched

- **The environment is the one the plan names. Never production**, whatever the mechanism.
- **Real users' records are not test data.** Without explicit authorisation you do not
  create against them, and no teardown ever deletes a row you did not create.
- **Credentials come from the project's configured environment**, never from the chat and
  never inlined in a script that lands in the repository. Scripts are reviewed for secrets
  before they are saved, like any other evidence.
- **Creating data can have material effects** — a welcome e-mail, a webhook, a charge. It is
  declared in the scenario like any other, and an unknown destination blocks that scenario.

## Around the run

1. Run the setup.
2. **Verify the precondition; do not assume it.** Read the record back through an observable
   interface. A setup that executed is not a state that exists. If the precondition is not
   there, the scenario is **`blocked` with that cause — not `failed`**: nothing was tested.
3. Run the scenario.
4. **Run the teardown whether the scenario passed or failed.** A failed scenario leaves the
   most data behind, and it is the one everybody forgets.
5. **Record what was left behind.** A teardown that did not run, or ran halfway, is data
   debt with a name and a place, not silence.

When the user runs the scripts, their execution is recorded as theirs — *executed by the
user*, with the date — exactly like a scenario they ran.

## Recording it

```markdown
### E-02 · An expired coupon leaves the total untouched
- **Data:** `data/US-012/E-02-setup.sql` — 1 customer, 1 order of $10.000, coupon
  `NZT-E02-INVIERNO20` expired 2026-05-01. Mechanism: SQL, run by the agent against `dev`.
- **Cleanup:** `data/US-012/E-02-teardown.sql` — run 2026-09-17, ok.
```

- Cleanup pending is written as what it is:
  `Cleanup: pending — 3 orders tagged NZT-E02 left in dev`, and it stays in the testing
  index until it is gone.
- The scripts live as long as the scenario does. A scenario that is re-run uses the same
  pair; a changed precondition changes the script in the same unit.

## Done when

Rehearse it: could someone else run this scenario tomorrow, from a clean environment, and
leave it as clean as they found it?

- Every scenario whose preconditions do not already exist has its setup and its teardown,
  written before the run.
- The mechanism was agreed with the user and is recorded in the stack document.
- Every teardown deletes by the mark its setup created, and nothing wider.
- Preconditions were verified after the setup, not assumed.
- Every teardown that did not run is recorded as data debt, with where and what.
- No script carries a credential, and none of them points at production.
