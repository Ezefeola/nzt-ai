# Decisions log

The append-only log of technical questions: every `QT-NN`, its answer, its date and where the
answer came from. `Docs/Architecture/architecture-decisions.md` for the product (the packs'
decisions included), `Plan/specs/<feature>/tech-design/decisions.md` for a feature.

The design is the present and gets rewritten; the log is the conversation that produced it
and is never overwritten. So designs list open questions by id and never restate answers.

## The file

```markdown
# Design decisions — F-003 Coupons at checkout

Mode chosen: **together** · 2026-09-15

## 2026-09-15

**QT-01 · Who decides whether a coupon is valid?**
> Billing. Checkout only shows what it gets back. — `user`

**QT-02 · What does the gateway send when it rejects a payment?**
> A webhook with status `rejected` and its reason. — `documented`, <URL>, read 2026-09-15

**QT-03 · How many retries before warning?**
> Three, with growing waits. — `agent, within scope`

**QT-04 · Does a cancelled order release the coupon at once?**
> `[TO-DEFINE]` — the user defines it later

## 2026-09-22

**QT-07 · Where is the used coupon recorded?**
> On the order. — `user`  *(supersedes QT-03)*
```

## Labels

Written in the project's language (`[TO-DEFINE]` is never translated):

| The entry is | Label | Carries |
|---|---|---|
| Answered by the user | user | — |
| Decided by you inside the agreed scope | agent, within scope | — (the user can object) |
| A fact | documented · observed · inferred (`nzt-research`) | source and date, file, or what it follows from |
| Offered, not answered | proposal | options and recommendation |
| Out of scope | `[TO-DEFINE]` | who defines it; in every report until resolved |

## Rules

1. The first line is the mode the user chose, with its date.
2. Sessions stack chronologically. **Nothing is edited or deleted**: a superseded answer
   stays and the new entry names it.
3. An answer that earned an ADR cites it instead of restating it.

## Done when

Someone who was not here finds each `QT-NN`, sees what was chosen and on what grounds, and
tells which are open.
