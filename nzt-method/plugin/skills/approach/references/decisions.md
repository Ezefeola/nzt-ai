# The topics of how

Every work is made with something, organised somehow, checked somehow, and reaches someone
somehow. Asking only "what is it made with" leaves the rest to chance: a result that works
today and nobody can maintain, check or grow. So the how is always walked through the
same seven topics, whatever the work is; what changes is what each topic means for it.

## The topics

| Topic | What it settles | Something built that runs (app, game, automation, spreadsheet) | Content (book, course, newsletter, video) | Something done in the world (move, event, renovation) |
|---|---|---|---|---|
| **Base** | what it is made with or on, and where | language, platform, where the data is kept | format, what it is written or recorded with | place, suppliers, materials, how the budget is split |
| **Structure** | first its shape (into how many pieces that are delivered or changed on their own it splits, how they talk, and each one's folder), then how each is organised inside so it can be maintained and grow | one app, or an API and a separate front; how the code is split (architecture), the patterns it follows, how data is reached | one book or a series; how chapters, modules or episodes are cut and linked | one event or several (ceremony and party apart); who coordinates what, the order of the day |
| **Quality** | how it is checked to be right, and when; how its versions are kept and a mistake is undone | which automated tests, whether tests come first; version control | who reviews, proofreading, a pilot reader; the document's version history | tasting, a rehearsal, a checklist the day before; copies of what is signed and paid |
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
- **The shape is Structure's first question** whenever the base allows more than one: one
  piece, or several that are delivered or changed on their own, with each one's folder.
  When the shape is already answered, a piece that has no folder yet still gets one,
  asked like any detail.
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
- **No topic is the agent's alone.** The main choices of each topic are asked, in any mode:
  the base, the shape and how each piece is organised inside, how it is checked and how
  versions are kept, the conventions, what comes from third parties, and how it reaches
  whoever uses it. "No automated tests" or "no proofreading" is a valid answer, but the
  person's. When the person will not touch the result ("I just want to use it"), these
  are still asked, with options that say what each one means for them, not how it works.

## Deciding the details

Inside each main choice there are details: a name, a number, an order, a file's place.
Once the questions are written, say how many there are and of which topics, and ask how
the details are decided:

| Mode | Details are |
|---|---|
| **Together** (recommended) | asked like the main choices, in rounds |
| **I propose** | decided by the agent, each one said in the next message under **What I decided**, so the person can change it |
| **You dictate** | said by the person; the agent writes them and warns when one clashes with what was agreed |

The mode is written on the first line of the how log with its date, applies to `do` as
well, and changes whenever the person asks. Only the person's explicit choice of **I
propose** leaves anything to the agent.

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
**agent's tools**.
