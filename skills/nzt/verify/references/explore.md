# Exploratory testing

Produces one session: a charter, what was found, and what each finding turned into. **One
session is one unit.** It complements the scripted scenarios; it does not replace them.

## The charter, written first

```markdown
## Charter · 2026-09-16 · 45 min
Explore **applying coupons at checkout** with **an account that has orders in progress and
a mix of valid, expired and already-used codes** to discover **whether the total and the
order can get out of step with each other**.

Risk behind it: money shown to the customer differing from money charged.
```

- Mission, resources, and **the information you are after**. *"Test the whole checkout"* is
  not a charter: it has no end and produces a list of impressions.
- **Time-boxed**, and the box is respected. The value of the technique comes from the box:
  it forces choices about where to look.
- Name the risk the charter is chasing. It is what makes the session worth its time to
  someone reading the report.

## While exploring

- **Something interesting outside the mission becomes a new charter**, written down, not
  followed now. Chasing it is how a 45-minute session becomes an afternoon with no result.
- Keep a running note of what you did, not only what you found. A finding nobody can
  reproduce is an anecdote.
- Vary deliberately: the same action twice, out of order, interrupted, with the back button,
  with data at the extremes. You are looking for what the scripted set could not predict.
- **Data you create to explore is still data you clean up.** The mechanism and the cleanup
  are the same as anywhere else (`nzt-verify-test-data`); what changes is that a session
  creates it as it goes, so it is undone at the end of the session and what could not be
  undone is written in the notes.

## Classify against the requirement, not against intuition

| What you saw | What it is |
|---|---|
| Contradicts a criterion or a business rule | A **bug** — open it through `nzt-verify-bug` |
| No requirement defines it | A **question** for analysis (`Q-NN`) |
| Works, but is risky or confusing | A **risk or usability note** |

**"It looks wrong to me" is not a verdict.** Promoting a surprise to a defect without a
requirement behind it puts your taste into the spec with the weight of a rule.

## Every defect leaves a regression scenario

A defect found while exploring is written as a scenario in the story's test file, so it is
run again from now on. Exploration finds it once; the scenario is what stops it coming back
unnoticed.

The same goes for a near miss you could not reproduce: write what you were doing, mark it
unreproduced, and leave it. It is cheaper than rediscovering it.

## The session report

```markdown
## Session 2026-09-16 · 45 min · coupons at checkout
- **Found:** 2 bugs (BUG-007, BUG-008), 1 question (Q-15), 1 usability note.
- **New charters:** cancelling an order with a redeemed coupon.
- **Covered:** applying, rejecting, re-applying, applying after editing the order.
- **Not covered:** concurrent sessions — no second account available.
```

Say what you **did not** get to as well as what you did. A session report that only lists
findings reads as if the area is clean, and there is no way to tell that from "nobody
looked there".

## Done when

Rehearse it: could someone repeat this session and know what you already ruled out?

- The charter was written before exploring and stayed inside its box.
- Every finding is classified against a requirement, not against taste.
- Every defect has its regression scenario written.
- What you found outside the mission is a new charter, not a detour you took.
- What was not covered is named.
