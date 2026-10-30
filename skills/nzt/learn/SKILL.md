---
name: nzt-learn
description: Use when the user wants to acquire or improve a skill instead of having it built for them: learning, practising, being corrected, assessed, or keeping it from fading.
---

# Learn — the person acquires the skill

This mode does not produce software. It produces **ability in the person**.

**The inversion that defines it:** everywhere else in NZT you produce the work. Here you
cannot. The person produces it and you get them there. An agent that solves the exercise
"to show how it is done" has just destroyed the point of the session.

**Your instinct is to be useful by solving. Here, solving is the failure mode.** A blocked
task belongs to the person: it is the only place the skill can form.

## One track, two loops

Diagnosis, objectives, correction, assessment and reviews are **shared**. Only the middle
differs:

| Loop | Starts from | Its unit | Closes when |
|---|---|---|---|
| **Teach** | not knowing the concept | one lesson | they apply it unaided once |
| **Train** | already doing it | one session | performance stabilises across cases |

You move between loops **inside the same topic**. Someone who just learned something and
wants to get good at it is not opening a new topic.

## A loose question is not a topic

An explanation asked for once is answered in the conversation: no plan, no files, no
objectives. Material appears when the person wants to **sustain** the ability over time. Ask
when it is genuinely ambiguous; otherwise assume the light one.

A learning plan proposes **learning phases, never software artifacts**. Nothing observable
is being built here.

## Choose the reference

Paths are relative to this skill's folder. **Read the file before acting on the row** — the
row is not the guidance, the file is. A new topic starts at the first row: nothing else runs
before its curriculum and progress record exist.

| The unit is | Read | Read with |
|---|---|---|
| Objectives, the real starting point, the curriculum, and the record the rest writes into | `references/plan.md` | — |
| Teaching one objective: lesson and its practice | `references/teach.md` | `references/exercises.md` |
| Deliberate practice on something they already do | `references/train.md` | `references/exercises.md` |
| Correcting what they produced, or unblocking them | `references/tutor.md` | — |
| Measuring what was actually acquired | `references/assess.md` | — |
| Scheduling and running the reviews | `references/retain.md` | — |
| Writing an exercise brief, or its solution afterwards | `references/exercises.md` | — |

Wherever a file names `nzt-learn-<name>`, it means `references/<name>.md` in this folder
(`nzt-learn-tutor` → `references/tutor.md`): read that file — it is not a skill.

## One unit

One lesson, one training session, one correction round, one assessment, one review batch.
Never a whole topic.

## Where it lands

A topic lives **entirely** in `Learn/<topic>/`:

- `progress.md` — objectives, their state, calibration, review dates. **This is the
  continuation state of a topic, and there is no entry in `Plan/state.json`**: a topic's
  state is per objective and carries dates, not work units.
- `curriculum.md` — objectives `OA-NN`, the starting point, what was agreed.
- `lessons/`, `exercises/`, `assessments/`, and `solutions/`, each written only after its
  delivery (`references/exercises.md`).

The shape of `progress.md` and the rules of its record — the closed states, the evidence each
one names, the append-only log — are `references/plan.md`'s; every other reference writes
into it as that file says.

## Rules

Each reference holds the rules of its own work. These hold for every unit of this mode:

- **The person produces; you get them there.** Nothing is refused to them — a solution they
  ask for is given — and **nothing is credited that they did not do**: the discipline is
  enforced in the record, not by withholding.
- **Only `references/assess.md` writes `achieved`.** A lesson, a training series or a
  correction that went well leaves the objective `in progress`, ready to be assessed.
- **A different case each time.** The case already practised measures the memory of that
  case, not the ability.

## Done when

The unit's reference says its own *Done when*, and it holds — and `progress.md` says exactly
what happened, with the artifact that shows it.
