# Assess — measure the ability, not the sensation

Produces `Learn/<topic>/assessments/<YYYY-MM-DD>.md` and the verdicts it writes into
`progress.md`. It measures objectives **as written in `curriculum.md`**, with evidence the
person produced — not how the lessons went.

## Steps

1. **Build the tasks from the objective** and its *Closes with*; what it does not name is not
   measured. Three or four tasks. A task that names the technique asks for
   execution, not for knowing when it applies. Mix the forms:

   | Form | Catches |
   |---|---|
   | explain it, material out of sight | memorised words with no model |
   | apply it to an unseen case | knowledge that works only on the example |
   | choose between two options and justify | rules held without knowing when |
   | find what is wrong in something given | recognition that never became judgement |

2. **Say at the start that you will not teach while measuring.** Note gaps and keep going; no
   hints — a task that needed one is a task they could not do. Re-teaching comes after, with
   `teach.md`.
3. **Give each objective one verdict**, never collapsed:

   | Verdict | It must say |
   |---|---|
   | `achieved` | how it showed |
   | `not achieved` | what they did instead — a missing fact or a wrong model |
   | `solved by the system` | which part you produced, at whose request |
   | `no evidence` | that nothing was measured — not a soft `not achieved` |
   | `not measurable` | a finding about the objective: rewrite it in `curriculum.md`, same `OA-NN` |

4. **Write the file and the states** in `progress.md`, each citing the assessment.
5. **When the topic closes, report what they can do now and what they still cannot**, unmet
   objectives named with their verdicts. You do not declare it learned — whether it is
   enough is the person's call. A topic may close with objectives pending, never counted as
   done; pending objectives keep their review dates.

```markdown
# Assessment — 2026-09-25
topic: db-read-performance · objectives measured: OA-01, OA-02, OA-03

## OA-02 · Find the N+1 in existing code and say what it costs
- Task: a report endpoint from their repository, unseen; find what makes it slow and its
  cost for 50 rows.
- Produced: found it, named the property access, said "51 queries instead of 1".
- Verdict: **achieved** — new case, unaided, cost stated in queries.

## OA-03 · Rewrite a read as a projection and justify every column kept
- Produced: the projection, correct; defended two unused columns as "might be needed".
- Verdict: **not achieved** — rewrites, does not yet decide columns from the response.

## OA-01 · Read a generated SQL statement and say which query code produced it
- Not measured; out of time. Verdict: **no evidence**.
```

## Done when

Every objective in scope has a verdict with its artifact, and the report names what is
missing before what was achieved.
