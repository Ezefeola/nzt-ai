# Technical debt

Produces `Docs/Architecture/tech-debt.md`: the technical work that was found and deliberately not done.
It exists because the alternative is losing it — a report in a chat that ended is a decision
nobody can act on three months later.

It lives in `Docs/` because it is technical: *"the use case mixes validation with
persistence"* cannot be written in the user's vocabulary, and in `Plan/` it has no place.

## It records a decision, not a wish

An entry is born when **the user decides not to do it now**. Until then, what you found goes
in the report of the unit, not in this file: an entry nobody agreed to is a to-do list the
agent wrote for itself.

- Found while building, verifying or shipping, and left out on purpose → an entry.
- Found and fixed in the same unit → nothing. A defect in your own change is repaired, not
  recorded.
- Found and still undecided → the report says it, and this file waits.

## The file

```markdown
# Technical debt — Pedidos

## Open

### TD-004 · The total is calculated in two places
Detected: 2026-08-14 · backend, while implementing US-008
Where:    the checkout use case and the basket recalculation
Impact:   every pricing change has to be made twice; it already went out of sync once
          with shipping
Why left: the user chose to close F-003 first

### TD-005 · The orders listing has no index for the customer filter
Detected: 2026-09-02 · backend, while verifying US-012
Where:    Orders table, the query behind the by-customer listing
Impact:   fine at today's volume; the filter degrades from a few thousand orders on
Why left: agreed to measure it before adding the index

## Resolved

- TD-001 · N+1 in the orders listing — resolved 2026-08-11
```

**No checkboxes.** Progress in NZT is read from the criteria of a story, in one place only;
a checkbox here would be a second place where something looks done. An entry moves from
**Open** to **Resolved** instead.

## The fields

- **`TD-NNN`, correlative and never reused.** That is what lets a later request say *"fix
  TD-004"* without describing it again.
- **`Detected:`** — date, area, and during what. The context is what makes it possible to
  judge later whether it still applies.
- **`Where:`** — this is `Docs/`, so **naming files, classes and tables is right here**. The
  rule that keeps code out of documents applies to `Plan/`. A vague *"in the pricing module"*
  is debt nobody can pick up.
- **`Impact:`, never a priority.** A priority field ages, and in three months everything is
  high. Impact is a fact: what breaks, or what it costs. **If it already bit once, say so** —
  that is the strongest argument an entry can carry.
- **`Why left:` is mandatory.** It is the difference between accepted debt and an oversight,
  and without it the whole list stops being trusted.

## What is not debt

- **A bug.** One that contradicts the spec is repaired against its criterion; one the spec
  says nothing about is a gap that gets defined before it gets built. `nzt-verify-bug` owns
  the record either way.
- **A missing feature.** That is a feature, and it goes through discovery.
- **A preference.** *"I would have named that class differently"* has no impact to state.
- **A documented claim that no longer matches the code.** That is drift, and
  `nzt-verify-audit` gives it its verdict.

## Resolving one

A request can cite the identifier and nothing else. Then: read the entry, repair it with the
build skills, verify the behavior it touched, and **collapse the entry into one line under
Resolved** — never delete it, because one line is cheap and it is the record. Keep the
technical documents its fix affected current in the same unit, the stack included.

**Reading this file is not authorisation to fix all of it.** An entry becomes work when the
user asks for it, or when the plan includes it.

## Done when

Rehearse it: could someone pick up any open entry six months from now without asking you
what it meant?

- Every entry has an identifier that was never reused.
- `Where:` is concrete enough to act on without a survey.
- `Impact:` says what breaks or what it costs, and no entry carries a priority.
- `Why left:` is present, and names the decision that left it.
- It is debt, not a bug, a feature, a preference or document drift.
- A resolved entry was collapsed into one line, not deleted.
