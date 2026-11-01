# Functional analysis — the interview and its record

Produces `Plan/specs/<feature>/analysis.md` (feature) or `Docs/Product/analysis.md` (product):
the only place a question survives a cleared context. Everything else in discovery is read
from it. Create it with the first question.

## The file

```markdown
# Analysis — <product or feature>

## Open
### Q-07 · Can the same customer use a coupon twice?
- blocks: the coupon rule, and the criteria of US-004
- answer:

## Answered
### Q-03 · Does it have to work without internet?
- blocks: whether offline is in scope
- answer: No. The field team is always connected. · 2026-09-16
### Q-05 · Which roles can cancel an order?
- answer: Superseded by Q-09.

## Technical notes
- Two systems hold the customer's balance and neither owns it. For architecture.

## Objections
- I warned that a coupon without expiry cannot be retired, and proposed an expiry field.
  The user keeps it without one. Not reopened without a new argument.
```

## Rules

1. A `Q-NN` is assigned once and never reused. Write it **before** asking, with an empty
   answer. `blocks:` names what cannot be written without it; if you cannot fill it, it is
   curiosity.
2. **Append-only**: an answer moves to *Answered* in the user's words with the date; a
   superseded one is marked, never rewritten; a wrong one is asked again under a new id. An
   inferred answer is not an answer.
3. **Ask in behavior**: if it cannot be phrased without a table, package or vendor, it is not
   functional. Ask the **edges** early (what else must know about this?), the **bad case by
   name** (*what happens when the coupon is expired?*), with a **concrete case**. Do not ask
   what the project already answers.
4. **Technical notes** get no id and no investigation: architecture resolves them.
5. **Dismissed objections** record what you warned, proposed, and that the user keeps theirs.
6. Two altitudes, both closed before the phase: the **product** by conversation only
   (`product.md`); the **feature** by conversation, plus the existing product when the
   behavior exists (`reverse.md`).

## Playback

Before closing, play back three blocks: **Agreed** (the user stated), **Proposed by me**
(not agreed until confirmed), **Pending** (open `Q-NN` and `[TO-DEFINE]`). What the user
confirms goes into the file as an answer with its own `Q-NN`.

## Done when

You could write the artifact this feeds without asking anything else — or the gaps are open
questions in the file and their count is reported.
