---
name: nzt-verify-automate
description: Use when approved scenarios that already passed by hand become automated tests: what qualifies, and how a failing test is diagnosed first.
---

# Automated regression

**This applies only where the stack document selected it** — an end-to-end tool, named.
An absent field does not enable it, and a tool being installed is not a decision to use it.

Produces automated tests for scenarios that are already approved and already passing.

If you did not arrive here from `nzt-verify`, load it first.

## What qualifies

A scenario is automated when all three are true:

- It is **approved** in the test plan.
- It has **passed by hand** at least once.
- Its expected result depends on no open question.

**A scenario that never passed is not automated to find out whether it passes.** That is
running it for the first time through the most expensive possible mechanism, and a red test
that was never green tells you nothing about what broke.

Automate what is worth running forever: the paths that carry money, permissions, data loss,
and the defects you already found once. Not everything that is automatable is worth
maintaining.

## Writing the test

The same rules as running by hand, because it is the same act, delegated:

- **Locate by role and accessible name.** A selector tied to markup breaks on every
  restyle and teaches the team to distrust the suite.
- **Wait for observable conditions**, never for fixed time. A sleep is a flaky test with a
  delay fuse.
- **Each test creates the data it needs and does not depend on another test's leftovers.**
  Order-dependent suites fail in whatever order the runner picks tomorrow.
- Assert the scenario's expected result, the one the plan wrote — not what the application
  happens to produce today.

## When one fails, diagnose before you touch it

Four possibilities, and they have different answers:

| Diagnosis | What you do |
|---|---|
| **Product regression** | It is a bug. Open it; the test is right |
| **Broken test** — a locator or a timing assumption | Fix the test; the expectation does not move |
| **Outdated scenario** — the requirement changed | The spec changes first, then the test |
| **Flaky** | Quarantine it **with its cause written**, and fix the cause |

**Never change the expected result to make a test pass.** The expectation moves only when
the requirement moved, and that goes through the spec.

This holds for tooling that "repairs" tests on its own: **accept a locator fix, reject
anything that changes what is asserted.** A suite that heals itself into agreeing with the
product is a suite that cannot fail.

A flaky test goes to quarantine with its cause, not to the bin. Deleting it removes the
symptom and keeps the defect, which is usually a real race in the product.

## Keeping the suite honest

- A test that fails for a reason nobody explains is not "known"; it is unverified, and it is
  reported that way.
- When a scenario is removed from the plan, its automated test goes with it.
- The test index says which scenarios are automated, so the manual run stops repeating them
  blindly.

## Done when

Rehearse it: would this test fail if — and only if — the behavior it protects broke?

- Every automated scenario was approved and had passed by hand.
- Nothing is located by brittle markup or waits on a fixed time.
- Each test builds its own data.
- Every failure in this unit was diagnosed into one of the four categories.
- No expectation was edited to get to green.
