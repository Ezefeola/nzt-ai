# Teaching one objective

Takes one objective until the person does it unaided. In a topic it produces
`lessons/<number>-<slug>.md`; a lesson in the conversation follows the same steps without
files. Needing to ask the person something first means the objective is badly formed: fix
it in the state.

## Steps

1. **Make them try first:** one or two minutes on a small task from the objective that they
   cannot do yet. It is a hook, not a measurement: do not correct it. Afterwards say what
   it was for: "that gap is what this lesson fills". In a lesson in the conversation, skip
   it when the person already said what they have and what they want: a first message
   with no teaching in it only costs them a round trip.
2. **Write the lesson:** one idea, these parts in this order, nothing else:

   | Part | What goes in it |
   |---|---|
   | **The idea** | said plainly, before any nuance |
   | **Why it exists** | what goes wrong without it, concretely |
   | **In your case** | an example from their own work, data or situation |
   | **The typical mistake** | the one almost everyone makes here |
   | **Practice** | the exercises, one per step of the next table |
   | **Remember it** | one question answered without the material; its answer is not in the lesson |

   Edges, history and alternatives go in another lesson or none. Readable in one sitting,
   in the person's language and words, every term explained the first time. Two lessons
   per objective at most; a third means the objective is too big, and that is a change to
   the state.
3. **Take the help away step by step**, one exercise per step, each corrected before the
   next:

   | Step | The person gets | They produce |
   |---|---|---|
   | **worked example** | the full solution, on a case like theirs but not their own | why each part is there, in their words |
   | **half done** | the same shape with the decisions removed | the decisions |
   | **on your own** | the brief and nothing else | all of it |

   Never skip *half done*: it is what lets them start from a blank page. A failure *on
   your own* goes back to *half done* with a new case, not back to the explanation. In a
   lesson in the conversation, the first message brings the idea on their case and the
   first exercise; then one exercise per message, waiting for each attempt.
4. **Close with the *Remember it* question**, never a summary. A failed answer is
   information: note what was missing and take it to the next step.

## In a topic

The lesson file, in the person's language. An example, for a person learning to cook:

```markdown
# 3 · Why a vinaigrette splits, and how to keep it together

## The idea
Oil and vinegar do not mix; they only stay together while something holds the drops apart.

## Why it exists
The dressing looks fine when you whisk it and is two layers by the time it reaches the table.

## In your case
Your lunch salad: the dressing you make in the morning has split by noon.

## The typical mistake
Whisking harder. Speed makes smaller drops, not drops that stay apart.

## Practice
- worked example · exercises/05-mustard-vinaigrette.md
- half done · exercises/06-honey-vinaigrette.md
- on your own · exercises/07-your-lunch-dressing.md

## Remember it
Why does a spoon of mustard keep a dressing together for hours and extra whisking does not?
```

## Done when

They did it *on your own* and answered *Remember it* without the material; given a new case
of the same objective, you can predict they would do it.
