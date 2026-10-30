# Questions

Produces a question the user can answer: when it is asked, how, where it is written, and
the only two ways it closes. Every phase asks this way; how a question looks on screen is
in the kernel, and what a phase adds — the technical kinds and their modes — is in its
router.

## Where it comes up

| Where it comes up | What you do |
|---|---|
| Clarifying what the user wants | It is a step of the plan; its questions belong there |
| While producing an artifact | Pause what depends on it, write it where that work records questions, continue with what is independent |
| While executing: a missing piece, a missing contract | Resolve it and continue the same unit |

## Before asking

- **Check that it is a decision.** A missing entry in a document is not a missing decision:
  consult the stack, the evidence, and the authorisation already given. A defect in your own
  change is repaired and verified, not asked about.
- **Never re-ask what the project already decided.** If the stack, a decisions log or an
  analysis answers it, read it there. A gap in one of them is asked once and written back
  into it.
- **Do not ask what you can verify**: a version, a capability, a package's maintenance
  state. That is research, with its source.

## Asking

- **Bring a proposal with the question**: the options, what each one leads to, and which one
  you recommend. **Record what the user chose, never your recommendation.**
- Ask with a concrete scenario — people, data, a sequence of actions — not an abstract
  category, whenever the case allows it.
- **Short rounds of three to five questions**, ordered by how much work each one unblocks,
  each saying what depends on it. The round limits what you ask, not what you record.

## Where it is written, and who numbers it

- **A question is written in its log before it is asked**, and the answer when it arrives.
- **Each id series belongs to the log of the phase that answers it**: business questions
  are `Q-NN` in the feature's or the product's `analysis.md`; technical ones are `QT-NN` in
  the architecture decisions log. An id is assigned there, once, and never reused.
- **A question raised in another phase goes to the log of the phase that answers it**, and
  the phase that raised it cites it by that id. A screen that finds an undefined rule opens
  a `Q-NN` in `analysis.md`, never a number of its own.

## Closing

**A written question has two exits: an answer, or an explicit `[TO-DEFINE]` that takes it
out of scope. Assuming is not one of them.** Reduced scope is recorded, and never reported
as complete.

## Done when

Rehearse it: could someone who was not here find each question by its id in one log, see
what was chosen and by whom, and tell which ones are still open?
