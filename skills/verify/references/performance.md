# Performance as the user feels it

Produces a measured baseline, the located cause of what is slow, and proposals with the
numbers behind them. **It changes nothing.** Numbers live in the story's `testing/<story>.md`,
or `testing/performance.md` when no single story owns them; captures in the run's evidence.

## Steps

1. **Measure against a requirement**: the non-functional requirement is the number to beat.
   None → a baseline, and the target is a question (*"2.4 s at 5,000 orders — acceptable?"*).
   Never invent a threshold. Design it like a scenario and get it approved.
2. **Measure what the user waits for** — from the action to a usable answer, transfer and
   render included; the server's number only locates the cost.
   - p50 and p95 over repeated runs, never an average.
   - The environment always stated; numbers compare only with themselves.
   - Realistic volume, generated and torn down via `test-data.md`.
   - Cold and warm measured separately.
3. **Locate where the time goes** before proposing:

   | Where | Signal | Usually |
   |---|---|---|
   | data access | a query per item, scans, unsupported sorts | N+1, missing index |
   | payload | far more than what is shown | nothing projected |
   | round trips | many sequential calls for one view | asking one thing at a time |
   | render or frame | time after the data arrived | too many elements, work repeated per item |

4. **Check what the user feels**: loading/empty/error states appear, and when; early partial
   results are recorded as *perceived*, never as a speedup. A spinner fixes no query. An
   action with no visible result invites double submits — that is a defect (`bug.md`).
5. **Propose**, each finding landing where it belongs: a `nzt-build` unit closing with before
   and after; a deferred `tech-debt.md` entry with the numbers; a missing requirement for
   `nzt-discovery`; a structural cost for `nzt-architecture`'s review; production-only
   behavior for `nzt-ship`'s observability.

## Rules

- No optimisation without a before and after measured the same way.
- No measured gain → revert.
- Never change behavior to go faster.
- Production is measured only with authorisation naming it.

## Done when

Someone could repeat the measurement, land on the same number, and act on a finding without
measuring again.
