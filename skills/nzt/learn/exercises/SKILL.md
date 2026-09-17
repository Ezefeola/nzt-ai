---
name: nzt-learn-exercises
description: Use when writing the brief the person will work on, and its solution afterwards - a separate file created only once the delivery exists.
---

# Exercises — the brief now, the solution afterwards

Produces `Learn/<topic>/exercises/EX-NN.md`, and later `Learn/<topic>/solutions/EX-NN.md`:
**same name, different folder**. `EX-NN` is sequential per topic and never reused, like
`OA-NN`.

Every brief serves one objective and one step. If you cannot name which, there is nothing
to correct against and the delivery will be judged on taste.

If you did not arrive here from `nzt-learn`, load it first.

## The brief

Five parts, and the last one is not optional:

| Part | What goes in it |
|---|---|
| **Produce** | What they hand back, concretely — a function, a rewrite, a diagnosis in writing |
| **The case** | Their code, their domain, their data. Generic cases teach the generic case |
| **Given** | What comes with it at this step, and **what does not**, said out loud |
| **Out of scope** | What is not being practised today, so they do not fix it and you do not correct it |
| **Done when** | What a good answer contains — **visible to the person** |

- **`Done when` is in the brief, not in your head.** Knowing what a good answer contains is
  part of learning to produce one; kept hidden, the exercise becomes guessing what the agent
  wanted, which is a skill nobody needs.
- It says **what has to be true of the answer**, not the answer. *"Names the two queries and
  says which one multiplies"* tells them what to aim at without telling them where to aim.
- **One case per brief.** A brief with three cases gets the first one done and the other two
  skimmed.
- **A different case every time**, including when a step is repeated. Handing back a case
  they already worked measures their memory of it.
- Say how long it should take. An exercise with no size is one the person postpones.

## The file

```markdown
# EX-03 · Find the N+1 in the order list
objective: OA-02 · step: faded · written: 2026-09-18 · about 20 minutes

## Produce
The read path of `OrderListEndpoint`, rewritten so the list costs one query, plus two or
three lines saying what it cost before.

## The case
`src/Orders/OrderListEndpoint.cs` as it is on main today. Twenty orders per page, and the
customer's name shown in every row.

## Given
- The shape of the rewrite: a single query with a projection. The `select` is empty —
  the columns are yours to decide.
- The query log from a run of the current endpoint.
- **Not given:** which property access triggers the extra query. That is the finding.

## Out of scope
Paging, the endpoint's validation, and naming. Do not fix them and do not defend them.

## Done when
- The rewritten path issues one query, and you can point at it in the log.
- Every column kept has a reason you can say out loud.
- You can name what the previous version cost, in queries, for a page of twenty.
```

## One brief per step

The step decides what **Given** contains — that is the whole difference between them:

| Step | Given |
|---|---|
| **solved** | The complete solution. What they produce is the reasoning for each step |
| **faded** | The same form with the decisions removed. They fill the decisions |
| **alone** | The brief and nothing else |

For a training series the brief is written once for the series, not per repetition: it names
**the one component being practised** and says the rest is not being looked at today. Each
repetition changes the case, not the brief.

## The solution is another file, written after delivery

**Create `solutions/EX-NN.md` only once the delivery exists** — or once the person asked for
the solution, which is recorded where `nzt-learn-tutor` says.

- Not at the bottom of the brief, not in a collapsed block, not behind *"do not scroll"*.
  **A solution that exists is a solution that gets read**, and at that moment the exercise
  stopped measuring anything.
- **It is a rule about where files live because that is the only place it can be
  enforced.** Written in the brief and hoped for, it fails on the first long session.
- Writing it in advance "to save time later" is the same failure with a better excuse: it
  also fixes your answer before you have seen theirs, which is the answer the correction
  should start from.
- The solution carries **the reasoning, not just the result** — why each decision, and what
  the alternatives cost. A result alone is checkable and not learnable.
- When the person's answer is different and also right, the solution file says so, with what
  each version trades. Your version is not the standard.

```markdown
# EX-03 · Solution
objective: OA-02 · delivered: 2026-09-19 · written after delivery

## The answer
[the rewrite]

## Why each decision
- The projection keeps `CustomerName` and drops the rest of the customer: the row needs one
  string, and loading the entity brings twelve columns to use one.
- ...

## What was easy to miss
The property access in the `foreach`. It reads like a field, and that is exactly why the
extra query is invisible at the call site.
```

## Done when

Rehearse the brief before you hand it over: could the person start working from it without
asking you a single question, and could you tell a good delivery from a poor one using only
its **Done when**? If not, the brief is not finished — and if the only way to tell is to
compare against a solution you already wrote, the exercise was never going to measure
anything.
