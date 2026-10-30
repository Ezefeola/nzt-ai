# Decisions log

Produces the append-only log of this phase's technical questions: every `QT-NN`, its answer,
the date and where the answer came from. It is written beside the document it serves:
`Docs/Architecture/architecture-decisions.md` for the product — the stack's axes included —
and `Plan/specs/<feature>/tech-design/decisions.md` for a feature. One series each.

## Why it is a file of its own

**The design is the present and gets rewritten; the log is the conversation that produced
it and is never overwritten.** A document rewritten whole that also has to be append-only in
half its body is a contradiction. So the design lists its open questions by id and keeps no
*Decided* section: repeating an answer creates a second version that drifts.

## The file

```markdown
# Design decisions — F-003 Coupons at checkout

Mode chosen: **together** · 2026-09-15

## 2026-09-15

**QT-01 · Who decides whether a coupon is valid?**
> Billing. Checkout only shows what it gets back. — `user`

**QT-02 · What does the gateway send when it rejects a payment with a coupon?**
> A webhook with status `rejected` and its reason. — `documented`, <URL>, read 2026-09-15

**QT-03 · How many retries before warning?**
> Three, with growing waits. — `agent, within scope`

**QT-04 · Does a cancelled order release the coupon at once or at closing?**
> `[TO-DEFINE]` — the user defines it later

## 2026-09-22

**QT-07 · Where is the used coupon recorded?**
> On the order, beside the discount. — `user`  *(supersedes QT-03)*
```

The product's log has the same shape, with the product in the title. **The first line is the
mode the user chose for this document**, and its date.

## Where each answer came from

Every entry says it, and one is never dressed as another. **The label is fixed by what it
means and written in the project's language**, like the mode's name; `[TO-DEFINE]` is an
identifier and is not translated.

| The entry is | Label | It carries |
|---|---|---|
| Answered by the user | user | — |
| Decided by the agent, inside the agreed scope | agent, within scope | nothing more: the user can still object |
| A fact | the one `nzt-research` gives it: documented, observed, inferred | the source and the date read, the file, or what it follows from |
| Offered, not answered yet | proposal | the options and the recommendation |
| Explicitly out of scope | `[TO-DEFINE]` | who defines it; it appears in every report until it is resolved |

## Appending

- Sessions stack chronologically, so the file reads top to bottom following the numbering.
- **Nothing is edited or deleted.** A wrong or superseded answer stays, and a new entry names
  what it supersedes. A question that disappears once answered leaves the next reader
  deciding it again, with nothing saying it was ever asked.
- When an answer earned an ADR, its line cites the ADR instead of restating it.

## Done when

Rehearse it: could someone who was not here find each `QT-NN` in this file, see what was
chosen and on what grounds, and tell which ones are still open?

- Every question was written before it was asked or decided.
- Every answer has its date and its label, with what that label carries.
- Nothing above the last entry was changed; superseded answers name what replaced them.
