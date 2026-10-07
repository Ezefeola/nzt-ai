---
name: nzt-build-refactor
description: Use when code structure changes but behavior must not, with evidence that what it touched still does the same thing.
---

# Refactor

Produces a change that leaves behavior **identical** and the evidence that it still is.
Same inputs, same outputs, same side effects, same errors.

If you did not arrive here from `nzt-build`, load it first.

## No new spec, but not no verification

A refactor needs no new functional specification, because nothing the user observes
changes. What it does need:

- **Verification of the existing behavior it touched.** Run the checks that cover it,
  before and after.
- **The technical documents kept current.** If the structure a stack document or a feature
  design describes is the structure you just changed, it is updated in the same unit.

## First: can you tell if behavior changed?

If nothing covers the code you are about to move, you cannot know you preserved it, and a
refactor without that answer is a rewrite with optimism.

- Write the covering test first, against the **current** behavior, and make it pass before
  you touch anything. It stays afterwards.
- When it genuinely cannot be tested, say so, write down what you checked by hand and how,
  and treat the result as unverified. Do not report it as safe.
- Current behavior is the baseline **even when it looks wrong**. A bug preserved by a
  refactor is a bug; a bug fixed inside a refactor is an unreviewable change. Report it and
  fix it in its own unit.

## One reason at a time

- **Never mix a behavior change into a refactor.** The whole value of this unit is that
  anyone reviewing it knows nothing changed. Two reasons in one diff means every line has
  to be re-read to find out which is which.
- If you need both, they are two units, and you say which one goes first.
- No opportunistic renames or reformatting outside what the unit is about. A diff that
  touches forty files to change three is a diff nobody reviews.

## Scope discipline

- Keep the public contract unless changing it **is** the unit: same signatures, same routes,
  same payloads. When the contract has to move, every caller moves with it in the same
  unit, or the old shape stays until they do.
- Code you find that is dead — nothing calls it, nothing can reach it — can go, and you say
  so in the report. Removing **behavior** is not this skill: that is a sweep, and it is
  `nzt-build-remove`.
- What you find and are not fixing is reported, not fixed in passing and not left silently.

## Technical debt

Paying debt is a refactor like any other, with the same rules. Taking debt on is a decision
with a cost, so it is named, not absorbed: say what was left undone, why, and what it will
cost to do later. A shortcut nobody wrote down is a shortcut that gets discovered by
whoever breaks on it.

## Closing

- What is affected compiles, and the checks covering the touched behavior have been run
  **after** the change, not just before.
- **Criteria whose area was already marked `✓` and whose code you touched have their tests
  re-run**, or their mark is reported as no longer backed by evidence. A green mark that
  nobody re-checked after a restructure is worse than no mark. A `qa ✓` on touched code is
  reported for `nzt-verify` to re-run — not re-tested here.
- The report says what moved, what it is now, and what you verified — not "cleaned up".

## Done when

Rehearse it: could someone diff this change and be sure nothing the user can observe moved?

- The behavior it touched was covered before the change and passes after it.
- Nothing in the diff changes what the system does.
- Documents describing the structure you changed are current.
- Anything left undone is written down, with its cost.
