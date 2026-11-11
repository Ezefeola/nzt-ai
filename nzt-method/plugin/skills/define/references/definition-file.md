# The definition

The definition is the work's specification. `Docs/General/definition.md` says what the
whole work is, for whom, and what it will not be: everything else is checked against it.
Each part has a `definition.md` in its folder with what is always true there (its rules),
what it handles and within which limits, and the index of its capabilities; each
capability has its own file with its acceptance criteria. All of them are the minutes of
the interview, not the agent's ideas: every line traces to an answer in the log.

## Contents
- The files
- Rules
- Example: something built (an app)
- Example: something done in the world (a house move)

## The files

| File | Starts from | Says |
|---|---|---|
| `Docs/General/definition.md` | `assets/definition.md` | what it is, for whom, objectives, in and out, parts, limits, how well, done when |
| `Docs/Parts/<NN-part>/definition.md` | `assets/part-definition.md` | what the part covers, its rules, what it handles, how well, its capabilities |
| `Docs/Parts/<NN-part>/<NN-capability>.md` | `assets/capability.md` | one thing that can be done or achieved, and its acceptance criteria |

Headings fixed, in English; the rest in the person's language. Empty sections are not
written. A capability is one thing someone can do or achieve in that part (add a task,
book the movers, confirm attendance), named with the glossary's term.

## Rules

1. **What, never how.** No technology, supplier, material or tool names: they go in
   `how.md`. "Tasks are kept between sessions" is a rule; "tasks are saved in SQLite" is not.
2. **A rule is what is always true** in the part, whatever is being done: "a task past its
   date and not done is always highlighted". One statement per rule, with a short name that
   never changes, so capabilities, plans and changes cite it instead of copying it.
3. **A criterion is one case that can be tried:** `AC-NN`, numbered within its capability
   and never reused, one *When* with real values and one *then* that can be seen. Each
   capability has at least one bad case (empty, late, repeated, over a limit) or says why
   there is none. A bad case whose answer is still open is written anyway, its *then*
   citing the open `Q-NN`, so the case is not lost while it is asked. A criterion cites the rule it shows, if any. Elsewhere it is cited as
   `<NN-part>/<NN-capability> AC-NN`.
4. **Limits have numbers.** *What it handles* lists each thing the part keeps or deals
   with, what it has, and its limits and values: what is required, the most and the least,
   which values are allowed, what happens when it is repeated.
5. **How well is a level with its number and condition** ("the list opens at once with
   1,000 tasks"; "nobody waits more than ten minutes for food with 80 guests"), never the
   way to get there. Only what the person cares about; none is a valid answer.
6. **Nothing is written as agreed that the person did not say:** a value, a limit or a
   line you would add is asked first, as its own question with your proposal recommended;
   until it is answered it stays under *Open*. A criterion holds only what they said or
   what follows from it; a detail it would need beyond that (a warning, a message, what
   happens next) is asked, and the criterion cites its open `Q-NN` meanwhile.
7. **Objectives are results for someone,** not features: "I never forget a payment" is an
   objective; "reminders" is a capability.
8. **A capability's file is written when its unit is near,** or with its part when the part
   is small; until then it is one line in the part's index, `to define`.
9. **Status moves to approved** when the person says yes to the playback; any later edit
   goes through a change.

## Example: something built (an app)

```markdown
# 01 · Tasks
Status: approved · 2026-11-09

## What it covers
Writing tasks down, changing them and seeing what is late, for me alone, instead of a notebook.

## Rules
### late · A task past its date and not done is always highlighted
- origin: Q-06

## What it handles
| Thing | What it has | Limits and values | Origin |
|---|---|---|---|
| Task | text, due date, done mark | text required, up to 200 characters (Q-12); date optional, may be in the past | Q-03, Q-11 |

## How well
- The list opens at once with 1,000 tasks (Q-13).

## Capabilities
| Capability | What it gives | Status |
|---|---|---|
| 01 · Add | write a task down with or without a date | approved |
| 02 · Edit | change a task's text or date | to define |
```

```markdown
# 01 · Add
part: 01-tasks
Status: approved · 2026-11-09

I write a task down, with a due date or without one, so it is not lost.

## Acceptance criteria
- **AC-01 · With a date.** When I add "pay rent" due 1/12, then it shows in the list with that date.
- **AC-02 · Already late.** (late) When I add "pay the light" due yesterday, then it shows highlighted as late.
- **AC-03 · Empty (bad case).** When I add a task with no text, then nothing is added and the field says why.
- **AC-04 · Too long (bad case).** When the text passes 200 characters, then it cannot be added and the limit is shown.
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

## In and out
**In:** movers, packing, utilities, the cat. **Out:** buying furniture (Q-02).

## Parts
- **01 · Movers** — choosing and booking who moves us.
- **02 · Paperwork** — contract, utilities, change of address.

## Limits
Fixed date: the 15th. Budget up to the amount in Q-04.

## How well
- Nothing breaks or goes missing on the way (Q-06).
```

```markdown
# 01 · Book the movers
part: 01-movers
Status: approved · 2026-11-09

We get a moving company booked for the 15th, within budget.

## Acceptance criteria
- **AC-01 · Booked in writing.** When the company confirms, then we have it in writing: date 15/11, 8 a.m., three people, the price.
- **AC-02 · No date free (bad case).** When none of the three has the 15th free, then we hear it before the 1st, with the next option.
```
