# The state file

`Plan/state.md` holds what a new session needs to resume the work without anyone explaining
it again. It is the source of truth: the host's memory, plan mode or task list may help,
but nothing needed to resume lives only there.

## When it exists

`nzt-plan` creates it when a plan is approved. One state file per work, and one folder per
work.

## Reading it

Before asking the person anything:

- a unit `in progress` → report it in one line and continue it with `nzt-do`;
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
What is wanted and for whom. Size: <direct | planned | sliced>.
Fixed time: <deadline>, if any.

## Done when
The agreed done criterion for the whole work.

## Units
| Unit | Who does it | Status | Verdict |
|---|---|---|---|
| … | agent / person / both | pending / in progress / stopped | done / partial / not achieved |

Units that can be cut if time runs out are marked `(cuttable)`.

## Decisions
- **<date> — <what was decided>.** Why: <reason>.

## Where we are
What the last session did, and what was left unverified.

## Next step
What the agent recommended, and whether the person approved it.
```

## Updating it

- After every stop: the unit's status and verdict, *Where we are* and *Next step*.
- Every decision with its reason, at the moment it is made, including a size change or a
  renamed term.
- Before a long session runs out of context: everything above, then stop.
