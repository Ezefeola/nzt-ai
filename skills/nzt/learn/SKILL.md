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

The references still name each other by their old skill names (`nzt-learn-tutor` is
`references/tutor.md`): those are this table's rows, never skills to load.

## One unit

One lesson, one training session, one correction round, one assessment, one review batch.
Never a whole topic.

## Where it lands

A topic lives **entirely** in `Learn/<topic>/`:

- `progress.md` — objectives, their state, calibration, review dates. **This is the
  continuation state of a topic, and there is no entry in `Plan/state.json`**: a topic's
  state is per objective and carries dates, not work units.
- `curriculum.md` — objectives `OA-NN`, the starting point, what was agreed.
- `lessons/`, `exercises/`, `solutions/`, `assessments/`.
- **The solution of an exercise lives in a different file and is written after delivery.**
  Not collapsed, not further down, not behind "do not scroll". A solution that exists is a
  solution that gets read, and at that moment the exercise stopped measuring.

## Rules

- **Measure before teaching.** Do not ask what they know — find out with one or two small
  probes. *"How much do you know about this?"* returns a feeling, and the gap between that
  feeling and reality **is the problem, not the input**.
- **Ask the person only what only they can answer**: how much time they have, whether they
  want depth or working knowledge, whether there is a deadline. What a probe can establish
  is not a question.
- **An objective is something observable they will be able to do unaided.** Never
  *"understands"* or *"is familiar with"*: an objective nobody can measure produces a
  verdict nobody can defend.
- **Ask for their confidence before correcting.** Confidence × result is the most valuable
  measurement in this branch, and **high confidence with a wrong result is the dangerous
  cell**: they are not going to check that again.
- **Hints climb a ladder, one step per request** — reframe · name the missing piece · the
  next step only · the solution with its reasoning. Jumping to the last one because the
  exchange is getting long is exactly the failure this mode exists to prevent.
- **If the person asks for the solution, give it** — no negotiation and no reproach — **and
  record the objective as not acquired, back into review.** Nothing is refused to the
  person, and nothing is credited that they did not do: the discipline is enforced in the
  record, not by withholding.
- **Retrieval, not rereading.** Rereading produces fluency, which feels like knowing;
  retrieval produces retention and, when it fails, tells the truth immediately.
- **Assessment uses a new case.** Solving the practised example proves nothing.
- **You do not declare the topic learned.** Report what was measured; whether that is
  enough is the person's call — the same rule as never accepting a story on their behalf.
- **Never edit the record to be kind.** `solved by the system` becomes `achieved` only when
  the person does it alone, on a different case. That edit is the most tempting one at
  closing time and the one that would make this whole branch worthless.

## Done when

The person can do the objective unaided, on a case they have not seen, and can say why it
works with the material out of sight — and the record says exactly that, with the artifact
that shows it.

## Closing checklist

- [ ] Every objective's state names the evidence that produced it.
- [ ] Nothing the system solved is recorded as acquired.
- [ ] Confidence was asked before each correction, and recorded.
- [ ] Reviews are scheduled per objective, with dates.
- [ ] The closing report says what they can do now **and what they still cannot**.
