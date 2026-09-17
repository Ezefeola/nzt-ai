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

## The target changes the case, not the technique

The techniques above are the same for every target; **what you can observe is not**. A
criterion covered in two areas usually needs a scenario in each, and each one asks its own
question:

- **Against the API**: the rule at its edges, the same call by someone who may not make it,
  the shape of the error, and what ended up persisted. Nothing about what the user sees.
- **Against the screen**: the user's task from where they actually start, the loading, empty
  and error states, what is reachable and what is not, and whether the message means
  something to a person. Nothing about what the rule does for another client.
- **One case on both** is worth it where the two could disagree — a total shown and a total
  stored, a permission hidden and a permission enforced. Hiding an action is not enforcing
  it, and that pair is the case that proves it.

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
- **Data:** order of $10.000; coupon `NZT-E02-INVIERNO20`, expired 2026-05-01
- **Preconditions:** the customer is logged in with an order in progress
- **Setup / cleanup:** `data/US-012/E-02-setup.sql` · `data/US-012/E-02-teardown.sql`
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
- Preconditions you cannot reach are a data problem to solve, not a result. **A scenario
  whose data does not exist yet is designed with its two scripts — setup and teardown — and
  they are approved with the plan, not improvised while running.** The mechanism is the
  user's decision and is asked once, with the plan: `nzt-verify-test-data`.

## The plan is approved before anything runs

Write the whole set, show it, and stop. **Being asked to test authorises writing the plan,
not skipping that stop.** The approval covers the whole plan — you do not ask again per
scenario.

## Done when

Rehearse it: could someone else run this set, exactly as written, and get the same verdicts
you would?

- Every criterion appears in the coverage table, including the ones with no scenario.
- Every scenario says what it covers, its data, its expected result and its material
  effects, and the ones whose data does not exist yet name their setup and teardown scripts.
- Every expected result traces to a requirement, not to the running system.
- The edges the techniques do not generate were looked for and either written or dismissed
  with a reason.
- Priorities are set, and what will not be run is named as a gap before it becomes one.
