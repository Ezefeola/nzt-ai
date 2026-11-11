# Assessing what was learned

Produces `assessments/<date>.md` and the verdicts it writes in the state. It measures the
objectives as written in the state, with evidence the person produced, not how the lessons
went.

## Steps

1. **Build the tasks from the objective** and what closes it; what it does not name is not
   measured. Three or four tasks, mixing these forms:

   | Form | Catches |
   |---|---|
   | explain it, material out of sight | words remembered with no idea behind them |
   | apply it to a case they have not seen | knowledge that only works on the example |
   | choose between two options and say why | rules held without knowing when they apply |
   | find what is wrong in something given | recognising it without judging it |

   A task that names the technique asks only for doing it, not for knowing when it
   applies.
2. **Say at the start that you will not teach while measuring.** Note the gaps and keep
   going, with no hints: a task that needed one is a task they could not do. Teaching
   again comes after, with a lesson.
3. **Give each objective one verdict**, never merged:

   | Verdict | It must say |
   |---|---|
   | `achieved` | how it showed |
   | `not achieved` | what they did instead: a missing fact or a wrong idea |
   | `done with help` | which part you produced, at whose request |
   | `no evidence` | that nothing was measured; it is not a soft `not achieved` |

   An objective that cannot be measured as written is a finding: rewrite it in the state,
   same number, and measure it next time.
4. **Write the assessment and the verdicts** in the state, each naming the assessment, with
   its next review.
5. **When the topic closes, say what they can do now and what they still cannot**, the
   missing objectives first. You do not declare it learned: whether it is enough is the
   person's call. A topic can close with objectives pending; they keep their reviews.

An example, for a person learning spreadsheet lookups:

```markdown
# Assessment · 2026-11-20
Objectives measured: 1, 2

## 2 · Can bring a value from another sheet with a lookup formula
- Task: the supplier sheet, never seen; bring each product's supplier into the orders.
- Did: the formula with an exact match, copied down, checked two rows by hand.
- Verdict: **achieved**, on a new sheet, unaided.

## 1 · Can say, unaided, what each argument of a lookup formula does
- Did: explained the first three; said the fourth "makes it more precise".
- Verdict: **not achieved**: the exact or nearest match is still a wrong idea.
```

## Done when

Every objective measured has a verdict with its evidence, and the report says what is
missing before what was achieved.
