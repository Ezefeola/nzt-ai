# Functional analysis — the interview and its record

## Contents
- The file
- Append-only
- Running the interview
- Technical notes get no identifier
- Dismissed objections are part of the answer
- Two altitudes
- Playback
- Done when

Produces the interview record: `Plan/specs/<feature>/analysis.md` for a feature,
`Docs/Product/analysis.md` for the product. Everything the rest of discovery writes is read from
this file, and it is the only place where a question survives a cleared context.

## The file

Create it when the first question exists, not when the first answer arrives.

```markdown
# Analysis — <product or feature>

## Open

### Q-07 · Can the same customer use a coupon twice?
- blocks: the coupon rule, and the criteria of US-004
- answer:

## Answered

### Q-03 · Does the app have to work without internet?
- blocks: whether offline is in scope for the product
- answer: No. The field team is always connected. · 2026-09-16

### Q-05 · Which roles can cancel an order?
- blocks: RN-cancelar-orden
- answer: Superseded by Q-09.

## Technical notes
- Two systems hold the customer's balance and neither is declared the owner.
  For architecture. Not investigated here.

## Objections
- I warned that a coupon without an expiry date cannot be retired once issued, and
  proposed an expiry field. The user keeps it without one. Not reopened without a new
  argument.
```

- **A `Q-NN` is assigned once and never reused**, not even for a question that turned out
  not to matter. Rules cite their origin by that identifier; renumbering breaks the trail.
- Questions are written **before** they are asked, with an empty answer. Batch them into
  the file as they accumulate.
- `blocks:` is what cannot be written until the answer exists. If you cannot fill it, the
  question is curiosity and does not belong in the file.
- Move a question from **Open** to **Answered** with the user's answer in their terms and
  the date. Keep the two sections; the file is read for what is still missing.

## Append-only

The file is never edited backwards and never deleted.

- A superseded answer is **marked**, never rewritten: `Superseded by Q-09.` Its text stays
  where it was.
- A wrong answer is not corrected in place. Ask again under a new `Q-NN` and mark the old
  one.
- An answer you inferred is not an answer. If the user did not say it, the question is
  still open, whatever you would have written.

## Running the interview

The question discipline — where a question belongs, rounds of three to five, bringing a
proposal with the question, and the two exits of a written question — is in `nzt-plan`.
What this phase adds:

- **Ask in behaviour.** If the question cannot be phrased without naming a table, a package
  or a vendor, it is not functional. *"Does the app have to work without internet?"*, not
  *"token or online?"*.
- **Ask the edges question early**: does anything else need to know about what changes
  here, or does this depend on something another system knows? A rule nobody stated before
  the spec is a rule nobody writes.
- **Ask for the bad case by name.** *"What happens when the coupon is expired?"* is the
  question that produces the unhappy path; without it the path gets invented later.
- **Ask with a concrete case** — a person, data, a sequence — whenever the subject allows
  it. Abstract categories get abstract answers.
- Do not ask what the project already answers. Read the existing specs, the product
  document and the glossary first.

## Technical notes get no identifier

When something technical surfaces, write it in **Technical notes** with what it will
decide, and leave it. Do not investigate it, do not open a `Q-NN` for it, and do not let it
change the functional question you were asking. Architecture resolves it.

## Dismissed objections are part of the answer

When you warn about something and the user keeps their decision, record three things: what
you warned, what you proposed, and that the user is keeping it. It is executed as theirs
and not reopened without a new argument.

## Two altitudes

Both have to close before the phase does.

| Altitude | Where | How it is established |
|---|---|---|
| Product | `Docs/Product/analysis.md` | Conversation only. **Never written by reading the repository** |
| Feature | `Plan/specs/<feature>/analysis.md` | Conversation, and code when the behavior already exists |

- Features emerge from the conversation, and the product document is the minutes of what
  this phase established — not a source the features are derived from.
- When the behavior exists only as code, the reading is `nzt-discovery-reverse`, and what
  it returns enters the file as a finding for the user to rule on, never as an answer.

## Playback

Before closing, play back what the interview established, in three blocks:

- **Agreed** — what the user stated.
- **Proposed by me** — what I filled in. **None of it counts as agreed until the user
  confirms it.**
- **Pending** — every open `Q-NN`, and every `[TO-DEFINE]` that took something out of
  scope.

Anything the user confirms in the playback goes into the file as an answer with its own
`Q-NN`. Confirmation that lives only in the conversation is lost.

## Done when

Rehearse it: could you write the artifact this feeds — the product definition, or the
feature with **all** its stories — without asking anything else?

- If yes, the interview is closed.
- If no, the gaps are in the file as open questions. They are never invented, and the
  count of open questions is reported.
