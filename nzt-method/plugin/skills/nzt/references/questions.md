# The question logs

Every question asked to agree a work is kept, so that a cleared context or a new session
never asks it again and anyone can see what was chosen and by whom. A log starts from
`assets/questions.md`.

## Where

| Kind | Id | Log |
|---|---|---|
| What: what the result must do, for whom, its rules | `Q-NN` | `Docs/General/questions.md`, or the part's `questions.md` |
| How: what it is made with or by | `H-NN` | `Docs/How/questions.md`, or the part's `questions.md` |

Ids are numbered per log and never reused.

## Rules

1. **Write it before asking,** with an empty answer and what it blocks: what cannot be
   written or done without it. A question that blocks nothing is curiosity: drop it.
2. **Before writing it, check it is a question:** already answered in a log, a definition,
   `how.md` or the folder → read it there; a fact that can be checked (a version, a price,
   an opening time) → research it with its source; a detail inside what was agreed →
   decide it, say it is yours, and go on.
3. **Record the answer in the person's words, with the date.** An inferred answer is not an
   answer: it stays open, or goes in the definition marked as proposed.
4. **Only append.** A changed answer is marked *superseded by* the new id, never rewritten.
5. **An open question does not stop the rest:** what does not depend on it goes on; the
   step that needs it asks it when it gets there.
6. **It closes with an answer, or with `[out]`** when the person takes it out of scope.
   Assuming is not a way to close it.
7. **Headings, ids and field names** (`blocks`, `proposed`, `answer`) stay in English; the
   rest is in the person's language. `proposed` holds the options while the question is
   open.

## Options

When a question is a choice, each option is written so the person can pick it without
knowing the field:

- **One decision per question.** Two choices folded into one option cannot be picked apart.
- **What would be used, by its real name:** ".NET 10 with PostgreSQL", "a moving company
  with a truck and three people", "a shared folder in the cloud".
- **What it means for the person:** what it costs, what they have to do or install, what
  they can and cannot do later ("the tasks stay on this laptop only").
- **The one you recommend first,** marked, with the reason in a few words.
- **Plain words first and the name after** for a person who does not know the field:
  "a page that opens in the browser (HTML and JavaScript)".

## Example

```markdown
## Answered
### Q-02 · Do tasks have a due date?
- answer: Superseded by Q-05.

## Objections
- I warned that without a backup the tasks can be lost, and proposed one. The person
  keeps it without. Not reopened without a new reason.
```
