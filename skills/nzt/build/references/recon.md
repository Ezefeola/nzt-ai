# Survey before touching it

Produces the three fields the plan needs to cut the work: **what already exists**, **what has
to be built**, and **the risks**. It changes nothing.

**It is worth a unit when the change lands on code that already exists** and nobody can say
from memory what consumes it. A small edit in an established place does not get a survey: it
follows the convention next to it and moves on.

## Finding where the behavior lives

You are given the behavior in the user's words, and the code is in English. **The translation
is not yours to invent**: `Docs/Domain/glossary.md` carries the code name of every term, and that is
what you search for. If a term has no entry, search the plausible names, read what they
actually do, and say which one you assumed. An ambiguous domain meaning is a question, not a
guess.

From there, work outwards, in this order:

1. **What triggers it** — the endpoint, the screen, the job, the handler.
2. **What it reads and what it writes** — tables, files, external systems.
3. **Who else calls it.** This is the one surveys skip, and it is where the risk lives.

Stop when the next file stops changing the three fields. A survey that reads the whole
repository is how a change that needed one afternoon gets planned for a week.

## The report

```text
Already there:  the total is calculated in one place — Checkout/Total.cs:34 — and it is
                the only thing that applies discounts; the coupon is validated when it is
                added to the basket, not when the order is confirmed
To be built:    rejecting an expired coupon — nothing looks at the date today
Risks:          that same calculation feeds the order summary (Orders/Summary.cs:58);
                changing it changes two screens
Looked at, nothing there: the payment adapter, the notification handlers
Could not tell: whether the nightly job reuses the basket path — it is triggered by
                configuration nobody in the repository sets
```

- **`Already there` is not a tour of the folder tree.** It is what this change is going to
  run into, named the way the user would name it, **with where it can be seen**. A finding
  with no reference asks for trust instead of giving evidence.
- **`To be built` names what is missing, never how to build it.** How is the plan's, and then
  `nzt-build-implement`'s.
- **`Risks` is what else consumes this, what would break, and what surprised you.** An empty
  `Risks` over shared code means the third question was not asked.
- **Say what you looked at and found nothing in.** Silence reads as *"there was nothing
  there"* and hides *"I did not look there"* — and the two are not the same report.
- **Say what you could not determine.** A survey that only reports what it understood is a
  survey nobody can size.

## What it never does

- **It never declares a business rule.** Behavior found in code is described; whether it is a
  rule, a bug or an accident is the user's call. Turning it into a rule here would give an
  accident the same weight as a decision — `nzt-discovery-reverse` is the door for that, and
  it ends with the user confirming.
- **It never fixes anything on the way through.** What it finds outside the change is
  reported; if the user defers it, it becomes an entry in `Docs/Architecture/tech-debt.md`.
- It does not judge the structure — that is `nzt-architecture-review` — and it does not hunt
  defects — that is `nzt-verify-review`.

## Done when

Rehearse it: could the plan cut this work into units, and name what it might break, from
these three fields alone?

- Every claim in `Already there` and `Risks` has a file and a line behind it.
- The third question — who else calls it — was asked and answered.
- Nothing was promoted to a business rule.
- What was read and found empty, and what could not be determined, are both in the report.
- Nothing was changed.
