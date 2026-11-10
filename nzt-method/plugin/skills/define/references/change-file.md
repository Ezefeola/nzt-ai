# Changing what was agreed

A definition is edited only through a change the person approves first: editing it
directly would lose what was agreed with no cheap way back. One request is one
`change.md`, approved once, and its presence means a change **not yet approved**.

## Where it goes

- **It touches one definition:** next to it (`Docs/General/` or the part's folder).
- **It touches several,** such as removing a whole part, which also changes the general
  definition's parts and scope: in `Docs/General/`, the definition that holds the others
  together. Each point names the file it changes.

## Steps

1. **Read the definition** it touches, and whatever cites the rules involved (other parts,
   the plan's units).
2. **Type each point:**

   | Type | Means | In the definition |
   |---|---|---|
   | add | something new it must do | a new rule, capability, criterion or objective |
   | modify | something it does changes | the rule or criterion is **replaced**, never kept alongside |
   | remove | something stops applying | the rule goes, and a check that it no longer happens is added |

3. **Write the proposal,** with nothing undefined filled in: an open point is a question in
   the log.
4. **Ask the person to approve it.** Nothing below happens before the yes.
5. **Apply it** to every definition it names, add a *History* line to each with the
   person's sentence as the reason, and delete `change.md`. A removed part keeps its folder
   with its definition marked `Status: removed`, so the history stays. If what it changes was already done, the plan needs a
   unit to redo or undo it: that is the `plan` skill's.

## Example

The file starts from `assets/change.md`.

```markdown
# Change — 01 · The list
opened: 2026-11-12
origin: "I don't want the email reminders anymore"

## remove · reminders · Each due task sends an email the day before
in: Docs/Parts/01-list/definition.md
After it: a due task sends nothing.

## modify · kept · Tasks survive closing it
in: Docs/Parts/01-list/definition.md
Before: kept on this laptop only.
Now: the same tasks on the laptop and on the phone.
```

Removing a whole part goes in `Docs/General/change.md`: one point removes the part from the
general definition's *Parts* and *In*, with the absence check added to its *Done when*;
another marks the part's own definition as removed.

`origin:` is the person's own sentence; it becomes the reason in *History*.

## Removing is where it goes wrong

Deleting a rule from the definition does not remove it from the result, and leaves no trace
to notice the drift. A removal says, in the person's words, what stops happening, and leaves
a check that proves the absence (*a task due tomorrow sends **no** email*), which is
verified like any other rule. When a whole part goes, the check lives in the general
definition, since the part's own rules no longer apply.
