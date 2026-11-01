---
name: nzt-ddd
description: Use when tech.md lists the ddd pack - drawing aggregate boundaries in the domain model, the context map, their diagrams, or writing entities, aggregates and value objects that protect their own rules.
---

# Domain-Driven Design

Two sides: the **model** (aggregates and contexts, in `Docs/Domain/`) and the **code** (an
entity that protects its rules). A technology pack (`nzt-dotnet`…) reads the code files here
first and adds only how it is written there.

## Opt-ins

Asked with `tech.md`, each piece answered; a piece not `yes` is not built, and adopting it
later is the user's change to that line.

- **DDD:** aggregates · value objects · domain events · typed ids

| Piece | What it costs |
|---|---|
| aggregates | boundaries drawn from rules; loading and saving by root |
| value objects | a type per rule-bearing value, mapped on every store |
| domain events | an event and a handler per reaction between aggregates |
| typed ids | a wrapper per id, converted at every boundary |

## References

| The work is | Read | Read with |
|---|---|---|
| The domain model's aggregates: boundaries, roots, references by id | `references/aggregates.md` | `nzt-architecture`'s `references/domain.md` — first |
| More than one context, or meaning shared with a third party | `references/contexts.md` | — |
| Drawing `bounded-contexts` or `aggregates` | `references/diagrams.md` | `nzt-architecture`'s `references/diagrams.md` — first |
| An entity or aggregate in code: rules, creation, changes | `references/ddd.md` | — |
| A value object in code — **only with *value objects yes*** | `references/value-objects.md` | `references/ddd.md` |

## Steps

1. Read the DDD line in `tech.md`. Without one, ask it before modelling.
2. Read the rows the task selects; build only the pieces marked `yes`.

## Done when

No piece without `yes` was built, and each file's *Done when* holds.
