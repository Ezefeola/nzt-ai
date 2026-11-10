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
2. **Before writing it, check it is a question:**
   - already answered in a log, a definition, `how.md` or the folder → read it there;
   - a fact that can be checked (a version, a price, an opening time) → research it with
     its source and say it;
   - what was agreed leaves only one way to do it (a name built by the agreed conventions,
     a free port, a file in the agreed folder of its kind) → just do it;
   - more than one reasonable way, with the mode **I propose** on the first line of the
     how log (`approach` asks it) → decide it and say it under **What I decided**;
   - anything else → ask it. More than one reasonable way is a choice however small or
     internal: what the person sees, uses or pays, a pattern or structure the result
     repeats, a library, anything beyond what was asked.
3. **Record the answer in the person's words, with the date.** An inferred answer is not an
   answer: the question stays open. A value you would propose is asked as an option,
   recommended, never written down as agreed.
4. **An unclear answer is asked again at once:** one that picks none of the options, can be
   read two ways, or is itself a question. Rephrase it in plainer words, with the options
   again, before doing anything that depends on it.
5. **Only append.** A changed answer is marked *superseded by* the new id, never rewritten.
6. **An open question does not stop the rest:** what does not depend on it goes on; the
   step that needs it asks it when it gets there.
7. **It closes with an answer, or with `[out]`** when the person takes it out of scope.
8. **Headings, ids and field names** (`blocks`, `proposed`, `answer`) stay in English; the
   rest is in the person's language. `proposed` holds the options while the question is
   open.

## Options

When a question is a choice, each option is written so the person can pick it without
knowing the field, already in the log's `proposed` line, not only when it is asked:

- **One decision per question.** Two choices folded into one option cannot be picked apart.
- **No choice hidden inside another.** When an option carries a second costly choice (a
  framework that runs in two modes, a template or a supplier's package with its own
  defaults), the option names it or it becomes its own question. A default is never taken
  in silence.
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
