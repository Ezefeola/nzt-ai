# Delegating a reading to `nzt-explorer`

An answer to one question gathered by a subagent (`nzt-explorer` in Claude Code,
`nzt_explorer` in Codex), checked by you before anything rests on it.

## What can go

Surveying something nobody has described, searching the whole repository without knowing
where, researching the web. **Never**: writing anything, a question or decision, a file you
will need whole anyway (you are going to change it), or a search one command answers.

## The prompt

1. **The question and the decision it feeds** — *"which modules write `Order.Status`: I must
   decide where the cancellation rule lives"*.
2. **Where to look and where not**: folders, file kinds, version, preferred sources.
3. **What is already known**: files read, the answer you suspect — to confirm or refute.
4. **A limit** on the number of pointers, and **when to stop** (answered, or a budget spent).

For the web: name the provider, version and the claim to check; findings are labelled as
`nzt-research` labels them.

## What comes back

1. Reject an answer not in the agent file's shape.
2. Open the line or page each pointer cites before you state it. Drop what does not hold,
   and say so if it would have changed the decision.
3. What it did not look at is still open: search it, delegate again, or say the answer
   covers less than the question.
4. Cite the files, never the subagent.

## Done when

Every claim you made from it was checked at its source, and what was not looked at was said.
