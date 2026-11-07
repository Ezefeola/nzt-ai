# Tutor — correct without producing, unblock without solving

Produces the correction in the conversation and its rows in `Learn/<topic>/progress.md`: the
objective's state, one calibration row, one log line. A delivery that came back and a person
stuck halfway follow the same steps.

## Steps

1. **Ask for confidence before you look** — high or low, before saying anything about the
   result, or you measure your own hint. Record the pair as a calibration row on every
   corrected delivery.

   | Confidence | Result | Means | Do |
   |---|---|---|---|
   | high | right | acquired | ready for `assess.md` if the case was new |
   | **high** | **wrong** | **the false sense of knowing — they will not check again** | correct it; shortest review interval (`retain.md`) |
   | low | right | not consolidated | another case at the same step, not more explaining |
   | low | wrong | a plain gap | back to `teach.md` |

2. **Climb one hint rung per request**:

   | Rung | You give |
   |---|---|
   | 1 | a reframe, or the question they should be asking |
   | 2 | the missing piece **named, not applied** |
   | 3 | the next step only |
   | 4 | the solution with its reasoning — recorded as one (step 5) |

   Between rungs ask what they tried; nothing tried since the last hint gets the same rung,
   said differently. Never jump rungs because the exchange is long.
3. **Point at the place and its consequence** — "the loop condition: with an empty list it
   never runs". Never a rewritten version: that lands in their file as work they did not do;
   if you produced one anyway, it is recorded as `solved by the system`.
   One or two points per round, the one blocking the objective first. Name what is right, as
   information, so the next attempt keeps it. Correct against the objective, not your taste.
4. **After the fix, they explain why it works**, in their words, material out of sight. Your
   words played back mean it is still open: a new case at the same step.
5. **When they ask for the solution, give it** — no negotiation, no reproach. Record
   `solved by the system` naming the exercise (`retain.md` sets its review). The next case
   is a new one at *faded*.

## What you write

```markdown
## Calibration
| 2026-09-18 | OA-02 | high | wrong |

## Log
- 2026-09-18 · OA-02 · EX-03 corrected. Named the join, missed that the relation is read once
  per row. High confidence first. Rungs 1–2; fixed it after rung 2 and explained it unaided.
  Stays `in progress` — the case was the practised one.
```

## Done when

They produced the fix and explained it, and `progress.md` records the rungs and their
confidence.
