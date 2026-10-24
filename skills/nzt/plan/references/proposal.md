# Proposing the plan

Produces the plan message: the table the user approves, and the documents it lists for the
user to keep or drop. Read it before showing a plan, new or rewritten.

## How the plan is shown

- **Markdown, never inside a code block**, so the table renders.
- One row per step, saying **what it produces and why**: the *why* lets the user judge the
  approach, not only the order. Analysis produces the glossary, the spec and its stories.
- **Every document goes by its name** — the spec, the user stories, the glossary — with a
  plain explanation beside it. Plain words explain a document; they never rename it, or the
  user approves a "list of use cases" and gets stories.
- Under the table, three declarations: **where it stops**, **what it leaves out**, and what
  it covers beyond the minimum so the user can drop it. *"I am leaving out coupon
  administration: that is F-009 and you did not ask for it"* is what makes scope reviewable.
- One line for each phase you skipped and why.

## The documents the plan produces

The plan lists the documents it will produce, and the user keeps or drops them line by
line. Three categories:

| Category | Behaviour |
|---|---|
| **Mandatory** | Not offered, declared. Without it the work cannot continue |
| **Offered** | Appears as a line of the plan; the user can drop it |
| **On request** | Does not appear unless the user asks for it |

- Offering one, say what dropping it loses: not *"do you want the ADR?"* but *"without it,
  this decision gets re-argued in three months with no record of what was weighed"*.
- **Mandatory:** the stack per component and area, designed with it or read from evidence
  before its code is touched, with `architecture.md` naming its root; the product definition and the glossary, from Analysis on, the
  glossary updated by every unit that adds or changes a term. **Offered: feature design.**
- A document that already exists and that the change affects is kept current as part of the
  work, never offered as optional.
- Do not ask what you can verify — a version, a capability, a package's maintenance state.
  Ask the user about tradeoffs and material changes, and never re-ask what the project
  already decided: if the stack answers it, read it.

## Done when

- The table renders, and every row says what it produces, by its name, and why.
- Where it stops, what it leaves out and what can be dropped are declared under it.
- Every document is mandatory and declared, or offered with what dropping it loses.
