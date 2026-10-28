# Delegating a reading to `nzt-explorer`

Produces an answer to one question, gathered by a subagent so the reading does not fill your
window, and checked by you before anything rests on it.

## What can be delegated

Only reading, and only in these three situations:

| Situation | Example |
|---|---|
| Surveying code nobody has described yet | *Which modules touch an order's status, and where?* |
| Searching the whole repository without knowing where | *Where is the tax rate read, in any form?* |
| Researching on the web | *What does the provider's webhook carry in its current version?* |

Never delegated as a reading, whatever the mode:

- Writing anything: code, a spec, a document, the state.
- A question to the user, a decision, a plan, an approval.
- **A reading you will need whole anyway.** If you are going to change the file, read it
  yourself; a summary of it is a second copy you would have to reconcile.
- A search one command answers. The subagent costs more than the search.

The subagent is `nzt-explorer` in Claude Code and `nzt_explorer` in Codex. If it is not
there, do the reading yourself and say nothing about it.

## Write the prompt

The subagent saw none of this conversation. What is not in the prompt, it does not know.

1. **The question, and the decision it feeds.** *"Which modules write `Order.Status` — I
   have to decide where the cancellation rule lives."* The decision bounds the search.
2. **Where to look and where not to.** Folders, file kinds, the version in use, sources to
   prefer. Exclusions save as much as inclusions.
3. **What is already known.** The files you already read, the answer you suspect. It is
   told to confirm or refute, not to start over.
4. **A limit on the number of pointers.** The shape of the answer is fixed in the agent's
   file; the prompt does not restate it.
5. **When to stop.** The question answered, or a stated budget of files or pages spent.

For a web question, name the provider, the version, and the claim to check; the subagent
labels what it finds as `nzt-research` does.

## What comes back

The shape of its answer is in its agent file: the question, one pointer and one claim per
line labelled as `nzt-research` labels it, and what it did not look at. **Reject an answer
that is not in that shape.** What it did not look at is part of the answer: silence about
an area reads as *nothing there*, and may only mean *not searched*.

## Use what comes back

- **A pointer is read before it is stated.** Open the line it cites before a spec, a design,
  the code or a reply rests on it.
- A pointer that does not hold is dropped, and said if it would have changed the decision.
- What it did not look at stays open. Search it yourself, delegate again, or tell the user
  the answer covers less than the question.
- Cite the files you read, never the subagent.

## Done when

- The prompt carried the question, the decision, the bounds and the answer's shape.
- Every claim you made from the answer was checked against the line or page it cites.
- What was not looked at was said, or searched.
