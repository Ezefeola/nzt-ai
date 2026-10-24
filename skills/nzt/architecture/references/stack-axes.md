# Stack axes

## Contents
- Where the options come from
- The axes
- Asking an axis
- An existing component
- Closing checklist

Which axes a stack document answers, where the options of each one come from, and how they are
asked. `stack.md` is the file those answers land in; this is how they are obtained.

## Where the options come from

**This reference invents no option, and neither do you.** An option exists because a build
table selects a reference by it. The values below are copied from those tables, and those tables
are the source when they disagree:

| Options for | Live in |
|---|---|
| Any backend | `../nzt-build/references/practices-backend.md`, *Exclusive axes* |
| Any frontend | `../nzt-build/references/practices-frontend.md`, *Exclusive axes* |
| A technology with an area router | that router's *Exclusive axes* — `nzt-build`'s table names each one, and only the router of the technology this component chose is read |

- **The value is written exactly as the table spells it** — `vertical-slice`, `direct`,
  `minimal-apis`. The tables match the text, so a synonym or a translation selects nothing, and
  the build phase stops to ask it again.
- **The axes of a technology's router are added to the generic ones, never instead of them.**
  The same axis in both has the same values.
- **A concept no table offers is a gap, not an option.** Say this set has no guidance for it,
  record it as an open `QT-NN`, and let the user decide whether to adopt an offered concept or
  keep theirs knowing the build phase will follow the code next to it.

## The axes

**Exclusive axes**: one value each, from the tables.

| Axis | Area | Values today | What it costs |
|---|---|---|---|
| Architecture | backend | `vertical-slice` | one folder per feature, and removing it is deleting the folder; a duplicate between slices is accepted as the cheap problem |
| | | `clean-architecture` | four layers in separate units, every reference pointing inward; one feature touches several units |
| | | `hexagonal-architecture` | a core with every contract, and one unit per adapter, one external system each; more units, every outside dependency isolated |
| Domain model | backend | `ddd` | entities and aggregates protect their own rules; more modelling up front — then the **DDD** opt-in in `stack.md` is answered too |
| | | `anemic` | entities carry data, use cases carry the rules; cheap, and a rule two use cases need is duplicated |
| Persistence | backend | `repositories` | one per aggregate root with its interface, plus a unit of work; a seam for tests, and a layer on every query |
| | | `direct` | use cases use the data access handle itself; less code, tied to that library |
| Architecture | frontend | `vertical-slice` | one folder per feature, with its page and its typed client |

Domain model and persistence are asked separately: neither implies the other.

**Technology axes**: named from evidence or chosen, with no list of values here. Runtime,
language, database, the data access library, the test framework, and, for a frontend, its
framework. Each is written with its version as `stack.md` says.

**The area router's own axes** come after both — for example, how endpoints are written or where
a component renders. They are asked only once that technology is chosen, from that router's
table.

## Asking an axis

An axis is a tradeoff, so it is **asked in every mode**, with a recommendation — never decided
alone, and never asked before the technology that decides which router's axes apply.

- **Asked the way the kernel's *Communication* says**: one question per axis with its `QT-NN`, its
  options the values of the table, each value's cost as its consequence.
- **Group them into one round**, ordered by what depends on them: the technology first, then the
  generic axes, then the router's.
- **Each answer is written as it arrives**: the `QT-NN` in `Docs/Architecture/architecture-decisions.md`
  with where it came from, and the value in the stack's axis table. An answer outside the
  options is a gap (above), never a new value.
- **What the project already decided is not asked again.** The stack and the decisions log are
  read first.

## An existing component

The axes come **from the code**, not from questions: the value the code shows is the one in the
table. Only what the evidence cannot settle is asked — two patterns at once, or a concept no
table offers — and that is the user's decision, as `stack.md` says.

## Closing checklist

- [ ] Every value was copied from a build table, spelled exactly as there.
- [ ] The generic axes were answered, plus the router's own axes when the technology has one.
- [ ] Each axis was asked with its options, its cost and a recommendation, as the kernel's
      *Communication* says, in one round.
- [ ] Every answer has its `QT-NN` and its row; a concept outside the tables is an open gap,
      not an invented value.
- [ ] An existing component's axes came from its code, and only what the code cannot settle
      was asked.
