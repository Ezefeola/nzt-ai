# The state file

`Plan/state.md` holds what a new session needs to resume the work without anyone explaining
it again. It is the source of truth: the host's memory, plan mode or task list may help,
but nothing needed to resume lives only there.

## When it exists

`plan` creates it when a plan is approved. One state file per work, and one folder per
work.

## Reading it

Before asking the person anything:

- the person asks to change what was agreed (what it must do, what it is made with, the
  units) → route it with `nzt`'s hand-off table;
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

## The file

It starts from `assets/state.md`. Headings and fixed words in English; what is written
under them in the person's language. Empty sections are not written.

- **Units** go in the order they are done. *Part* is the part it belongs to, if any;
  *Leaves* is what exists after it; *Who does it* is `agent`, `person` or `both`; *Status*
  is `pending`, `in progress` or `stopped`; *Verdict* is `done`, `partial` or
  `not achieved`.
- **Marks:** units that can be cut if time runs out are marked `(cuttable)`; units the
  person approved to run in a row without stopping are marked `(batch)`.
- **Fixed time** is written only when there is a deadline.

A topic the person is learning uses this same file: `learn` says how its units,
verdicts, *Next review* column and *Log* section are read.

## Updating it

- After every stop: the unit's status and verdict, *Where we are* and *Next step*.
- Every decision with its reason, at the moment it is made, including a size change or a
  renamed term.
- Before a long session runs out of context: everything above, then stop.
