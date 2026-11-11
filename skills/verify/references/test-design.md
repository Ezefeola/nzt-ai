# Test design

Produces the pre-run half of `Plan/specs/<feature>/testing/<story>.md`: scenarios, data,
expected results and material effects — **approved before anything runs**.

## Steps

1. **Take the expected result from the requirement.** A scenario no requirement supports is
   a question when it fails, not a defect.
2. **Derive cases by the rule's shape**:

   | The rule looks like | Technique |
   |---|---|
   | ranges or categories | equivalence partitions — one case per class |
   | a threshold | boundary values — at, under, over |
   | combining conditions | decision table — every combination that changes the outcome |
   | a lifecycle | state transitions — legal ones and the illegal one |
   | many independent parameters | pairwise |
   | a goal across screens | use-case walkthrough, with interruptions |

3. **Adapt to the target**: against an interface — edges, the same call by someone who may
   not, the error shape, what was stored; against the screen — the task from where the user
   starts, loading/empty/error states, reachability, whether messages mean something. One
   case on both where they could disagree (hiding an action is not enforcing it).
4. **Look for what no technique generates**: someone else's resource; repeated or concurrent
   (double submit); the interrupted flow (closed, expired session, back, refresh); empty and
   enormous data; a dependency down or slow.
5. **Prioritise by impact × likelihood**; security and data loss are high impact even when
   rare. What will not be run is named as a gap with its priority.
6. **Write traceability both ways** — a criterion with none says **no scenario**; a scenario
   tracing to no criterion is resolved before running:

   ```markdown
   ## Coverage
   | Criterion | Scenarios | State |
   |---|---|---|
   | US-002 CA-01 | E-01, E-02 | pending |
   | US-002 CA-02 | — | **no scenario** |
   ```

7. **Write each scenario**:

   ```markdown
   ### E-02 · An expired coupon leaves the total untouched
   - **Covers:** US-002 CA-01 (RN-cupon-vencido)
   - **Target:** interface, with the project's HTTP client
   - **Data:** order of $10.000; coupon `NZT-E02-INVIERNO20`, expired 2026-05-01
   - **Preconditions:** the customer is logged in with an order in progress
   - **Setup / cleanup:** `data/US-002/E-02-setup.sql` · `data/US-002/E-02-teardown.sql`
   - **Steps:** apply the code at checkout
   - **Expected:** the total stays $10.000 and the coupon is reported as expired
   - **Material effects:** none
   - **State:** pending
   ```

   Data is the criterion's. Material effects (payments, messages, deletions) are declared; an
   unknown destination blocks that scenario. States: `pending`, `passed`, `failed`,
   `blocked` (always with its cause). Missing data gets its two scripts now (`test-data.md`).
8. **Show the whole set and stop.** One approval covers every scenario.

## Done when

Someone else could run the set exactly as written and reach your verdicts.
