---
name: nzt-verify-audit
description: Use when the question is whether the documents are still true: each claim measured against the code, and what the code does that none of them declares.
---

# Do the documents still tell the truth

Produces a verdict per claim in the cut, plus what was checked and found consistent, plus
what could not be checked. It corrects nothing on its own.

If you did not arrive here from `nzt-verify`, load it first.

Everything in this project stands on documents somebody wrote once. They were true the day
they were approved. **This is the only reading that finds out whether they still are**, and
it does it against the one thing that cannot be out of date with itself: the code as it runs
today.

> **The measure is always a claim some document makes, never your own opinion.**

That is the line that keeps this from turning into a review. You are not asking whether the
code is good; you are asking whether it does what was written down.

## Two sweeps, and the second is the one everyone skips

**Document → code.** Take each claim in the cut and check it still holds. This is what people
mean by an audit, and on its own it finds one kind of divergence only.

**Code → document.** Read what the code does and ask: *if this had been decided today, would
it have gone into one of these documents?* If the answer is yes and no document carries it,
**the code moved ahead of what was approved** — a decision was taken and never recorded, and
nobody knows it exists.

Both sweeps are bound to the agreed cut. An audit of everything at once produces a dump
nobody reads.

**Structure is in scope here**, unlike anywhere else: if a stack document declares
`Architecture: vertical-slice` or `Docs/architecture.md` declares a boundary, that is a claim,
and a claim is measurable. **What no document claims is not a finding.**

## The three verdicts

```text
Document: backend-stack-Pedidos.Api.md — Persistence: repositories with unit of work
The code: 4 of 11 features inject the DbContext into the endpoint
Verdict:  the document no longer matches

Document: none
The code: payments are retried automatically with backoff — Payments/Retry.cs:22
Verdict:  the code moved ahead — no document declares it

Checked and consistent: the glossary, the domain model, the other 7 features
Could not check: whether the retry limit is configured in the deployed environment
```

- **The document no longer matches** — it says something the code no longer does. Note that
  this verdict says nothing about which of the two is wrong.
- **The code moved ahead** — the code does something no document declares.
- **Consistent** — and this one is reported too.

**Say which correction the evidence supports, and why.** Both directions happen: sometimes
the document went stale and gets updated, sometimes the code did something nobody approved
and gets rolled back. **The correction is the user's decision**, not a consequence of the
audit: a material change goes back to its phase, and a plain documentary omission is fixed
with the document's own skill.

## What was consistent gets reported

The third block of the example is not filler. **An audit that lists only divergences is
indistinguishable from one that did not look**, and the reader has no way to tell whether the
glossary was read and matched or never opened. A list of what was reviewed and found
consistent is enough; silence is not.

And **what you could not check is its own list**: a claim that depends on something the code
cannot show — a deployed setting, a third party's behavior, a manual step — is not
consistent, it is unverified.

## Where it is not the right reading

- **A defect with no document behind it** is `nzt-verify-review`'s.
- **A structure that is declared and honoured but costs too much** is
  `nzt-architecture-review`'s. Here, a structure that matches its document is consistent,
  however much you would have done it differently.
- **A criterion that was never verified** is not drift: it is work that is not done, and it
  is read from the story.

## Done when

Rehearse it: could the user decide, for every verdict, whether to fix the document or the
code — and see what you did not look at?

- Both sweeps were run, and the second one is visible in the report.
- Every divergence names the document, or `none`, and what the code does, with where.
- Every verdict is one of the three, and recommendations are separate from observations.
- What was reviewed and found consistent is listed.
- What could not be checked is listed apart, and never counted as consistent.
- Nothing was measured against an opinion no document holds.
