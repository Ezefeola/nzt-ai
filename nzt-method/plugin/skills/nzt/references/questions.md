# The question logs

Every question asked to agree a work is kept, so that a cleared context or a new session
never asks it again and anyone can see what was chosen and by whom.

## Where

| Kind | Id | Log |
|---|---|---|
| What: what the result must do, for whom, its rules | `Q-NN` | `Docs/General/questions.md`, or the part's `questions.md` |
| How: what it is made with or by | `H-NN` | `Docs/How/questions.md`, or the part's `questions.md` |

Ids are numbered per log and never reused.

## Rules

1. **Write it before asking,** with an empty answer and what it blocks: what cannot be
   written or done without it. A question that blocks nothing is curiosity: drop it.
2. **Before writing it, check it is a question:** already answered in a log, a definition
   or `how.md` → read it there; a fact that can be checked (a version, a price, an opening
   time) → research it with its source; a detail inside what was agreed → decide it, say
   it is yours, and go on.
3. **Record the answer in the person's words, with the date.** An inferred answer is not an
   answer: it stays open, or goes in the definition marked as proposed.
4. **Only append.** A changed answer is marked *superseded by* the new id, never rewritten.
5. **An open question does not stop the rest:** what does not depend on it goes on; the
   step that needs it asks it when it gets there.
6. **It closes with an answer, or with `[out]`** when the person takes it out of scope.
   Assuming is not a way to close it.

## Template

Headings, ids and field names (`blocks`, `proposed`, `answer`) fixed, in English; the rest
in the person's language. `proposed` holds the options and the one you recommend, while
the question is open.

```markdown
# Questions — <work or part>

## Open
### Q-04 · What happens to a task that is due and not done?
- blocks: the reminders rule
- proposed: it stays on top in red (recommended); it moves to a "late" list

## Answered
### Q-01 · Who will use it?
- blocks: whether there are accounts
- answer: Only me, on my laptop and my phone. · 2026-11-09
### Q-02 · Do tasks have a due date?
- answer: Superseded by Q-05.

## Objections
- I warned that without a backup the tasks can be lost, and proposed one. The person
  keeps it without. Not reopened without a new reason.
```
