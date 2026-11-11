# Questions

How every phase asks: when, how, where it is written, and the two ways it closes. How it
looks on screen is in the kernel; a phase's own kinds of question are in its router.

## Before asking

1. **Is it a decision?** A missing entry is not a missing decision: check `tech.md`, the
   decision logs, the evidence and the authorisation already given. A defect in your own
   work is fixed, not asked.
2. **Was it already decided?** Read it where it was decided. A gap there is asked once and
   written back.
3. **Can it be verified?** A version, a capability, a vendor's behavior is research, with
   its source — never a question.

## Asking

1. Bring a proposal: the options, what each leads to, the one you recommend.
2. Use a concrete scenario — people, data, a sequence — instead of a category.
3. Rounds of three to five, ordered by how much each unblocks.
4. Record what the user chose, never your recommendation.

## Where it is written

| Kind | Id | Log |
|---|---|---|
| Business: what the product does | `Q-NN` | the product's or the feature's `analysis.md` |
| Technical: how it is built | `QT-NN` | `Docs/Architecture/architecture-decisions.md`, or the feature's `tech-design/decisions.md` |

Write it before asking and the answer when it arrives. A question raised in another phase
goes to the log of the phase that answers it, and is cited by that id. Ids are never reused.

| Where it comes up | What you do |
|---|---|
| Clarifying the request | It is a unit of the plan |
| Producing an artifact | Pause what depends on it, log it, continue with the rest |
| Executing: a missing detail inside the agreed scope | Decide it, label it yours, continue |

## Closing

A written question closes with **an answer**, or an explicit **`[TO-DEFINE]`** that takes it
out of scope. Assuming is not an exit. Reduced scope is recorded, never reported as complete.

## Done when

Someone who was not here can find each question by id in one log, see what was chosen and by
whom, and tell which are still open.
