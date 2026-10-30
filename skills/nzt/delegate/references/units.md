# Delegating units to `nzt-worker`

## Contents
- Which units can go
- Choose the model
- Shared files
- Before the workers start
- Write the prompt
- Without a worktree
- What comes back
- When the group stops
- Done when

Produces approved units run at the same time by workers, then merged, checked and recorded
by you. The method of each unit is still its phase's skill; this file is only how it is
handed out and taken back.

> **The workers build; the group is yours.** Its plan, its merge, its checks, its state.

## Which units can go

Only units the **approved** plan marked parallel. Before starting them, check again that
each one still holds every condition, because the work moved since the plan was approved:

| Condition | What breaks it |
|---|---|
| It does not need another unit's result | a story that calls an endpoint another one is building |
| No other unit of the group touches its files | two stories that change the same screen |
| It needs no structural change to a shared file | a new migration, a new project, a stack change |
| Its phase hands out work | only build and verify; ship only prepares — a pipeline file, a changelog draft |
| It can start without asking the user | an open question its result depends on |

A unit that fails one runs here, after the group, and you say so in one line: *"the plan
said parallel, I run it after because …"*. Analysis, architecture and UX never go: they are
questions and decisions.

## Choose the model

| The unit is | Model |
|---|---|
| Mechanical, with closed criteria: documents, tests from scenarios already written, a rename | a smaller model the host offers |
| A normal story | the main conversation's |
| Ambiguous, cross-cutting, or carrying a design call | not delegated: it runs here |

The plan showed each delegated unit's model, and that is the one you pass. Where the host
cannot choose a model per call, the worker uses the main conversation's.

## Shared files

The state, the glossary, every stack document, the project and package files, the
migrations, and any file two units of the group name. **A worker never edits them**: it
writes in its report the change they need, and you apply it after merging. A glossary term
that does not exist yet is still discovery's: the entry is written there first.

## Before the workers start

1. **Check out the work branch the plan declared**, and commit the starting point on it
   with a one-line message naming the group. Approving the plan authorised this commit; the
   worker's worktree sees only what is committed.
2. **Write the state** with the group's units as `nzt-plan` says for a parallel group.
3. **Start at most three workers at a time.** The next unit waits for one to finish.

## Write the prompt

The worker saw none of this conversation. What is not in the prompt, it does not know.

1. **The unit**: its id, its `do` line, and the phase skill to load.
2. **Where its definition is**: the story or spec, the stack document, the glossary — by
   path; it reads them itself.
3. **The commit to start from**: the one step 1 made.
4. **Its files, and the shared files it must not edit**, both by path.
5. **The checks to run**: the ones its phase owns for this unit.
6. **The model**, from the table above.

The shape of its report is in its agent file, and it stops after reporting.

## Without a worktree

Where the host gives a worker no worktree of its own — Codex today — the workers share your
checkout. Then:

- Their files must not overlap at all, shared files included.
- Only one of them builds or runs tests, and its prompt says it is the only one; the rest
  report those checks as not run.
- They do not commit. You commit once the group is merged and checked.

## What comes back

Reject a report that is not in the agent file's shape. Then, one worker at a time:

1. **Read the diff of its branch against the starting commit.** What it says it did is in
   the diff, or it did not happen.
2. **Merge its branch into the work branch.** A conflict means the group was not
   independent: stop merging, and resolve it yourself only if no decision is in it.
3. **Apply the shared-file changes it listed**, each one checked against the spec.
4. **After the last merge, run the phase's checks yourself** on the work branch. Those
   results are the ones you report, and the ones a coverage mark rests on; a mark whose
   check fails here is removed.
5. **Remove each merged worktree.** Its work is on the work branch now.

## When the group stops

A failure, a contradiction or a question only the user can answer, in any report: start no
other worker, let the running ones finish, merge what holds, write the state, report the
group and stop. The kernel's context marks stop it the same way.

The report covers the group: one line per unit with its four fields, what was merged, and
the checks you ran after the last merge with their real result.

## Done when

- Every unit that went still held every condition when it started.
- Each worker got its commit, its files, its shared files, its checks and its model.
- Every branch was read as a diff before it was merged.
- The checks after the last merge were run by you, and the report gives their result.
- The state says where each unit of the group stands.
