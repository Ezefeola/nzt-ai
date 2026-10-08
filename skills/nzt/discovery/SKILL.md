---
name: nzt-discovery
description: Use when what to build has to be established: functional analysis, business rules, scope, feature specs, user stories, or specs derived from existing code.
---

# Discovery — what the system does

This phase is the functional analyst of the set. It establishes **what** something is and
**who** it is for, in business language, and leaves it written down.

## Boundaries

**Owns:** the analysis record and its questions, the product definition, the glossary,
feature specs, user stories and their acceptance criteria, changes to a feature that
already exists, and specs derived from existing code.

**Does not own:** how it is solved (`nzt-architecture`), screens (`nzt-ux`), code
(`nzt-build`). A spec that names a class, a table or a package has drifted into
architecture.

## Required guidance

Before writing, read what this unit depends on: the feature's `analysis.md` if it exists,
the product definition, and the glossary. Reuse what is already loaded — the table below
does not mean load every row.

## Choose the reference

Paths are relative to this skill's folder. **Read the file before acting on the row** — the
row is not the guidance, the file is.

| The unit is | Read | Read with |
|---|---|---|
| Interviewing the user and recording answers under stable `Q-NN` | `references/analysis.md` | — |
| Product objectives, users, modules, scope | `references/product.md` | — |
| Domain vocabulary and what each term means here | `references/glossary.md` | — |
| A feature: scope, business rules, non-functional requirements | `references/write-spec.md` | — |
| One story: acceptance criteria with area coverage | `references/write-stories.md` | — |
| A functional change to a feature that already exists | `references/change.md` | `references/write-spec.md`, `references/write-stories.md` |
| Behavior that exists only as code | `references/reverse.md` | `references/analysis.md` |

Wherever a file names `nzt-discovery-<name>`, it means `references/<name>.md` in this
folder (`nzt-discovery-change` → `references/change.md`): read that file — it is not a skill.

## One unit

One document. One product definition, one glossary, one feature spec, **one story**, one
module reverse-engineered, one change proposed and merged. Never two in the same unit.

## Where it lands

- The product definition → `Docs/product.md`; the glossary → `Docs/glossary.md`
- The feature — scope, rules, NFRs, story index → `Plan/specs/<feature>/spec.md`
- The interview, append-only → `Docs/analysis.md` for the product,
  `Plan/specs/<feature>/analysis.md` for a feature
- One story per file → `Plan/specs/<feature>/stories/US-NNN-<slug>.md`
- A change to an existing feature → `Plan/specs/<feature>/change.md`, temporary: it is
  merged into the spec and its stories, and then deleted
- The feature folder is `F-NNN-<slug>`. That is what `<feature>` stands for everywhere

## Rules

- **Two altitudes, and both have to close.** Product analysis is not written by reading the
  repository; feature analysis can be. Features emerge from the conversation, and the
  product document is the minutes of what the phase established — not the other way round.
- **The analysis file is append-only.** A superseded answer is marked (`replaced by Q-07`),
  never rewritten and never deleted. Questions go into the file with an empty answer as
  soon as they accumulate, not when the user answers them.
- **Ask in behavior.** If you cannot phrase the question without naming a table, a package
  or a vendor, it is not functional. Ask the edges question early: does anything else need
  to know about this, or does this depend on something another system knows?
- **Technical notes get no identifier here.** Write down what they will decide and leave
  them for architecture. Do not investigate them in this phase.
- Business rules live in the feature; stories cite them and never copy them. A rule carries
  a slug that never changes and an `origin:`.
- Write scope in both directions. What is excluded is worth as much as what is included.
- A non-functional requirement states an expected result, never a mechanism.
- An objection the user dismissed is part of the answer: what you warned, what you
  proposed, and that the user is keeping it. It is not reopened without a new argument.
- **Reverse engineering never declares a business rule.** Describe the behavior; the user
  decides whether it is a rule, a bug or an accident. Report the silent areas of the slice
  as well: silence reads as "there was nothing there" and hides "I did not look".
- Playback before closing, in three blocks: **agreed · proposed by me · pending**. Nothing
  you proposed counts as agreed until the user confirms it.

## Done when

You could write the artifact this feeds — the product definition, or the feature with
**all** its stories — without asking anything else. If you cannot, the gaps are written
down as open questions. They are never invented.

## Closing checklist

- [ ] Every question is in the file, with its `Q-NN`, written before it was asked.
- [ ] Every rule has its slug and its `origin:` (`Q-NN`, `PRD` or `reverse`).
- [ ] Scope written in both directions.
- [ ] Every story has at least one unhappy path, or the stated reason it does not apply.
- [ ] Every criterion is declarative, has one *When*, and uses concrete example data.
- [ ] No criterion names a technology.
- [ ] Playback delivered, and everything pending left in the file.
