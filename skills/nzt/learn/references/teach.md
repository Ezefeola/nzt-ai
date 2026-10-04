---
name: nzt-learn-teach
description: Use when one OA-NN objective has to be taught from not knowing it: the attempt before the explanation, one idea per lesson, scaffolding that fades.
---

# Teach — one objective, one idea, until they do it unaided

Produces `Learn/<topic>/lessons/OA-NN-<slug>.md` and the state it leaves in
`progress.md`. The brief for each practice step is written by `nzt-learn-exercises`; what
comes back is corrected with `nzt-learn-tutor`.

**Start from an objective that is already in `curriculum.md`, with its *Closes with*.** If
you have to ask the person something before you can write the lesson, the objective was
badly formed: fix it there, not here.

If you did not arrive here from `nzt-learn`, load it first.

## Make them try before you explain

Open with a small task they cannot do yet, from the objective, and let them fail at it.

- **A failed attempt makes the explanation land.** An explanation delivered to a blank mind
  slides off it — nothing in the person is waiting for it.
- **The attempt is a hook, not a measurement, and you do not correct it.** Correcting here
  turns the opening into the lesson, and there is nothing left to teach into.
- Keep it to one or two minutes of their work. If the attempt needs a setup, it is an
  exercise and belongs after the lesson.
- Say what it was for afterwards: *"that gap is what this lesson fills"*. Without that line
  the attempt reads as a test they just failed.

## The lesson carries one idea

Four parts, in this order, and nothing else:

| Part | What goes in it | Why it is there |
|---|---|---|
| **The idea** | Said plainly, **before any nuance** | Qualifications first make the idea unreachable |
| **Why it exists** | What breaks without it, concretely | **A rule with no problem behind it gets memorised and forgotten** |
| **In their context** | A case from their own code, product or domain | A generic example teaches the example |
| **The typical error** | The mistake almost everyone makes here | The cheapest thing you can give them, and what eats them if you do not |

**Completeness is what you leave out.** Edges, history, alternatives and "it depends" go in
another lesson or in none. What is not needed to reach the objective is what turns a lesson
into something nobody finishes.

- **One lesson, one objective, read in one sitting.** If it does not fit, you are teaching
  two ideas: split it.
- An objective may need two lessons. **A third one means the objective is too big** — that
  is a finding for `curriculum.md`, not something to absorb here.
- Write it in the person's language, and in the vocabulary they already use. A lesson that
  introduces three new terms to explain one idea teaches the terms.

## The file

```markdown
# OA-02 · The N+1, and what it costs
objective: OA-02 · lesson 1 · 2026-09-18

## The idea
One query brings the list. Then one more query goes out per row to fetch the relation.
Twenty rows, twenty-one round trips to the database.

## Why it exists
The page is slow and every query in the log looks fast, so the search goes to indexes, to
the connection pool, to the machine. The cost is not in any one query — it is in how many
of them there are, and only counting them shows it.

## In your code
`OrderListEndpoint` loads the orders, and the `foreach` below reads `order.Customer.Name`.
That property access is the second query, once per order, and it is invisible at the call
site because it looks like a field.

## The typical error
Moving the `Include` around until the numbers change, and concluding the ORM batches it.
It does not. The check is the query count in the log, not the shape of the LINQ.

## Practice
- solved · exercises/EX-02 — the rewrite is given; explain what each step costs
- faded · exercises/EX-03 — the projection with the columns removed
- alone · exercises/EX-04 — a list endpoint from your repository, nothing given

## Retrieval
Why does adding an index to `Customer.Name` not fix an N+1?
```

**The answer to the retrieval question is not in this file**, for the same reason a
solution never ships with its brief.

## The scaffolding fades in three steps

Practice is not a half that comes after the explaining half: **the lesson and its practice
alternate, per objective**. A lesson with no exercise leaves the objective open, whatever
the file says.

| Step | The person gets | They produce |
|---|---|---|
| **solved** | The full solution | Why each step is there, in their words |
| **faded** | The same form with the decisions taken out | The decisions |
| **alone** | The brief, nothing else | All of it |

- **Skipping the middle step is what produces someone who followed everything and cannot
  start from a blank page.** It is the tempting one, because after *solved* the person
  sounds like they have it.
- **A failure in *alone* goes back to *faded* with a different case**, not back to the
  explanation. Re-explaining something they almost produced spends the session on the part
  that already worked.
- Each step is one exercise, written by `nzt-learn-exercises`, corrected by
  `nzt-learn-tutor` before the next one starts.
- Each step uses a **different case**. Repeating the same one measures memory of that case.

## Close with retrieval, not a summary

End every lesson with a question the person answers **with the material out of sight**.

- **Rereading produces fluency, which feels like knowing. Retrieval produces retention and,
  when it fails, says so immediately.** A summary at the end is rereading with fewer words.
- It is the step that gets skipped, because by then the lesson already feels finished.
- A failed retrieval is not a bad lesson — it is the information the lesson was for. Note
  what was missing and take it to the next practice step.

## What closes the objective

**Not a good lesson.** The objective closes when the person **produced** something at
*alone* **and** explained it in their own words without the material. Until both have
happened, `progress.md` says `in progress` and names where they stopped.

Write into `progress.md` when the lesson's practice ends, not when the lesson is written:

- The objective's state, with the artifact behind it — the exercise, and which step.
- A log line with the date, what they produced and what was missing.
- If they asked for the solution: `solved by the system`, with no reproach and no edit
  later. That is the record doing its job.

## Done when

Rehearse it: hand the person a case they have not seen, from the same objective, and walk
away. If you can predict they would produce it — and say why it works with the file closed
— the lesson did its job. If the honest answer is *"only with the example in front of
them"*, the objective is still open and the next step is *faded*, not another explanation.
