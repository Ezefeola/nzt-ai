# Teach — one objective, until they do it unaided

Produces `Learn/<topic>/lessons/OA-NN-<slug>.md` and the state it leaves in `progress.md`.
Starts from an objective already in `curriculum.md` with its *Closes with*; needing to ask
the person something first means the objective is badly formed — fix it there.

## Steps

1. **Make them try first**: one or two minutes on a small task from the objective that they
   cannot do yet. It is a hook, not a measurement: do not correct it. Afterwards say what it
   was for — "that gap is what this lesson fills".
2. **Write the lesson** — one idea, these parts in this order, nothing else:

   | Part | What goes in it |
   |---|---|
   | **The idea** | said plainly, before any nuance |
   | **Why it exists** | what breaks without it, concretely |
   | **In their context** | a case from their own work, product or domain |
   | **The typical error** | the mistake almost everyone makes here |
   | **Practice** | the three exercises, one per step |
   | **Retrieval** | one question answered with the material out of sight — its answer is not in the file |

   Edges, history and alternatives go in another lesson or none. Read in one sitting, in the
   person's language and vocabulary. Two lessons per objective at most; a third means the
   objective is too big — a finding for `curriculum.md`.
3. **Fade the scaffolding**, one exercise per step (`exercises.md`), each corrected
   (`tutor.md`) before the next:

   | Step | The person gets | They produce |
   |---|---|---|
   | **solved** | the full solution | why each step is there, in their words |
   | **faded** | the same form, decisions removed | the decisions |
   | **alone** | the brief, nothing else | all of it |

   Never skip *faded* — it is what lets them start from a blank page. A failure at *alone*
   goes back to *faded* with a new case, not back to the explanation.
4. **Close with the retrieval question**, never a summary. A failed retrieval is information:
   note what was missing and take it to the next step.
5. **Write `progress.md` when the practice ends**: the state with its exercise and step, and a
   log line with what they produced, what was missing, and where they stopped or that it is
   ready for `assess.md`. A requested solution is recorded as `tutor.md` says.

## The file

```markdown
# OA-02 · The N+1, and what it costs
objective: OA-02 · lesson 1 · 2026-09-18

## The idea
One query brings the list, then one more per row fetches the relation. Twenty rows,
twenty-one round trips.

## Why it exists
The page is slow and every query in the log looks fast. The cost is in how many there are.

## In your code
`OrderListEndpoint` loads the orders; the loop below reads `order.Customer.Name`. That read
is the second query, once per order, invisible because it looks like a field.

## The typical error
Moving the eager-load around until the numbers change. The check is the query count in the
log, not the shape of the code.

## Practice
- solved · exercises/EX-02 — the rewrite is given; explain what each step costs
- faded · exercises/EX-03 — the projection with the columns removed
- alone · exercises/EX-04 — a list endpoint from your repository, nothing given

## Retrieval
Why does adding an index to the customer's name not fix an N+1?
```

## Done when

They produced it at *alone* and explained it with the file closed; given an unseen case from
the same objective, you can predict they would produce it.
