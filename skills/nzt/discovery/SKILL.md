---
name: nzt-discovery
description: Use when what it must do and for whom has to be agreed - purpose, rules, scope, vocabulary, specs and stories, changing what was agreed, or reconstructing it from existing work.
---

# Discovery — what it must do and for whom

Establishes **what** something must do and **who** it is for, in the words of the people it is
for, and writes it down. **Does not own** how it is made (`nzt-architecture`), its form
(`nzt-design`) or the work (`nzt-build`): a spec naming a technology or a structure has drifted.

## References

| The unit is | Read | Read with |
|---|---|---|
| Interviewing the user and recording answers under `Q-NN` | `references/analysis.md` | `../nzt-plan/references/questions.md` |
| Objectives, users, modules, scope, delivery 1 | `references/product.md` | — |
| Domain vocabulary and its code names | `references/glossary.md` | — |
| A feature: scope, rules, non-functional requirements, story index | `references/write-spec.md` | — |
| One story and its criteria | `references/write-stories.md` | — |
| A functional change to an existing feature | `references/change.md` | `references/write-spec.md`, `references/write-stories.md` |
| Behavior that exists only in the product (code, content, data) | `references/reverse.md` | `references/analysis.md` |

## Steps

1. Read the feature's `analysis.md` if any, `product.md` and the glossary.
2. Do **one document per unit**: one product definition, glossary, spec, story, reversed
   capability, or change.
3. What is not known is a question in `analysis.md` with its `Q-NN`, never an invention; the
   unit that needs it says it is open.

## Mandatory

The product definition and the glossary. A new product writes both before its first spec; in
standard work or an existing product, `product.md` starts as a first version that grows per
feature. Every unit that introduces, renames or narrows a term updates its entry, code name
included; a term build needs and the glossary lacks comes back here first.

## Where it lands

- `Docs/Product/product.md` · `Docs/Domain/glossary.md`
- The interview, append-only → `Docs/Product/analysis.md` (product) or
  `Plan/specs/<feature>/analysis.md` (feature)
- The feature → `Plan/specs/<feature>/spec.md`; one story per file →
  `Plan/specs/<feature>/stories/US-NNN-<slug>.md`
- A change proposal → `Plan/specs/<feature>/change.md`, deleted once merged
- `<feature>` is always `F-NNN-<slug>`.

## Rules

- **Rules live in the spec**, each with a slug that never changes and an `origin:`. Stories,
  changes and screens cite the slug and never copy the rule.

## Done when

The unit's reference *Done when* holds, and every term it introduced or changed is in the
glossary.
