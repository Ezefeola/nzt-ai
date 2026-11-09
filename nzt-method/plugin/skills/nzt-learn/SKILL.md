---
name: nzt-learn
description: Teaches the person a skill in any domain (a spreadsheet formula, a language, cooking, an instrument, code) instead of doing the work for them - one lesson in the conversation, or a whole topic with objectives, exercises with the solution kept apart, corrections, an assessment and spaced reviews. Use when the person wants to learn, practise, be corrected or assessed, says "teach me" or "I want to learn, don't do it for me", or resumes a topic they are learning.
---

# nzt-learn

Produces ability in the person, not a product. Everywhere else the agent does the work;
here the person does it and the agent gets them there. Solving it for them is the failure:
the moment they are stuck is where the skill forms.

The shared references named here (`references/state.md`, `references/documents.md`,
`references/glossary.md`) live in the `nzt` skill's folder.

## Two loops, one topic

| Loop | Starts from | Its unit | Closes when |
|---|---|---|---|
| **Teach** | not being able to do it | one lesson | they do it unaided once |
| **Train** | already doing it | one practice session | it holds across different cases |

A person moves between loops inside the same topic. One unit is one lesson, one practice
session, one correction, one assessment or one batch of reviews; never a whole topic.

## Rules

1. **Nothing is refused, nothing is credited that they did not do.** A solution they ask
   for is given, and the objective is recorded as `done with help`.
2. **Only an assessment writes `achieved`.** A lesson, a session or a correction that went
   well leaves the objective `in progress`.
3. **A different case each time:** every exercise, repetition, review and assessment. The
   practised case only measures memory of that case.
4. **Closed verdicts:** `achieved`, `not achieved`, `done with help`, `no evidence`. Never a
   softer word invented to be kind.
5. **Reviews follow one ladder**, per objective: 1 day → 3 days → 1 week → 3 weeks →
   2 months. A verdict enters at 1 day; a good review climbs one step, a bad one goes back
   to 1 day. Straight back to 1 day, whatever the step: wrong while sure of it,
   `done with help`, or `not achieved` once re-taught.
6. **Plain words with the person.** Never say "objective 2", "calibration", "rung" or a
   verdict label; say what they can do and what comes next.

## Steps

1. **Tell a question from a topic.** A one-off explanation is answered in the conversation,
   with one question that checks it landed, and nothing after this step applies. One thing to learn in one sitting ("teach me
   X") is one lesson in the conversation, with `references/teach.md`, and no files. A
   topic the person wants to keep up over several sessions gets a folder. In doubt, take
   the lighter one and offer to keep it as a topic.
2. **Read the topic's state** if there is one: `Plan/state.md` in its folder, with `nzt`'s
   `references/state.md`. Do not probe again what its *What it is* records. If reviews are
   overdue, start with them, using `references/retain.md`.
3. **Plan a new topic** with `references/plan.md`. Nothing else runs before the person
   approves the objectives, except for something they already do: there the first practice
   session starts now, on one part, and also serves as the probe.
4. **Pick the unit:**
   - reviews overdue and not skipped → a batch of reviews;
   - a delivery came back, or the person is stuck → a correction;
   - an objective practised up to *on your own* → its assessment;
   - otherwise the next objective not `achieved` → a lesson if they cannot do it yet, a
     practice session if they already do it.
5. **Run the unit** with the references of its row below.
6. **Record it** in `Plan/state.md` with `nzt`'s `references/state.md`: the objective's
   status, verdict and next review, and one log line. Add new terms to the glossary with
   `nzt`'s `references/glossary.md`.
7. **Stop and report** in one message: what
   they can do now, what is still missing, the next review date if any, and the next step
   you recommend. Then wait for the person.

## Done when

The unit's own *Done when* holds, the state is up to date and the person has the report;
or a one-off question was answered and checked in the conversation.

## References

| The unit is | Read |
|---|---|
| A new topic: probes, objectives, the agreement and the state | `references/plan.md`, with `nzt`'s `references/state.md` |
| A lesson, in the conversation or in the topic's folder | `references/teach.md`, `references/exercises.md`, `references/tutor.md` |
| A practice session on something they already do | `references/train.md`, `references/exercises.md`, `references/tutor.md` |
| Correcting a delivery or unblocking the person | `references/tutor.md` |
| An assessment | `references/assess.md` |
| Offering and running reviews | `references/retain.md` |
| Writing an exercise, or its solution afterwards | `references/exercises.md` |
