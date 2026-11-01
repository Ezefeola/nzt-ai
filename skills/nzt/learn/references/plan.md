# Curriculum and progress record

Produces the two files a topic lives by: `Learn/<topic>/curriculum.md` (purpose, starting
point, what was agreed, the `OA-NN` objectives) and `Learn/<topic>/progress.md` (the record
every other reference writes into). `<topic>` is a lowercase slug that never changes.

## Steps

1. **Probe, do not ask what they know** — "how much do you know?" returns a feeling, and the
   gap between feeling and reality is the problem. At most two probes:
   - a question whose answer shows the edge: the last thing they hold, the first they do not;
   - a task from the middle of the topic, not the beginning;
   - their own words for a term they already used.

   A probe is diagnosis: do not correct what it exposes. `Starting point` is written from
   what the probes showed, not from what the person said.
2. **Ask only what only they can answer** — each changes the curriculum:

   | Ask | Because |
   |---|---|
   | what it is **for** | reading it and designing it need different objectives |
   | how much time, how often | three objectives or six |
   | depth or working knowledge | working knowledge drops the edges, on record |
   | a deadline | what gets left out, now and out loud |

3. **Write the objectives**:
   - observable and unaided — *finds, writes, corrects, explains with the material out of
     sight*; never *understands, knows, is familiar with*;
   - each with its **Closes with**: the evidence that will count, decided now while nothing
     is at stake;
   - three to six; more is a course — split it into two topics and say so;
   - ordered by dependency; the first is what the probes showed missing underneath;
   - `OA-NN` is an identifier: text may change, the number never; a retired objective keeps
     its number with a note, and numbers are never reused.
4. **Create `progress.md`** in the same unit, every objective `not started`.
5. **Agree it**: play back the objectives with what closes each, the starting point in one
   line, and what was left out — plainly, in behaviour, not softened. Nothing runs before
   the person approves.

## curriculum.md

```markdown
# Curriculum — Database read performance
topic: db-read-performance · opened: 2026-09-16

## Purpose
Reads and fixes slow queries in the team's existing code. Not designing schemas.

## Starting point (from the probes, 2026-09-16)
- Asked what eager-loading a relation does to the SQL: "it loads the relation"; no join, no
  duplicated rows. The edge is here.
- Given a list endpoint to fix: paginated it, did not see the N+1 below it.

## Agreed
- Two hours a week. Working knowledge. Out of scope: migrations, writes. No deadline.

## Objectives
| Id | The person can, unaided | Closes with |
|---|---|---|
| OA-01 | Read a generated SQL statement and say which query code produced it | Maps an unseen statement back |
| OA-02 | Find the N+1 in existing code and say what it costs | Finds it in a file of their own repository |
| OA-03 | Rewrite a read as a projection and justify every column kept | Rewrites alone and defends the columns |

## Retired
- OA-04 · compiled queries — dropped when the purpose was set. Number not reused.
```

## progress.md

```markdown
# Progress — db-read-performance
last session: 2026-09-25

## Objectives
| Id | State | Evidence | Next review |
|---|---|---|---|
| OA-01 | achieved | assessments/2026-09-25.md, new case, material away | 2026-09-26 |
| OA-02 | solved by the system | exercises/EX-03 — solution requested | 2026-09-26 |
| OA-03 | not started | — | — |

## Calibration
| Date | Objective | Confidence | Result |
|---|---|---|---|
| 2026-09-18 | OA-01 | high | wrong |

## Log
- 2026-09-18 · OA-01 · EX-01 corrected. Named the join, missed the duplicated rows. High
  confidence first. Back to the shortest review interval.
```

## Record rules

1. The table is where each objective stands now and the only part rewritten; calibration
   rows and log lines are appended.
2. **Every state names its evidence**: an exercise, an assessment, a log date.
3. **The state vocabulary is closed.** Before measuring: `not started`, `in progress`. After,
   the five verdicts of `assess.md`: `achieved`, `not achieved`, `solved by the system`,
   `no evidence`, `not measurable`. No sixth word invented to be kind.
4. Calibration is data: one row per corrected delivery, no commentary about the person.

## Resuming a topic

Read both files first; do not re-probe what `Starting point` records. A new objective takes
the next free number with its date and why. A wish the purpose excludes is a new topic,
cross-referenced from both curricula.

## Done when

`teach.md` could take `OA-01` and write a lesson without asking anything, and someone absent
from this session could read `progress.md` and say what was measured and what comes next.
