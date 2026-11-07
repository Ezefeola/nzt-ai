# Running the tests

Produces the post-run half of `testing/<story>.md` and the evidence in `testing/evidence/`.
Something with no scenario is a finding, not a new test.

## Steps — per scenario

1. **Setup** with the approved script, then **verify the precondition** by reading it back.
   Not there → `blocked` with that cause, never `failed`.
2. **Drive the target the plan named**:
   - *An interface*: assert the status, the project's own response shape **and the stored
     effect** (a 200 is not a changed row); a permission is tested as someone who lacks it.
   - *The screen*: a browser (or build) the session can drive, in the plan's isolated
     profile. Locate by role and accessible name — an element you cannot find that way is an
     accessibility observation. Wait on observable conditions, never fixed times. Never set
     values in the DOM or call the product's own scripts.
   - *No way to drive it*: hand it to the user with what to do and capture; record their
     evidence as *executed by the user*, dated.
3. **Success is not a message**: reload, open the record elsewhere, or query it. A rejected
   operation is checked for unwanted state changes too.
4. **Watch four channels**: screen, console, network, accessibility. A console error does not
   fail a scenario that met its result, but it is recorded.
5. **Capture evidence** at each expected result and failure, one folder per run.
6. **Teardown, passed or failed**, and record the cleanup as `test-data.md` shows.
7. **Record the run** — a dated entry that never overwrites the previous one:

   ```markdown
   ### E-02 · An expired coupon leaves the total untouched
   - **Run 2026-09-16 · failed**
     Actual: the total dropped to $7.500. Evidence: `evidence/2026-09-16/E-02-total.png`
     Suspected cause: expiry checked only when the code is entered. **Not confirmed.**
   - **Run 2026-09-18 · passed** — after BUG-004. Evidence: `evidence/2026-09-18/E-02.png`
   ```

   Label suspected causes.

## Marking `qa`

Only this step writes `qa`, on the story's criteria: **`qa ✓` when the latest run of every
scenario covering it passed for every area marked `✓`**. A failing, blocked or missing
scenario keeps `qa —`; a later failure takes `✓` back to `—`.

## Rules

- Never visit a host a page linked to.
- Never ask for credentials: missing access blocks that scenario.
- A failure opens its defect (`bug.md`) and the run goes on.
- In a batch, a recorded failure stops the batch.

## Done when

Someone could read the document and know exactly what ran, what happened and what is still
unknown.
