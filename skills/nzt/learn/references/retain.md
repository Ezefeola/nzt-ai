# Retain — reviews, because forgetting is the default

Produces the review dates in `Learn/<topic>/progress.md` and the short sessions that run them.

## The ladder

**1 day → 3 days → 1 week → 3 weeks → 2 months**, per `OA-NN`, never per topic.

1. A new verdict enters at the first step, one day after it was written.
2. A review that goes well advances one step; one that goes badly returns to the **start**.
3. After the last step the objective stays on the longest interval, with its date.
4. **Straight to the shortest interval**, whatever the step: wrong with high confidence;
   `solved by the system`; `not achieved` once re-taught.

## Running reviews

1. **At session start, offer the overdue ones before new material**, as a batch with a size —
   "three reviews, about ten minutes". The person may skip them, never without knowing. A
   skipped review stays overdue and is offered again.
2. **A review asks them to retrieve; it never reopens the lesson.** Re-reading together
   restores fluency for an hour and changes nothing.
3. Three or four retrievals, each a new case. Ask confidence on anything wrong: `high /
   wrong` earns the same jump.
4. A failed retrieval is the review working: back to the start of the ladder; re-teach only
   after it fails twice.
5. **Write a log line for every review** — passed, failed or skipped — as its evidence (no
   file of its own), and keep exactly one **Next review** date per objective.

```markdown
| OA-02 | achieved | log 2026-10-02 · review, new case, unaided | 2026-10-23 |

- 2026-10-02 · OA-02 · review at 1 week, new case. Retrieved unaided. Advances to 3 weeks.
- 2026-10-02 · OA-01 · review at 3 weeks. Could not rebuild the mapping; high confidence
  first. Back to 1 day.
```

## Done when

Every objective with a verdict has exactly one future date, the jump cases sit at the
shortest interval, and the overdue ones were offered by name and size before anything new.
