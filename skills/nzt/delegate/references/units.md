# Delegating units to `nzt-worker`

Approved units run at the same time by workers, then merged, checked and recorded by you.
The method of each unit is still its phase's router. **The workers build; the group is
yours.**

## Which units can go

Only units the approved plan marked parallel. Check again, before starting, that each holds:

| Condition | What breaks it |
|---|---|
| Needs no other unit's result | a story calling an endpoint another one is building |
| No other unit touches its files | two stories changing the same screen |
| No structural change to a shared file | a migration, a new project, a `tech.md` change |
| Its phase hands out work | build and verify; ship only preparing files |
| Starts without asking the user | an open question its result depends on |

A unit that fails one runs here after the group: *"the plan said parallel, I run it after
because …"*. Analysis, architecture and UX never go.

| The unit is | Model |
|---|---|
| Mechanical with closed criteria: documents, tests from written scenarios, a rename | a smaller model |
| A normal story | the main model |
| Ambiguous, cross-cutting, or with a design call | not delegated |

**Shared files** — the state, the glossary, `tech.md`, project and package files,
migrations, anything two units name — are never edited by a worker: it lists the change in
its report and you apply it after merging.

## Steps

1. Check out the plan's work branch and commit the starting point (approval authorised it).
2. Write the state with the group's units (`nzt-plan`'s `parallel.md`).
3. Start at most three workers. Each prompt carries: unit id, `do` line and phase router;
   paths of its story, `tech.md` and glossary; the starting commit; its files and the shared
   files it must not edit; the checks to run; the model.
4. **Without a worktree per worker** (Codex): no overlapping files at all, only one worker
   builds or runs tests, and none commits — you commit after merging.
5. For each report, one at a time: reject it if not in shape; read its branch's diff against
   the starting commit; merge (a conflict means the group was not independent: stop, and
   resolve only if no decision is in it); apply its shared-file changes.
6. After the last merge, **run the phase's checks yourself**: those are the results you
   report and that coverage marks rest on. Remove merged worktrees.
7. A failure, contradiction or user-only question in any report, or a context mark: start no
   more workers, let running ones finish, merge what holds, write the state, report, stop.

The report has one line per unit with its four fields, what was merged, and your checks.

## Done when

Every unit met the conditions when it started, every branch was read as a diff before
merging, and you ran the checks after the last merge.
