# Performance as the user feels it

## Contents
- It measures against a requirement, not a feeling
- Measure what the user waits for
- Where the time goes
- What the user feels, past the number
- The rules
- Where a finding lands
- Done when

Produces a measured baseline, the located cause of what is slow, and improvements proposed
with the numbers that justify them. **It changes no code.**

The numbers live with the scenario: the story's file in
`Plan/specs/<feature>/testing/<story>.md` when they verify one of its requirements, or
`Plan/specs/<feature>/testing/performance.md` when the measurement belongs to no single
story. The captures go in the run's evidence folder, like any other run.

## It measures against a requirement, not a feeling

- **The number to beat is the story's non-functional requirement** — *"the listing loads in
  under two seconds"*. That is a spec, and it is what makes a result pass or fail.
- **If there is no requirement, what you produce is a baseline, and the target is a question
  for the user.** You never invent a threshold, and you never call a number slow on your own
  authority: *"it takes 2,4 s at 5.000 orders — is that acceptable?"* is the finding.
- It is designed and approved like any scenario: what is done, with how much data, in which
  environment, and what is expected. A measurement run before the plan is a number nobody
  agreed to interpret.

## Measure what the user waits for

Two numbers, and they are not the same: what the server reports, and what the person waits
for. **The user's number decides; the server's number locates the cost.**

- **The user's number** runs from the action to the moment the answer is usable on screen —
  transfer and render included, not just the response time.
- **Percentiles, never an average**: p50 and p95 over repeated runs. An average hides the
  slow one in ten, which is exactly the one people complain about.
- **Say the environment, always.** A development machine with local data is not production,
  and a number is only comparable to itself. What travels between environments is the shape
  of the cost, not the milliseconds.
- **Realistic data volume.** A listing measured over twelve rows measures nothing. Use the
  volume the product has, or the one it is expected to have, and write which it was.
  Generating that volume is part of the measurement and follows `nzt-verify-test-data`: the
  mechanism the project agreed, and a teardown for every row you inserted — a measurement
  that leaves 50.000 orders behind moves the next one.
- **Cold and warm are two measurements**: the first hit with nothing cached, and the steady
  state. Say which one each number is.

## Where the time goes

Locate before proposing. Four places, in the order they are usually worth checking:

| Where | The signal | Usually |
|---|---|---|
| Data access | one query per row, a scan, a sort with nothing to support it | N+1, or a missing index |
| The payload | a response far bigger than what the screen shows | everything selected, nothing projected |
| The round trips | many sequential calls to paint one screen | a screen asking one thing at a time |
| The render | time spent after the data already arrived | too many components, or work repeated per item |

**A measurement with no located cause is a symptom**, and a fix proposed on a symptom is a
guess with a number attached.

## What the user feels, past the number

Perceived performance is real for the person, and it is recorded for exactly what it is.

- The three states of any screen that loads data — loading, empty, error — are a build rule.
  Here you check that they **actually appear, and when**: a screen that shows nothing for two
  seconds feels broken even when the data arrives on time.
- Work that can start before everything is ready — the first page, the shape of what is
  coming — improves the experience without making anything faster. Record it as
  **perceived**, never as a speedup.
- **A spinner is not a fix for a slow query.** It makes the wait legible; the query still
  needs its index.
- An action whose result the user cannot see yet is where double submissions come from. That
  is a defect, and it goes to `nzt-verify-bug`, not into a performance finding.
- Whether the screen is usable and accessible is `nzt-ux-review`'s. Here the subject is time.

## The rules

- **No optimisation without a before and an after, measured the same way**: same scenario,
  same data, same environment. **A change with no measured improvement is reverted** — it is
  complexity that bought nothing.
- **Never change behavior to make something fast.** Returning less than a criterion asks
  for, or dropping a validation, is a spec change and goes through `nzt-discovery-change`.
- **Measuring is not repairing.** This unit measures and proposes; the repair is `nzt-build`,
  with its own verification and its own before/after.
- **Production is not measured without authorisation that names the environment**, and never
  with real users' records as test data.
- What only appears under real traffic — the slow hour, one tenant, a cold start in the
  cluster — belongs to `nzt-ship-observability`. This reading is one scenario at a time, at a
  stated volume.

## Where a finding lands

| The finding | Where it goes |
|---|---|
| A located cause the plan takes now | a unit of `nzt-build`, closing with the before and after |
| A cause the user decides to defer | `Docs/Architecture/tech-debt.md`, with the numbers as its evidence |
| The product wants a number it never stated | a non-functional requirement, through `nzt-discovery` |
| The structure is what costs | `nzt-architecture-review` |
| It shows up only in production | `nzt-ship-observability` |

## Done when

Rehearse it: could someone repeat your measurement and land on the same number, and act on
one finding without measuring it again?

- The scenario, the data volume and the environment are written next to every number.
- Percentiles over repeated runs, with cold and warm distinguished.
- Every number is compared against a requirement, or declared a baseline with its target
  left as a question.
- Every finding names where the time goes, with the evidence that located it.
- Perceived improvements are recorded as perceived, not as speedups.
- Nothing was optimised here, and nothing was proposed without a before.
