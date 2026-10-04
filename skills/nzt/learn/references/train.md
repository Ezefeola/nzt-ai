---
name: nzt-learn-train
description: Use when the person already does something and wants to get better: one component per session, at the edge of their level, corrected every repetition.
---

# Train — deliberate practice on something they already do

Produces one **training session** and the rows it leaves in `Learn/<topic>/progress.md`.
The series brief comes from `nzt-learn-exercises`; each repetition that comes back is
corrected with `nzt-learn-tutor`.

**Entry condition: they already do this.** Someone who cannot produce it at all is not
training, they are learning it — that is `nzt-learn-teach`, in the same topic.

If you did not arrive here from `nzt-learn`, load it first.

## Isolate one component, and say it out loud

Pick the single component this session practises, and state it before the first repetition:
*"this series is only about naming; we are not looking at the rest today"*.

- **Improving everything at once improves nothing.** Attention spread over six things
  produces six shallow corrections and no change in any of them.
- **Then hold the line in the correction.** The session dies the moment you start pointing
  at things outside the component, because the person is now defending the whole delivery
  instead of working on one part of it.
- Pick it from evidence — the last corrections in `progress.md`, the calibration rows —
  not from what would be nice to improve.

## Set the level at the edge

| The repetitions look like | It means | Do |
|---|---|---|
| Comes out clean and quickly | Too easy. **They are exercising, not training** | Raise it now, not next session |
| Costs them, comes out with gaps they can name | **The edge.** Stay here | Keep going, change the case |
| Fails and they cannot say which part failed | Too hard | Drop back a step and cut one variable |

- **Too easy is the failure that hides**: it succeeds, it feels good, and it produces
  nothing. Too hard announces itself, and what it produces is frustration instead of
  correction.
- **Comfortable twice means the level moved.** Raise it in the same session — the second
  clean repetition is the signal, not the reward.

## Repetitions

- **Correct each repetition before the next one starts.** Feedback after the tenth attempt
  trains the tenth attempt; the nine before it were rehearsals of whatever they already did.
- **A different case every repetition**, same component. Repeating the case practises the
  case.
- Three to six repetitions is a session. More than that and the corrections stop being read.
- Keep the corrections about the component, one or two things each, the way
  `nzt-learn-tutor` runs them.

## Confidence in a series

Ask for it at the **first repetition and at the one that closes the series**, not at every
one. Asked every time it becomes a tic that gets answered without thinking, and the
calibration rows stop being data.

If a `high / wrong` shows up mid-series, that repetition gets its own row and the objective
jumps the review queue, exactly as in a single correction.

## Closing the series

**Stable performance across different cases**, not a good attempt: **one good attempt is
luck**, and closing on it is how a series ends right before the part that would have shown
the gap.

Two other ways a series ends, and both are results:

- **The level moved** — comfortable twice at the raised level too. The component is done for
  now; the next session picks another one.
- **The corrections stop landing.** Same correction, third repetition, no change. **The
  component was the wrong one: something underneath is missing, and that is a teaching gap,
  not a training one.** Say so plainly and switch loops — more repetitions at that point
  only teach the person that practice does not work.

## What you write

In `progress.md`, when the session ends:

```markdown
## Log
- 2026-09-24 · OA-03 · training series, component: choosing the columns of a projection.
  Five repetitions, five cases. Repetitions 1–2 kept whole entities; 3–5 projected and
  justified every column. Confidence low at the start, high at the close, both right.
  Stable across the last three cases. Level raised at repetition 4 (added a join).
```

- The line says **the component, the number of repetitions, and what changed between the
  first and the last** — a session that only records "practised OA-03" cannot be read next
  month to pick the next component.
- **Training does not hand out verdicts.** The objective moves to a verdict through
  `nzt-learn-assess`, on a case nobody practised. A series that went well says
  `in progress`, with the evidence.

## Done when

The session closes when performance held across different cases, or when you can say which
of the other two endings happened and why. And `progress.md` names the component, so the
next session does not start by re-deciding what to work on.
