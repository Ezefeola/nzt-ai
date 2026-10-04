# Closing a feature

## Contents
- What has to be true before it starts
- Read the two signals first
- 1 · Sweep the markers
- 2 · Bring the affected documents current
- 3 · Write the history entry
- 4 · Stop the way every unit stops
- Done when

Produces a feature nobody has to interpret again: no marker left over, every document it
touched current, and one entry in `Docs/history.md` saying what changed and why.

**One pass over the whole feature, never one per story.** The documents and the history are
transversal to all of its stories, and closing story by story would write the same entry
five times.

## What has to be true before it starts

The feature closes when **the user has accepted the work**, not when the code compiles:

- Every criterion of every story is `[x]`, with every area of the story and its `qa` marked
  `✓`.
- The user accepted them. Your verification and their acceptance are different things, and
  only the second one closes.
- `Plan/specs/<feature>/testing/README.md` has no open bug, and no criterion sitting without
  a scenario that was agreed to have one.
- **Deploying is not a condition.** If the agreed plan included ship, the release has to be
  verified in its environment and logged in `Docs/releases.md`; if it did not, the feature
  closes undeployed.

Anything missing is named and the close stops. A close that hides one unverified criterion
turns the whole spec into a claim nobody can trust.

## Read the two signals first

- **A change proposal in the feature folder** → there is a change **not yet approved**. It is
  approved and merged with `nzt-discovery-change`, or dropped, before closing.
- **Markers in the spec or the stories** → there is a change **approved and not yet
  finished**. Finish it, or the close is premature.

A `[SPEC-CONFLICT]` is never swept: it means the spec contradicts itself and the answer is
still missing. Resolve it with the user first.

## 1 · Sweep the markers

A `[remove]` left stuck on a rule turns the spec into a lie, and nothing else detects it.

- **`[modify]`** — the marker goes; the text that replaced the old behavior stays as the
  present tense of the spec.
- **`[remove]`** — the retired rule **disappears**. It is not annotated as retired: the spec
  says what the system does, not what it stopped doing. What stays is the positive statement
  of today's behavior, and the record that the rule ever existed is the history entry, which
  is why step 3 is not optional.
- **A transitional criterion that only asserted an absence** is replaced by the positive
  criterion that took its place, or removed with the rule. **Its regression test stays.**
  Sweeping a marker never authorises deleting a test; if the absence is still required, the
  criterion stays too.

## 2 · Bring the affected documents current

Most of this already happened while building — documents are part of the change, not an
afterthought. This sweep catches what was missed, and it is mechanical: go down the column
and decide which rows this feature fired.

| If the feature changed | Check |
|---|---|
| a term's meaning, or introduced one | `Docs/glossary.md` |
| an entity, a field, a relationship, an aggregate boundary | `Docs/domain-model.md` |
| a context, a dependency between contexts, a domain event | `Docs/context-map.md` |
| a component, a boundary, an external system | `Docs/architecture.md` |
| a technology, a version, a package, an area or an opt-in | the stack document of each area |
| a decision that is expensive to reverse | `Docs/adr/` |
| the product's objectives, users, modules or scope | `Docs/product.md` |
| a screen, a shared component or a visual role | the UX documents — read their `update-when` |
| what the end user does, and the manual **already exists** | `Docs/manual/` — the chapter of each task this feature changed (`nzt-ux-manual`). The manual is written at the end of a delivery; a close never creates one |
| environments, pipeline, rollback | `Docs/deployment.md` |
| technical work found and deliberately left | `Docs/tech-debt.md` |
| its own flows, data or integrations | `Plan/specs/<feature>/tech-design/` |

Each one is updated with **its own skill**, and a stack document describes what was actually
adopted, never what was planned.

## 3 · Write the history entry

`Docs/history.md` is append-only, newest on top, one entry per closed change cycle — the
birth of the feature, or each approved change that was merged and finished. **Never one per
story and never one per criterion**: the history records decisions, and progress is read
from the criteria.

```markdown
# History — Pedidos

## 2026-08-16 · The coupon stops applying to shipping — F-003
Type:     modify
Change:   the discount is calculated over the products' subtotal.
Reason:   the user asked for it — shipping was eating the promotion.
Before:   it was calculated over the total, shipping included.
Now:      it is calculated over the subtotal.
Impact:   RN-base-de-calculo changed · RN-acumulacion removed · US-008 changed
Decision: the frontend does not recalculate; it shows what the backend returned (QT-04)

## 2026-08-09 · Discount coupons — F-003
Type:     add
Change:   the total accepts one discount coupon.
Reason:   retention campaign, objective O-2 of Docs/product.md.
Impact:   US-008 new · US-014 new · Coupon added to the domain model
```

- **`Type:` is one of four** — `add`, `modify`, `remove`, `deprecate` — and it is what lets
  the dangerous ones be read at a glance.
- **`Before:` and `Now:` are mandatory in `modify` and `remove`, and absent in an `add`.**
  This is structure, not style: step 1 deleted the removed rule from the spec, so these two
  lines are the only surviving record that it ever existed.
- **`Impact:` cites rules by slug and stories by id**, never a criterion — criteria have no
  stable identifier, so pointing at one creates a dead reference that looks valid.
- **`Decision:` is one line and cites its record**, the `QT-NN` of the design or its ADR. It
  never restates it. If a `[SPEC-CONFLICT]` changed the outcome, this is where the decision
  taken in that conversation is recorded.
- A `deprecate` produces **two entries**, months apart: one when it is marked, with what
  replaces it, and one when it is actually removed.
- No paths, classes, tables, packages or patterns: this is the product's history, not the
  repository's. *"The calculation moved into a use case"* is not an entry — behavior did not
  change, so there is nothing to record.

## 4 · Stop the way every unit stops

Safe point, then `Plan/state.json`, then the report. The feature's units close as `done`,
what stayed open is named, and the report says what was accepted, what was swept, which
documents moved and what was left as deferred work.

## Done when

Rehearse it: could someone reading only the spec believe every word of it, and could someone
reading only the history say what this feature used to do?

- The user accepted every criterion, and nothing unverified was counted as closed.
- No marker survives, and no `[SPEC-CONFLICT]` was swept instead of resolved.
- Every rule that was removed is gone from the spec and alive in the history.
- No regression test was deleted along with a marker.
- Every document the table pointed at is current, written with its own skill.
- One history entry for the whole cycle, with `Before:`/`Now:` where the type demands them.
- State written before the report, and what remains is visible in both.
