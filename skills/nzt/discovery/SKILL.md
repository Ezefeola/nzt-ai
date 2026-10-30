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
| Interviewing the user and recording answers under stable `Q-NN` | `references/analysis.md` | `../nzt-plan/references/questions.md` |
| Product objectives, users, modules, scope | `references/product.md` | — |
| Domain vocabulary and what each term means here | `references/glossary.md` | — |
| A feature: scope, business rules, non-functional requirements | `references/write-spec.md` | — |
| One story: acceptance criteria with area coverage | `references/write-stories.md` | — |
| A functional change to a feature that already exists | `references/change.md` | `references/write-spec.md`, `references/write-stories.md` |
| Behavior that exists only as code | `references/reverse.md` | `references/analysis.md`, `../nzt-plan/references/questions.md` |

Wherever a file names `nzt-discovery-<name>`, it means `references/<name>.md` in this
folder (`nzt-discovery-change` → `references/change.md`): read that file — it is not a skill.

## One unit

One document. One product definition, one glossary, one feature spec, **one story**, one
module reverse-engineered, one change proposed and merged. Never two in the same unit.
Adding or changing the glossary entries for the terms a unit introduces is part of that
unit, not a second document.

## Mandatory

**The product definition and the glossary are mandatory.** A new product writes both in
Analysis, before its first spec; an existing one without them gets them when a feature
enters Analysis, the glossary with that feature's terms. **In standard work or an existing
product, the product definition is a first version** (`references/product.md`) that grows
with each feature, not a whole product interview first. **The glossary is never left
behind**: every unit that introduces, renames or narrows a term — spec, story, change,
reverse engineering — updates its entry in the same unit, code name included. A term build
needs and the glossary lacks comes back here as an entry, never as a name coined in code.

## Where it lands

- The product definition → `Docs/Product/product.md`; the glossary → `Docs/Domain/glossary.md`
- The feature — scope, rules, NFRs, story index → `Plan/specs/<feature>/spec.md`
- The interview, append-only → `Docs/Product/analysis.md` for the product,
  `Plan/specs/<feature>/analysis.md` for a feature
- One story per file → `Plan/specs/<feature>/stories/US-NNN-<slug>.md`
- A change to an existing feature → `Plan/specs/<feature>/change.md`, temporary: it is
  merged into the spec and its stories, and then deleted
- The feature folder is `F-NNN-<slug>`. That is what `<feature>` stands for everywhere

## Rules

Each reference holds the rules of its own document. These hold for every unit of the phase:

- **Business rules live in the feature**, each with a slug that never changes and an
  `origin:`. Stories, changes and screens cite them by slug and never copy them.
- **What is not known is a question, never an invention**: it goes into `analysis.md` with
  its `Q-NN`, and the unit that needs it says it is open.

## Done when

The unit's reference says its own *Done when*, and it holds. Every term the unit introduced
or changed is in the glossary.
