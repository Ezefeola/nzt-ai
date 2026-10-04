# Retain — reviews, because forgetting is the default

Produces the review dates in `Learn/<topic>/progress.md` and the short sessions that run
them. A lesson with no follow-up is time spent at a loss, and the loss is invisible for
about a week.

## The ladder

**1 day → 3 days → 1 week → 3 weeks → 2 months.**

- A review that goes well **advances one step**.
- A review that goes badly **goes back to the beginning of the ladder** — not back one step.
  It failing means the interval was already too long for that objective.
- **Dates are per `OA-NN`, never per topic.** Objectives do not fade together, and a topic
  date makes the solid ones expensive and the fragile ones late.
- After the last step the objective is not finished; it is on the longest interval. Keep the
  date.

## Three cases jump the queue

Straight to the shortest interval, whatever step they were on:

| Case | Why |
|---|---|
| Wrong with **high confidence** | They are not going to check it again on their own |
| `solved by the system` | Nothing was consolidated — there is nothing to space out yet |
| `not achieved`, once re-taught | The re-teaching is new, and it is the fragile state |

`nzt-learn-tutor` and `nzt-learn-assess` produce these states; this skill is what makes them
cost something in the calendar.

## Running a review

**A review asks them to retrieve. It does not reopen the lesson.**

- Re-reading the material together is the failure mode: **it feels productive, it restores
  fluency for an hour, and it changes nothing.** Fluency is exactly the sensation this
  branch treats as suspect.
- **A different case each time.** The same case reviewed three times measures the case.
- **Short.** Three or four retrievals is a review; twenty is a session nobody comes back to,
  and the reviews stop happening at all.
- A retrieval that fails is not a wasted review — it is the review doing its job, and it
  tells you the truth on the spot. Note it, move that objective to the start of the ladder,
  and re-teach only if it fails twice.
- Ask for confidence on anything that comes back wrong. `high / wrong` at review time is the
  same dangerous cell, and it earns the same jump.

## Overdue reviews are offered, not imposed

At the start of a session, **say which reviews are overdue before starting new material.**

- The person with a deadline can skip them. **What they cannot do is skip them without
  knowing they existed** — that is the difference between a decision and a silence.
- **A skipped review stays overdue.** It is not rescheduled forward and it is not quietly
  dropped; the next session offers it again.
- Offer them as a batch with a size — *"three reviews, about ten minutes"* — so skipping or
  taking them is a real choice and not a vague obligation.

## What you write

```markdown
## Objectives
| OA-02 | achieved | reviews/2026-10-02 · new case, unaided | 2026-10-23 |

## Log
- 2026-10-02 · OA-02 · review at 1 week, new case. Retrieved unaided, named the cost.
  Advances to 3 weeks.
- 2026-10-02 · OA-01 · review at 3 weeks. Could not reconstruct the mapping; said high
  confidence first. Back to 1 day.
```

- The **Next review** column is the only date that matters; keep exactly one per objective.
- Every review writes a log line, including the ones that failed and the ones the person
  skipped. **The skipped ones are the record of a decision, and without them a topic looks
  reviewed when it was not.**
- The log is append-only, like every other line in this file.

## Done when

Every objective with a verdict has exactly one future date, the three jump cases are at the
shortest interval, and the overdue ones were offered — by name and with their size — before
anything new was taught in this session.
