# Changing what was agreed

A definition is edited only through a change the person approves first: editing it
directly would lose what was agreed with no cheap way back. `change.md` sits next to the
definition it changes, and its presence means a change **not yet approved**.

## Steps

1. **Read the definition** it touches, and whatever cites the rules involved (other parts,
   the plan's units).
2. **Type each point:**

   | Type | Means | In the definition |
   |---|---|---|
   | add | something new it must do | a new rule or objective |
   | modify | something it does changes | the rule is **replaced**, never kept alongside |
   | remove | something stops applying | the rule goes, and a check that it no longer happens is added |

3. **Write the proposal,** with nothing undefined filled in: an open point is a question in
   the log.
4. **Ask the person to approve it.** Nothing below happens before the yes.
5. **Apply it** to the definition, add a *History* line with the person's sentence as the
   reason, and delete `change.md`. If what it changes was already done, the plan needs a
   unit to redo or undo it: that is the `plan` skill's.

## The file

```markdown
# Change — 01 · The list
opened: 2026-11-12
origin: "I don't want the email reminders anymore"

## remove · reminders · Each due task sends an email the day before
After it: a due task sends nothing.

## modify · kept · Tasks survive closing it
Before: kept on this laptop only.
Now: the same tasks on the laptop and on the phone.
```

`origin:` is the person's own sentence; it becomes the reason in *History*.

## Removing is where it goes wrong

Deleting a rule from the definition does not remove it from the result, and leaves no trace
to notice the drift. A removal says, in the person's words, what stops happening, and leaves
a check that proves the absence (*a task due tomorrow sends **no** email*), which is
verified like any other rule.
