---
name: nzt-learn-plan
description: Use when a topic needs its starting point measured with probes, its OA-NN objectives agreed, and its curriculum and progress record created.
---

# Curriculum — the real starting point and the objectives

Produces the two files a topic lives by: `Learn/<topic>/curriculum.md` — purpose, starting
point, what was agreed, and the `OA-NN` objectives — and `Learn/<topic>/progress.md`, the
record every other skill in this branch writes into. `<topic>` is a slug, lowercase, and it
never changes once the folder exists.

Nothing else in the branch runs before these exist: a lesson without an objective teaches
whatever came to mind, and it is measured against nothing.

If you did not arrive here from `nzt-learn`, load it first.

## Probe before you write anything

Do not ask what the person knows. Find out, in the conversation, with one or two small
probes:

- **A question whose answer shows the edge** — the last thing they hold, the first they do
  not.
- **A task from the middle of the topic, not the beginning.** At the beginning everyone
  looks competent, and you learn nothing you can build on.
- **Their own words for a term they already used.** Borrowed vocabulary comes apart here.

How to run them:

- **A probe is diagnosis, not an exam, and you do not correct what it exposes.** Correcting
  now turns the diagnosis into the first lesson, and the person starts defending instead of
  showing you where the edge is.
- **Two is the ceiling.** A third one is you postponing the curriculum.
- **Write `Starting point` from what the probe showed, not from what the person said.** It
  is what stops the first lesson from explaining what they already know, and what a later
  session reads instead of diagnosing the same topic twice.

## Ask only what only they can answer

Four questions, and each one changes the curriculum:

| Ask | Because |
|---|---|
| What they want it **for** | Reading this code and designing it need different objectives from the same topic |
| How much time, and how often | It decides three objectives or six, not how they are written |
| Depth or working knowledge | Working knowledge drops the edges on purpose, and that has to be on record |
| Whether there is a deadline | It decides what gets left out, now and out loud |

**What a probe can establish is not a question.** Asking it anyway trades a fact for an
impression, and the gap between the two is the thing this branch exists to close.

## Objectives

- **Observable, and unaided.** *"Finds…"*, *"writes…"*, *"corrects…"*, *"explains… with
  the material out of sight"*. Never *"understands…"*, *"knows…"*, *"is familiar with…"*:
  an objective nobody can measure produces a verdict nobody can defend.
- **Each one names what closes it** — the kind of evidence that will count. Decided now,
  while nothing is at stake. Decided at assessment time, it gets decided in favour of
  closing.
- **Three to six per topic.** More than six is a course: split it into two topics and say
  so. One lesson serves one objective; an objective may need two lessons, never the
  reverse.
- **Order them by dependency**, not by how a book would present them. The first objective
  is the one the probes showed is missing underneath.
- **`OA-NN` is an identifier.** Rewriting its text is fine; renumbering is not — progress,
  assessments and review dates all cite the number. A retired objective **keeps its number**
  and gets a note, and the number is never reused.

## curriculum.md

```markdown
# Curriculum — EF Core read performance
topic: ef-core-read-performance · opened: 2026-09-16

## Purpose
Reads and fixes slow queries in the team's existing code. Not designing schemas.

## Starting point (from the probes, 2026-09-16)
- Asked what `Include` does to the generated SQL: answered "it loads the relation", did
  not mention the join or the duplicated rows. The edge is here.
- Given a list endpoint to fix: paginated it correctly, did not see the N+1 below it.
- Holds: LINQ syntax, `Where`/`Select`, async calls. Does not hold: what the provider
  translates and what it evaluates in memory.

## Agreed
- Two hours a week. Working knowledge, not depth.
- Out of scope: migrations, write paths, multi-tenancy.
- No deadline.

## Objectives
| Id | The person can, unaided | Closes with |
|---|---|---|
| OA-01 | Read a generated SQL statement and say which LINQ produced it | Reads a statement they have not seen and maps it back |
| OA-02 | Find the N+1 in existing code and say what it costs | Finds it in a file from their own repository |
| OA-03 | Rewrite a read path as a projection and justify every column kept | Produces the rewrite alone and defends the columns |

## Retired
- OA-04 · compiled queries — dropped when the purpose was set. Number not reused.
```

## progress.md

Create it in the same unit, with every objective at `not started`. It is the topic's
continuation state — **there is no entry in `Plan/state.json`** — and its shape is fixed
here because every other skill in the branch writes into it and none of them can invent it.

```markdown
# Progress — ef-core-read-performance
last session: 2026-09-25

## Objectives
| Id | State | Evidence | Next review |
|---|---|---|---|
| OA-01 | achieved | assessments/2026-09-25.md, new case, material away | 2026-10-16 |
| OA-02 | solved by the system | exercises/EX-03 — solution requested | 2026-09-26 |
| OA-03 | not started | — | — |

## Calibration
| Date | Objective | Confidence | Result |
|---|---|---|---|
| 2026-09-18 | OA-01 | high | wrong |
| 2026-09-25 | OA-01 | high | right |

## Log
- 2026-09-18 · OA-01 · EX-01 corrected. Named the join, missed the duplicated rows. Said
  high confidence first. Back to the shortest review interval.
- 2026-09-25 · OA-01 · new case, unaided, explained it with the material away. Achieved.
```

- **The three sections do different jobs**: the table is where the topic stands now, the
  calibration rows are the pattern over time, and the log is the history the table cannot
  carry. Without the log, an objective that failed in September and held in October looks
  like it was always fine.
- **The log is append-only** and the table is the only part that gets rewritten.
- **Every state names its evidence** — an exercise, an assessment, a date. A state with no
  artifact behind it is a state nobody can audit.
- **The state vocabulary is closed.** Before anything was measured: `not started`,
  `in progress`. After: the five verdicts, which `nzt-learn-assess` says how to earn —
  `achieved`, `not achieved`, `solved by the system`, `no evidence`, `not measurable`. A
  sixth word invented to be kind is how `solved by the system` quietly becomes "nearly
  there".
- **Calibration is data, not commentary.** One row per corrected delivery; describe the
  pattern when it appears, and never editorialise about the person.

## Agree it before the first lesson

Play back three things: the objectives with what closes each, the starting point in one
line, and what was left out. Then stop — the curriculum is this mode's plan, and nothing
runs before the person approves it.

**What the probes exposed is said plainly, in behaviour, and not softened.** A starting
point edited to be flattering produces a curriculum that starts above the person and a
first lesson that lands on nobody.

## Resuming a topic

Read `curriculum.md` and `progress.md` first, and do not re-diagnose what `Starting point`
already records — re-probing a topic in flight spends the session on a measurement the file
already has.

- A new objective is appended with the next free number, with its date and why it appeared.
- **When the person wants something the purpose excludes, it is a new topic**, cross
  referenced from both curricula. Growing a topic past six objectives is how it turns into
  a course nobody finishes.

## Done when

Rehearse it twice.

- Could `nzt-learn-teach` take `OA-01` and produce a lesson without asking you anything
  else? If not, the objective is not observable yet, or the starting point is missing.
- Could someone who was not in this session read `progress.md` and say what has been
  measured and what comes next? If not, the record is not a record.
