---
name: nzt-verify-test-design
description: Use when the test cases of a story are derived: the technique per rule, the cases techniques never generate, and the coverage table.
---

# Test design

Produces the pre-run half of `Plan/specs/<feature>/testing/<story>.md`: the scenarios, their
data, their expected result and their material effects — **written and approved before
anything is executed**.

If you did not arrive here from `nzt-verify`, load it first.

## Where the expected result comes from

**From the requirement, never from the current behavior.** Reading the system to find out
what to expect turns the test into a description of what is already there, which cannot
fail.

- A rule that does not say what happens at the edge is **a question for analysis** (`Q-NN`),
  not a decision you make while designing tests.
- A scenario whose expectation no requirement supports is not a bug when it fails: it is a
  question.

## Derive the cases, do not list them

A list written by intuition repeats the happy path and misses the edge where the defect
lives. Match the shape of the rule to its technique:

| The rule looks like | Technique | What you get |
|---|---|---|
| Ranges or categories | Equivalence partitions | One case per class, not per value |
| A threshold or limit | Boundary values | At it, just under, just over |
| Conditions that combine | Decision table | Every combination that changes the outcome |
| An entity with a lifecycle | State transitions | Legal transitions, and the illegal one |
| Many independent parameters | Pairwise combinations | Coverage without the full product |
| A user goal across screens | Use-case walkthrough | The path, with its interruptions |

## What no technique generates for you

Go looking for these every time; they are where the expensive defects are:

- **Someone else's resource.** The same action, by a user who should not reach that record.
- **Repeated or concurrent.** The second submit, two at once, the double click.
- **The interrupted flow.** Closed mid-way, session expired, back button, refresh.
- **Empty and enormous data.** Nothing at all, and hundreds of rows or a huge amount.
- **A dependency down.** The external system is slow, unavailable, or answers an error.

## Priority by risk

Risk is **impact × likelihood**, on a four-cell matrix. **Security and data loss are high
impact even when unlikely** — they do not get demoted for being rare.

When time or the environment cut the run short, say what was left out and at what priority.
**A low-risk case that was not run is a reported gap, never a silent omission.**

## Traceability, both ways

```markdown
## Coverage
| Criterion | Scenarios | State |
|---|---|---|
| US-002 CA-01 | E-01, E-02 | pending |
| US-002 CA-02 | — | **no scenario** |
```

- A criterion with no scenario appears as **no scenario**. An empty cell is invisible; those
  two words are what makes the gap countable.
- Going the other way: a scenario that traces to no criterion is either a missing criterion
  or an invented expectation. Resolve which before running it.

## The scenario

```markdown
### E-02 · An expired coupon leaves the total untouched
- **Covers:** US-002 CA-01 (RN-cupon-vencido)
- **Data:** order of $10.000; coupon `INVIERNO20`, expired 2026-05-01
- **Preconditions:** the customer is logged in with an order in progress
- **Steps:** apply the code at checkout
- **Expected:** the total stays $10.000 and the coupon is reported as expired
- **Material effects:** none
- **State:** pending
```

- **Data is concrete.** The criterion already gave you the amounts and the dates; use them.
- **Material effects are declared per scenario** — payments, messages, deletions. An unknown
  destination or a missing authorisation **blocks that scenario**; the rest go ahead.
- **Status vocabulary is closed**: `pending`, `passed`, `failed`, `blocked`. `blocked`
  always carries its cause. Without a closed vocabulary, *"it mostly worked"* gets into the
  document.
- Preconditions you cannot reach are a data problem to solve, not a result. Creating them is
  part of running the scenario.

## The plan is approved before anything runs

Write the whole set, show it, and stop. **Being asked to test authorises writing the plan,
not skipping that stop.** The approval covers the whole plan — you do not ask again per
scenario.

## Done when

Rehearse it: could someone else run this set, exactly as written, and get the same verdicts
you would?

- Every criterion appears in the coverage table, including the ones with no scenario.
- Every scenario says what it covers, its data, its expected result and its material
  effects.
- Every expected result traces to a requirement, not to the running system.
- The edges the techniques do not generate were looked for and either written or dismissed
  with a reason.
- Priorities are set, and what will not be run is named as a gap before it becomes one.
