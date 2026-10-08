# Reading code for defects

Produces findings, ordered by what breaks worst, each one with when it fails and what the
code does. It changes nothing unless the request was to repair.

**The difference with running the tests is the whole reason this exists**: a scenario
measures against the spec and stops where the spec stops. Here you find what is broken **even
when no criterion says anything about the case** — which is exactly where the longest-lived
defects are, because nothing was ever going to catch them.

> **A defect is behavior, not form.** Code that works and is ugly is not a defect.

That is deliberate: do not load the skills that say how this project writes code, so you
have no opinion about style — and a report that mixes *"this uses the old pattern"* with
*"this charges twice"* buries the second one. Restructuring is `nzt-build-refactor`'s work.

## Where defects actually are

Not spread evenly. Look where a decision was made and one case was forgotten:

- **The edges of a range** — zero, one, the last one, empty, the maximum. And the ones nobody
  pictures: negative, a date in the past, a collection that arrives already empty.
- **Two at once.** The same resource used twice before the first use was recorded. It is the
  defect that never appears while testing by hand.
- **States the model allows and the domain does not.** If a value can be set to something the
  business would never accept, sooner or later something sets it.
- **Order.** Two steps that give a different result if swapped, with nothing guaranteeing
  which runs first.
- **Somebody else's failure path.** What happens when the other side times out, returns an
  error, or returns something unexpected. **A default applied on failure** is where a silent
  defect is born.
- **Money, rounding and quantities**, always. And anything compared for equality that is not
  an integer.
- **What is caught and not reported.** A swallowed error is a defect somebody else will find
  later, with less information.

## The report: two paths, and the classification is the finding

```text
[1] The second use of a single-use coupon goes through
    Fails when:   two orders confirm the same coupon at the same time
    The code:     marks it used after the payment is confirmed — Coupons/Redeem.cs:41
    Contradicts:  RN-un-uso-por-cliente        → a bug, repaired against its criterion

[2] A negative amount reaches the gateway
    Fails when:   the discount is larger than the total
    The code:     subtracts with no floor and sends the result — Checkout/Total.cs:52
    The spec says nothing                      → a gap: it gets decided before it is built
```

- **Contradicts the spec** → a rule or a criterion already says otherwise. **Cite it.** The
  repair has something to be measured against: `nzt-verify-bug` opens the record, and
  `nzt-build-implement` fixes it.
- **The spec says nothing** → nobody decided what should happen. It is a gap, and it goes
  back through `nzt-discovery-change` before anyone builds it. Possible outcomes may be
  proposed, clearly separated from the finding.

If what you are reading has no spec at all, say it **once** at the top instead of repeating
it in every block.

- **There is no severity field.** The impact is read off *Fails when*: how likely that
  situation is and what it costs is the user's to weigh, and a number you invented would be
  weighed instead. Order the list by what breaks worst and let the reader disagree.
- **A suspicion is never reported as a fact.** If you could not follow the path that reaches
  the failure, say which part you could not follow. A finding labelled as a hypothesis is
  useful; a wrong one stated as certain costs the next three reports their credibility.

## Scope

A read-only request stays read-only: it reports. A request to fix carries the repair too, and
then the repair is `nzt-build`'s, with its verification — a finding is not closed by having
been written down.

## Done when

Rehearse it: could someone reproduce any finding on the list from what it says, without
asking you anything?

- Every finding says **when it fails** and **what the code does**, with where it is.
- Every finding is on one of the two paths, and the one that contradicts the spec cites the
  rule or the criterion.
- Proposed outcomes are separated from observed findings.
- Nothing about style, structure or naming: behavior only.
- No severity field, and the list is ordered by what breaks worst.
- What could not be confirmed is labelled as a hypothesis.
