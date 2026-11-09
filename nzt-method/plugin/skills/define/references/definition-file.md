# The definition

`Docs/General/definition.md` says what the whole work is, for whom, and what it will not
be: everything else is checked against it. A part's `definition.md`, in its own folder,
says what that part does, its rules and how each is checked. Both are the minutes of the
interview, not the agent's ideas: every line traces to an answer in the log, and what the
agent filled in is marked *proposed*.

## Contents
- The general definition
- A part's definition
- Rules
- Example: something built (an app)
- Example: something done in the world (a house move)

## The general definition

Headings fixed, in English; the rest in the person's language. Empty sections are not
written.

```markdown
# <Work name>
Status: <draft | approved> · <date>

## What it is
One or two sentences: what will exist or change, and the problem it solves.

## For whom
| Who | What they need | How they manage today |

## Objectives
- **<A result for someone>.** Known by: <what changes when it is achieved>.

## In and out
**In:** … **Out:** … (Q-NN where it was decided)

## Parts
- **<NN · part>** — what it covers, in one line.

## Limits
Deadline, budget, rules, what already exists.

## Done when
What must be true when the whole work is over.

## Open
- Q-NN · <question still open, and what it blocks>

## History
- <date> — <what changed>. Reason: "<the person's sentence>".
```

## A part's definition

```markdown
# <NN · Part name>
Status: <draft | approved> · <date>

## What it does
One or two sentences, for whom and why.

## Rules
### <rule-name> · <the rule in one line>
- Known by: <a concrete case that shows it holds, with real values>.
- Bad case: <what happens when it goes wrong, and the expected answer>.

## Out of this part
What someone might expect here and is not.

## Open
- Q-NN · <question, and what it blocks>

## History
- <date> — <what changed>. Reason: "<the person's sentence>".
```

## Rules

1. **What, never how.** No technology, supplier, material or tool names: they go in
   `how.md`. "Tasks are kept between sessions" is a rule; "tasks are saved in SQLite" is not.
2. **Every rule has a short name that never changes,** so plans, changes and checks can
   cite it instead of copying it.
3. **Every rule is checkable:** its *Known by* is a concrete case someone could try, and
   its bad case says what should happen.
4. **Proposed is marked:** what the person did not say is written with *(proposed)* until
   they confirm it.
5. **Objectives are results for someone,** not features: "I never forget a payment" is an
   objective; "reminders" is a part.
6. **Status moves to approved** when the person says yes to the playback; any later edit
   goes through a change.

## Example: something built (an app)

```markdown
# Task list
Status: approved · 2026-11-09

## What it is
A personal list to write down tasks and tick them off, so nothing is forgotten.

## For whom
| Who | What they need | How they manage today |
|---|---|---|
| Me | See what is pending at a glance, on the laptop | Notes on paper that get lost |

## Objectives
- **I stop forgetting things.** Known by: a week without a missed task.

## In and out
**In:** add, edit, tick off and delete tasks. **Out:** sharing lists with others (Q-03).

## Parts
- **01 · The list** — adding, editing, ticking off and deleting tasks.

## Done when
I can open it, add three tasks, close it, open it again and they are still there.
```

```markdown
# 01 · The list
Status: approved · 2026-11-09

## Rules
### kept · Tasks survive closing it
- Known by: add "pay rent", close, open again → "pay rent" is there.
- Bad case: it cannot save → it says so; it never loses the task in silence.
### empty · An empty task is not added
- Known by: press add with nothing written → nothing is added (proposed).
```

## Example: something done in the world (a house move)

```markdown
# Move to Caballito
Status: approved · 2026-11-09

## What it is
Moving the two of us and the cat from Palermo to Caballito on the 15th, without losing
days of work.

## Objectives
- **We sleep in the new flat on the 15th.** Known by: that night, beds made and the cat in.
- **We get the deposit back.** Known by: the old flat handed over with no deductions.

## In and out
**In:** movers, packing, utilities, the cat. **Out:** buying furniture (Q-02).

## Parts
- **01 · Movers** — choosing and booking who moves us.
- **02 · Paperwork** — contract, utilities, change of address.
- **03 · Packing** — boxes, labels, what goes first.
- **04 · The cat** — the day itself and the first days.

## Limits
Fixed date: the 15th. Budget up to the amount in Q-04.
```
