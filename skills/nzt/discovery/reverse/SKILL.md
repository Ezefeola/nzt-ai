---
name: nzt-discovery-reverse
description: Use when behavior exists only as code and has to be turned into specifications, cut by product capability, without declaring business rules yourself.
---

# Reverse engineering

Produces findings about behavior that exists only as code, written into
`Plan/specs/<feature>/analysis.md` under `R-NN`. The user rules on each one; only then does
it become a rule in `spec.md` with `origin: reverse (R-NN)`.

If you did not arrive here from `nzt-discovery`, load it first.

## Never declare a business rule

You describe behavior. Whether it is a rule, a bug or an accident that survived is the
user's call, and it is the single most important line of this skill.

A behavior you promote to a rule enters the spec with the same weight as one the user
dictated — and from that moment **nothing distinguishes a decision from an accident**. The
code cannot tell you which one it is: it does the same thing either way.

- Write *"the system does X"*, never *"the rule is X"*.
- A comment in the code saying why is still evidence, not authority. Quote it as what it
  claims, and let the user confirm it.
- Never write a spec for code you have not read. Inferring behavior from a name, a route or
  a test title is guessing with a straight face.

## Cut by capability

**The unit is a product capability, not a folder and not a layer.** One rule normally lives
spread across several folders: cutting by directory splits it down the middle, and the half
you report reads as if it were the whole thing.

- *"Applying a coupon at checkout"* is a cut. *"The Services folder"* is not.
- Follow the behavior wherever it goes — entry point, validation, persistence, background
  job, scheduled task — and say where you stopped following it.
- One capability per unit, with a stop between them. Four capabilities are four units.

## The finding

Four fields, always, plus the line that hands the decision back:

```markdown
### R-03 · A coupon stops working 30 days after it is created
- **Behavior:** a coupon is rejected 30 days after creation, regardless of its own expiry
  date. A coupon with an expiry 90 days out stops working on day 30.
- **Where it is seen:** `CouponValidator.IsUsable`, the check against `CreatedAt`.
- **When it happens:** every validation, including the one at checkout.
- **Nothing declares it:** no document, comment or test mentions 30 days. The number is
  a literal in the condition.
- Rule, bug or accident?
```

- **Where it is seen** is what makes the finding verifiable instead of asking for trust.
  Name the file and the place; the user has to be able to look.
- **Nothing declares it** is where you say what you searched and did not find. If something
  *does* declare it — a comment, a test, an old document — say that instead, and say
  whether the code and the document agree.
- One finding per behavior. A finding with two behaviors gets two answers and records one.
- A number, a limit or a timeout that nobody can explain is a finding, not a detail.

## Report the silence too

Two things close a unit besides the findings:

- **The silent areas.** An area you read and where you found no decisions gets a line
  saying so. Without it, silence reads as *"there was nothing there"* and hides *"I did not
  look there"* — and those are not the same report.
- **What you could not determine.** Behavior that depends on data you do not have, on a
  system you cannot reach, or on a configuration you cannot read, is written down as
  undetermined with what would settle it. It is never filled in with what it probably does.

## After the user rules

- **Rule** → it goes into `spec.md` with its slug and `origin: reverse (R-NN)`. That origin
  stays: a rule reconstructed from code is not worth the same as a dictated one, and the
  next reader has to be able to see the difference.
- **Bug** → it does not become a rule. Record what the expected behavior is, and it enters
  the work as a defect.
- **Accident** → recorded as such, so the next person reading that code does not
  reconstruct it again from scratch.
- Anything the user does not rule on stays a finding. It never graduates by default.

## Done when

Rehearse it: could the user decide what this capability's rules are, using only what you
wrote?

- Every finding has its four fields and its question back.
- Every finding names where it is seen, precisely enough to check.
- The silent areas are listed, and so is everything undetermined.
- Nothing you wrote calls itself a rule.
