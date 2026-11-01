# Test data — setup and teardown

Produces two scripts per scenario, written **with the plan** and approved with it:
`testing/data/<story>/E-NN-setup.<ext>` and `E-NN-teardown.<ext>` (`.sql`, `.http`, `.sh`…).
Creating a precondition is part of running a scenario: `blocked` is for what you cannot
resolve, never for what you did not think to create.

## The mechanism

`tech.md`'s Test data opt-in: read it, do not ask. Missing → asked once, in the plan, with
engine and environment named, and written back into `tech.md`.

| Mechanism | Cheapest when | Cannot reach | Costs |
|---|---|---|---|
| The project's own seeding (fixtures, factories, seed migration) | it exists | what it was not built to seed | reading it |
| Through the product's own interface | the product can produce the state | states it refuses (expired, inconsistent, enormous) | one call per record |
| Direct writes by the agent against the store | volume, impossible states, many reruns | what is not in that store (files, third parties, caches) | access to a non-production environment |
| Scripts the user runs | no access, or not your environment | — | one round trip: batch the whole run |

Reuse before you write. Direct writes can create states the product's rules never allow — say
so when proposing them. Not being authorised to execute never blocks: the script is handed
over with what to run, where, and what to send back.

## Writing the pair

1. **Setup** creates exactly what the preconditions name, with the scenario's values.
2. **Teardown is written at the same time** and deletes **only by the mark** the setup made
   (`NZT-E02-…` codes, names, collected ids). Never `TRUNCATE`, `DROP` or a condition wider
   than the mark. Children before parents.
3. Setup is re-runnable (clears its own mark first, or fails on collision). Values are
   deterministic.
4. Rows every scenario reads get `_shared-setup` / `_shared-teardown` per story; nothing else
   is shared.

## Boundaries

The plan's environment, **never production**. Real users' records are never test data and
never deleted. Credentials come from the configured environment, never the chat or a script.
Material effects of creating data (welcome mail, webhook, charge) are declared.

## Around the run

Setup → verify the precondition → run → **teardown whether it passed or failed** → record:

```markdown
- **Data:** `data/US-002/E-02-setup.sql` — 1 customer, order of $10.000, coupon
  `NZT-E02-INVIERNO20`. Mechanism: SQL by the agent against `dev`.
- **Cleanup:** `data/US-002/E-02-teardown.sql` — run 2026-09-17, ok.
```

Pending cleanup is written as such (`Cleanup: pending — 3 orders tagged NZT-E02 left in dev`)
and stays in the testing index until gone. Scripts the user runs are recorded as theirs.

## Done when

Someone could run the scenario tomorrow from a clean environment and leave it as clean.
