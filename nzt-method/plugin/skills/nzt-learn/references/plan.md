# Planning a topic

Produces the topic's folder and its `Plan/state.md`: what it is for, where the person
starts, what was agreed, and the objectives as its units. Every other unit of the topic
starts from this file.

## Contents
- Steps
- The topic's folder
- The state of a topic
- Resuming a topic
- Done when

## Steps

1. **Probe, do not ask what they know.** "How much do you know?" returns a feeling, and the
   gap between feeling and reality is the problem. At most two probes:
   - a question whose answer shows the edge: the last thing they hold, the first they do
     not;
   - a small task from the middle of the topic, not from its beginning;
   - their own words for a term they already used;
   - for something they already do, the first repetition of a practice session on one
     named part.

   A probe is diagnosis: do not correct what it shows. The starting point is written from
   what the probes showed, not from what the person said.
2. **Ask only what only they can answer**, each because it changes the objectives:

   | Ask | Because |
   |---|---|
   | what it is **for** | reading something and making it need different objectives |
   | how much time, how often | three objectives or six |
   | depth or working knowledge | working knowledge leaves the edges out, on record |
   | a deadline | what gets left out, now and out loud |

3. **Write the objectives:**
   - observable and unaided: *finds, writes, corrects, says, explains without the material*;
     never *understands, knows, is familiar with*;
   - each with what closes it: the evidence that will count, decided now while nothing is
     at stake;
   - three to six; more is a course: split it into two topics and say so;
   - ordered by dependency; the first is what the probes showed missing underneath;
   - numbered in order; the text may change, the number never. A dropped objective keeps
     its number, marked `(dropped)`, with the reason in *Decisions*.
4. **Agree it with the person:** the objectives with what closes each, the starting point in
   one line, what was left out, and where the topic's folder goes, plainly and not
   softened. Nothing is written before they say yes.
5. **Create the folder and the state** once they approve: every objective `pending`.

## The topic's folder

One folder per topic, named after it, with `Plan/state.md` and, as they appear,
`lessons/`, `exercises/`, `solutions/` and `assessments/`. Lessons, exercises, solutions and
assessments are for the person: written entirely in their language, headings included.

## The state of a topic

The method's state template, read this way:

- **What it is:** what the topic is for, and the starting point the probes showed.
- **Units:** the objectives. *Unit* is the objective as "can, unaided, …"; *Done when* is
  what closes it; *Who does it* is always the person; *Verdict* takes only the closed
  verdicts; and a **Next review** column holds one date per objective that has a verdict.
- **Decisions:** time, depth, deadline, what was left out, and every objective dropped or
  rewritten.
- **Log**, a section only topics have: one line per unit, appended and never rewritten; a
  wrong line is corrected by a new one. When a delivery was corrected, the line says the
  how sure the person was and whether they were right.

```markdown
## Units
| Unit | Leaves | Done when | Who does it | Status | Verdict | Next review |
|---|---|---|---|---|---|---|
| 1 · Can say, unaided, what each argument of a lookup formula does | — | Explains it on a sheet they have not seen | person | in progress | — | — |
| 2 · Can bring a value from another sheet with a lookup formula | lessons/2-lookup.md | Does it on their own order list | person | — | achieved | 2026-11-12 |

## Log
- 2026-11-08 · 2 · assessment, new sheet, unaided. Achieved. Next review in 3 days.
- 2026-11-08 · 1 · exercise 03 corrected. Was sure, answer wrong: mixed up the third
  argument. Back to 1 day.
```

## Resuming a topic

Read the state first and do not probe again what it records. A new objective takes the
next free number, with its date and reason in *Decisions*. A wish the topic's purpose
leaves out is a new topic, in its own folder.

## Done when

A lesson for objective 1 could be written without asking anything, and someone absent from
this session could read the state and say what was agreed, what was measured and what
comes next.
