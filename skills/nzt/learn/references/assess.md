# Assess — measure the ability, not the sensation

Produces `Learn/<topic>/assessments/<YYYY-MM-DD>.md` and the verdicts it writes into
`Learn/<topic>/progress.md`. It measures **objectives as they are written in
`curriculum.md`**, with evidence the person produced.

Not how the lessons went. A topic where every lesson landed and nothing was measured is a
topic nobody can report on.

## Build it from the objective

Read the objective and its *Closes with*, and write the tasks that would show it. Anything
the objective does not name is not measured here, however interesting.

- **A new case, always.** Solving the practised example proves they remember the example.
- **A question whose answer is inside its own statement measures nothing.** If the task
  names the technique, it is asking them to execute, not to recognise when it applies.
- Mix the forms. **Each one catches a different failure:**

| Form | Catches |
|---|---|
| Explain it with the material out of sight | Memorised words with no model behind them |
| Apply it to a case they have not seen | Knowledge that only works on the example |
| Choose between two options and justify | Rules held without knowing when they apply |
| Find what is wrong in something given | Recognition that never became judgement |

Three or four tasks is an assessment. Twenty is a session the person abandons halfway, and
what you measure then is stamina.

## Do not teach while you measure

Note the gap and keep going. **Correcting in the middle turns the measurement into a lesson
and leaves nothing to measure** — and the person's next answer is now built on what you just
said.

- Hints are not available here. A task that needed one is a task they could not do, which
  is the finding.
- Re-teaching happens **after**, with `nzt-learn-teach`, on what the verdicts exposed.
- Say this out loud at the start, or the person reads your silence as disapproval.

## Five verdicts, and they never collapse

| Verdict | It has to say |
|---|---|
| `achieved` | **How it showed.** A bare *achieved* is indistinguishable from an objective nobody checked |
| `not achieved` | **What the person did instead** — that is where you see whether a fact is missing or the model is wrong |
| `solved by the system` | Which part you produced, and on whose request |
| `no evidence` | Nothing was measured. **It says nothing about whether they could** |
| `not measurable` | **A finding about the objective, not about the person** |

- `not measurable` survives the assessment and gets fixed in `curriculum.md`. An objective
  that cannot be measured is rewritten there, keeping its `OA-NN` — never guessed at here
  so the table looks complete.
- **`no evidence` is not a soft `not achieved`.** Collapsing the two invents a result.
- Nothing the system solved is recorded as acquired, today or later.

## The file

```markdown
# Assessment — 2026-09-25
topic: ef-core-read-performance · objectives measured: OA-01, OA-02, OA-03

## OA-02 · Find the N+1 in existing code and say what it costs
- Task: a report endpoint from their repo, unseen. Find what makes it slow and say what
  it costs for 50 rows.
- Produced: found it, named the property access, said "51 queries instead of 1".
- Verdict: **achieved** — new case, unaided, cost stated in queries.

## OA-03 · Rewrite a read path as a projection and justify every column kept
- Task: rewrite the same endpoint as a projection.
- Produced: the projection, correct. Asked to justify the columns, kept two that the
  response does not use and defended them as "they might be needed".
- Verdict: **not achieved** — produces the rewrite, does not yet decide columns from the
  response. Re-teach that half.

## OA-01 · Read a generated SQL statement and say which LINQ produced it
- Not measured today; the session ran out of time.
- Verdict: **no evidence**.
```

## The closing report

When the topic closes, report **what the person can do now, concretely, and what they still
cannot.**

- **A closing report that only lists achievements rebuilds the false sense of ability this
  whole branch exists to prevent.** The unmet objectives are named, with their verdicts.
- **You do not declare the topic learned.** You report what was measured; whether that is
  enough is the person's call — the same rule as never accepting a story on their behalf.
- A topic can close with objectives pending, if that is what the person wants. What cannot
  happen is those objectives being counted as done in silence.
- Pending objectives keep their review dates: closing the topic does not close the reviews.

## Done when

Every objective in scope has one of the five verdicts with the artifact behind it, the
`not measurable` ones are fixed in the curriculum rather than guessed, and the report names
what is still missing before it names what was achieved.
