# The topics of how

Every work is made with something, organised somehow, checked somehow, and reaches someone
somehow. Asking only "what is it made with" leaves the rest to chance: a result that works
today and nobody can maintain, check or grow. So the how is always walked through the
same seven topics, whatever the work is; what changes is what each topic means for it.

## The topics

| Topic | What it settles | Something built that runs (app, game, automation, spreadsheet) | Content (book, course, newsletter, video) | Something done in the world (move, event, renovation) |
|---|---|---|---|---|
| **Base** | what it is made with or on, and where | language, platform, where the data is kept | format, what it is written or recorded with | place, suppliers, materials, how the budget is split |
| **Structure** | how it is organised inside, so it can be maintained and grow | how the code is split (architecture), the patterns it follows, how data is reached | how chapters, modules or episodes are cut and linked | who coordinates what, the order of the day, how tasks are split |
| **Quality** | how it is checked to be right, and when | which automated tests, whether tests come first | who reviews, proofreading, a pilot reader | tasting, a rehearsal, a checklist the day before |
| **Conventions** | rules followed every time | naming, code style, language of the code | style guide, tone, how sources are cited | the look of the invitations, how people are contacted |
| **Dependencies** | what comes from third parties | libraries and services | images, music, licences | contracts, deposits, rentals |
| **Delivery** | how it reaches whoever uses it | how it is installed, run or published | where and how it is published | how invitations go out, how the day is handed over |
| **Agent's tools** | what the agent works through to do it well | official documentation, code checkers | spelling and style checkers | a shared list or sheet |

Research or an analysis has the same topics: its sources (base), its method (structure),
how findings are checked (quality), how it is cited (conventions), the data it buys or
borrows (dependencies) and the form of the result (delivery).

## Settling each topic

- **Every topic ends one of three ways:** the person answered it; what already exists
  answers it (`how.md`, the work's files, what the person has); or it does not apply, with
  the reason ("no third parties: everything is yours"). A topic is never skipped in
  silence.
- **Look at what the person already has before recommending:** programs and their
  versions installed on their machine, accounts, suppliers they use. What they already have
  and know is recommended over something new, and said so.
- **A choice that clashes with what the work must do is a question,** never only a line in
  *What it implies*: "started by hand" against "a reminder the day before" asks who sends
  the reminder when it is not running.
- **Only what is missing is asked.** A work that already has `how.md` or files of its own
  is read first; a request to change one choice touches that topic only.
- **Agent's tools is settled by the `tools` skill,** after the other six, with what was
  chosen.
- **Quality is never the agent's alone:** "no automated tests" or "no proofreading" is a
  valid answer, but the person's.

## Finding the options inside a topic

1. **Deduce the axes from the base.** What structure means for a web app in .NET is not
   what it means for a course on video: list the two or three axes that matter for what
   was chosen (for an app: how the code is split, how data is reached, how the domain
   rules are kept; for a course: module length, theory and practice mix).
2. **Give each axis its usual values,** each with what it costs the person later:
   "one folder per feature: a feature is removed by deleting its folder; some code repeats
   between features".
3. **Use a package's values when one is in use** and brings this topic: same question,
   its values. Without a package, the agent's knowledge of the subject is the source; if
   it does not know the field well, say so and propose researching it.

## Order

Ask in rounds, each one built on the one before: the **base** first; then **structure,
quality, conventions, dependencies and delivery**, which depend on the base; then the
**agent's tools**. A round has at most four questions, the ones that unblock most first;
the rest go in the next round, and the message says what comes after.

## How each option is written

- **One decision per question.** Where it runs, what it is made with and where the data is
  kept are three questions, even inside the base: folded into one option, the person
  cannot pick one without the others.
- **What would be used, by its real name:** ".NET 10 with PostgreSQL", "a moving company
  with a truck and three people", "a shared folder in the cloud".
- **What it means for the person:** what it costs, what they have to do or install, what
  they can and cannot do later ("the tasks stay on this laptop only").
- **The one you recommend first,** marked, with the reason in a few words.
- **For a person who does not know the field,** plain words first and the name after:
  "a page that opens in the browser (HTML and JavaScript)".
