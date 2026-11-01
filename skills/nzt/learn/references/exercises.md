# Exercises — the brief now, the solution afterwards

Produces `Learn/<topic>/exercises/EX-NN.md` and, later, `Learn/<topic>/solutions/EX-NN.md`:
same name, different folder. `EX-NN` is sequential per topic and never reused. Every brief
serves one objective and one step; if you cannot name them, there is nothing to correct
against.

## The brief

| Part | What goes in it |
|---|---|
| **Produce** | what they hand back, concretely |
| **The case** | their own work, domain and data — one case per brief |
| **Given** | what comes with it at this step, and **what does not**, said out loud |
| **Out of scope** | what is not practised today, so they do not fix it and you do not correct it |
| **Done when** | what has to be true of a good answer — not the answer — **visible to the person** |

1. **Given follows the step**: *solved* — the complete solution, they produce the reasoning;
   *faded* — the same form with the decisions removed; *alone* — the brief and nothing else.
2. State how long it should take; an exercise with no size gets postponed.
3. A training series gets one brief for the series: it names the one component practised
   and says the rest is not looked at. Each repetition changes the case, not the brief.

```markdown
# EX-03 · Find the N+1 in the order list
objective: OA-02 · step: faded · written: 2026-09-18 · about 20 minutes

## Produce
The read path of `OrderListEndpoint` rewritten to cost one query, plus two or three lines on
what it cost before.

## The case
`OrderListEndpoint` as it is on main today. Twenty orders per page, the customer's name in
every row.

## Given
- The shape: a single query with a projection. The selected columns are yours to decide.
- The query log of a run of the current endpoint.
- **Not given:** which property access triggers the extra query. That is the finding.

## Out of scope
Paging, validation and naming.

## Done when
- The rewritten path issues one query, and you can point at it in the log.
- Every column kept has a reason you can say out loud.
- You can name what the previous version cost, in queries, for a page of twenty.
```

## The solution

1. **Write `solutions/EX-NN.md` only once the delivery exists**, or once the person asked for
   it (recorded as `tutor.md` says) — never in the brief, a collapsed block or in advance:
   a solution that exists gets read, and one written early fixes your answer before you
   have seen theirs.
2. It carries the reasoning — why each decision and what the alternatives cost — not only
   the result.
3. When their answer differs and is also right, it says so with what each version trades.

```markdown
# EX-03 · Solution
objective: OA-02 · delivered: 2026-09-19 · written after delivery

## The answer
## Why each decision
## What was easy to miss
```

## Done when

The person could start from the brief without asking a question, and you could judge a
delivery from its *Done when* alone, without a solution written beforehand.
