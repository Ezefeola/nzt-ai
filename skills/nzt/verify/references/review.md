# Reading the work for defects

Produces findings ordered by what breaks worst, each with when it fails and what the work
does. Changes nothing unless the request was to repair. It finds what is broken **even where
no criterion speaks** — where long-lived defects hide. **A defect is behavior, not form**: do
not read `nzt-software`'s code rules (its `code` and language columns), so style never
enters the report.

## Where to look

- Range edges: zero, one, last, empty, maximum, negative, past dates.
- Two at once: the same resource used twice before the first use is recorded.
- States the model allows and the business does not.
- Order: two steps with different results if swapped and nothing fixing the order.
- Someone else's failure: timeouts, errors, unexpected answers — **a default applied on
  failure** is where a silent defect is born.
- Money, rounding, quantities, and equality on non-integers.
- Errors caught and not reported.

## The report

```text
[1] The second use of a single-use coupon goes through
    Fails when:   two orders confirm the same coupon at the same time
    The work:     marks it used after payment — Coupons/Redeem.cs:41
    Contradicts:  RN-un-uso-por-cliente        → a defect, repaired against its criterion
[2] A negative amount reaches the gateway
    Fails when:   the discount is larger than the total
    The work:     subtracts with no floor — Checkout/Total.cs:52
    The spec says nothing                      → a gap: decided before it is built
```

- **Contradicts the spec** → cite it; `bug.md` opens the record, `nzt-build` fixes it.
- **The spec says nothing** → a gap for `nzt-discovery`'s change; possible outcomes may be
  proposed, separated from the finding. No spec at all: say it once at the top.
- No severity field. A path you could not follow to the end is labelled a hypothesis.

## Done when

Someone could reproduce any finding from what it says.
