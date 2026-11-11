# Technical debt

Produces `Docs/Architecture/tech-debt.md`: technical work found and **deliberately** not done,
so it is not lost in a chat that ended.

An entry is born when **the user decides not to do it now**. Found and fixed in the same
unit: nothing. Found and undecided: the unit's report says it, this file waits.

## The file

```markdown
# Technical debt — Pedidos

## Open

### TD-004 · The total is calculated in two places
Detected: 2026-08-14 · backend, while implementing US-008
Where:    the checkout use case and the basket recalculation
Impact:   every pricing change is made twice; it already went out of sync once
Why left: the user chose to close F-003 first

## Resolved
- TD-001 · N+1 in the orders listing — resolved 2026-08-11
```

## Rules

1. `TD-NNN` is correlative and never reused, so a request can say *"fix TD-004"*.
2. `Where:` is concrete — files, classes, tables are right here.
3. `Impact:` states what breaks or costs, never a priority; if it already bit, say so.
4. `Why left:` is mandatory: it separates accepted debt from an oversight.
5. No checkboxes: entries move from Open to Resolved, collapsed to one line, never deleted.
6. Not debt: a defect (`nzt-verify`), a missing feature (`nzt-discovery`), a preference, a
   document that drifted from the product (`nzt-verify`'s audit).
7. Resolving one: read it, fix it with `nzt-build`, verify what it touched, collapse it, and
   update affected documents. Reading this file authorises nothing.

## Done when

Anyone could pick up an open entry six months from now without asking what it meant.
