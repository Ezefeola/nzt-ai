# The state file

`Plan/state.md` holds what a new session needs to resume the work without anyone explaining
it again. It is the source of truth: the host's memory, plan mode or task list may help,
but nothing needed to resume lives only there.

## When it exists

`plan` creates it when a plan is approved. One state file per work, and one folder per
work.

## Reading it

Before asking the person anything:

- the person asks to add, change or remove something the work must do → `define`, as a
  change; what it is made with → `approach`; only the units or their order → `plan`;
- the person asks for something unrelated to this work → a new work, in its own folder;
- a topic the person is learning (its units are objectives, with a *Next review*
  column) → continue it with the `learn` skill, which offers the overdue reviews first;
- a unit `in progress` → report it in one line and continue it with the `do` skill;
- an approved plan with the next unit `pending` → start that unit with the `do` skill;
- a plan not yet approved → show that plan again instead of writing a new one;
- every unit with a verdict → the new request is a new work, or a new plan for this one;
- *Next step* waiting on the person → say what it waits on first.

If the state and the folder disagree (a file it names is missing, or one it does not
mention is there), tell the person and ask before touching the state: a missing file may
only live somewhere else. Correct the state once the person confirms what is true.

## Template

Headings and fixed words in English; what is written under them in the person's language.
Empty sections are not written.

```markdown
# <Work name>

## What it is
What is wanted and for whom, in one line; the definition holds the rest.
Size: <direct | planned | sliced>.
Fixed time: <deadline>, if any.

## Done when
The agreed done criterion for the whole work.

## Units
| Unit | Part | Leaves | Done when | Who does it | Status | Verdict |
|---|---|---|---|---|---|---|
| … | the part it belongs to, if any | what exists after it | its own done criterion | agent / person / both | pending / in progress / stopped | done / partial / not achieved |

Units in the order they are done. Units that can be cut if time runs out are marked
`(cuttable)`. Units the person approved to run in a row without stopping are marked
`(batch)`.

## Decisions
- **<date> — <what was decided>.** Why: <reason>.

## Where we are
What the last session did, and what was left unverified.

## Next step
What the agent recommended, and whether the person approved it.
```

A topic the person is learning uses this same file: `learn` says how its units,
verdicts, *Next review* column and *Log* section are read.

## Updating it

- After every stop: the unit's status and verdict, *Where we are* and *Next step*.
- Every decision with its reason, at the moment it is made, including a size change or a
  renamed term.
- Before a long session runs out of context: everything above, then stop.
