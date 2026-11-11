---
name: learn
description: Use when the user wants to acquire or improve a skill instead of having it built for them: learning, practising, being corrected, assessed, or keeping it from fading.
---

# Learn — the person acquires the skill

Produces **ability in the person**, not a product. Everywhere else you produce the work; here
the person does and you get them there. **Solving it for them is the failure mode**: a
blocked task is the only place the skill can form.

## Two loops, one topic

Diagnosis, objectives, correction, assessment and reviews are shared; only the middle differs.
A person moves between loops inside the same topic.

| Loop | Starts from | Its unit | Closes when |
|---|---|---|---|
| **Teach** | not knowing the concept | one lesson | they apply it unaided once |
| **Train** | already doing it | one session | performance holds across cases |

**A loose question is not a topic**: an explanation asked once is answered in the
conversation — no plan, no files. Material appears when the person wants to sustain the
ability; ask only when that is genuinely ambiguous, otherwise assume the light one. A
learning plan proposes learning phases, never product artifacts.

## References

A new topic starts at the first row: nothing else runs before its curriculum and progress
record exist.

| The unit is | Read | Read with |
|---|---|---|
| Objectives, the starting point, the curriculum and the progress record | `references/plan.md` | — |
| Teaching one objective: lesson and its practice | `references/teach.md` | `references/exercises.md` |
| Deliberate practice on something they already do | `references/train.md` | `references/exercises.md` |
| Correcting what they produced, or unblocking them | `references/tutor.md` | — |
| Measuring what was actually acquired | `references/assess.md` | — |
| Scheduling and running reviews | `references/retain.md` | — |
| Writing an exercise brief, or its solution afterwards | `references/exercises.md` | — |

## One unit

One lesson, one training session, one correction round, one assessment, one review batch.
Never a whole topic.

## Where it lands

A topic lives entirely in `Learn/<topic>/`: `curriculum.md`, `progress.md`, `lessons/`,
`exercises/`, `assessments/` and `solutions/`. **`progress.md` is the topic's continuation
state — never `Plan/state.json`**, because its state is per objective and carries dates, not
units. Its shape and record rules are `plan.md`'s; every other reference writes into it.

## Rules

1. **Nothing is refused, nothing is credited that they did not do.** A solution they ask for
   is given and recorded as `solved by the system`: the discipline lives in the record.
2. **Only `assess.md` writes `achieved`.** A lesson, a series or a correction that went well
   leaves the objective `in progress`.
3. **A different case each time** — every exercise, repetition, review and assessment. The
   practised case measures memory of that case.

## Done when

The unit's reference *Done when* holds.
