# Parallel groups

Units that run at the same time, each in its own worker. Which units qualify, the model
table and how a group is handed out and merged are `nzt-delegate`'s `units.md`; this file is
the plan and the state.

## In the plan

1. Offer a group only where `nzt-delegate` allows it (mode, host, `nzt-worker`). Otherwise
   the same plan runs in sequence.
2. A group is units of one phase in one slice that meet `units.md`'s conditions.
3. Give each unit `group` (`P1`, `P2`… in plan order) and `model: "small"` when the model
   table sends it to a smaller model (absent or `"main"`: the main model).
4. Declare `work_branch` with the first group. Approval authorises committing each group's
   starting point on it, nothing else.
5. A group stops once, at its end.

## In the state

```json
{
  "work_branch": "nzt/run-12",
  "phases": [{ "name": "build", "status": "doing", "units": [
    { "id": 12, "do": "one line", "status": "doing", "group": "P1", "model": "small",
      "detail": "worker on worktree-a1b2" },
    { "id": 13, "do": "one line", "status": "todo", "group": "P1" }] }]
}
```

- A unit is `doing` from its worker's start, with the worker's branch in `detail`.
- **`done` once its branch is merged and the checks after the last merge pass**, never on
  the worker's report alone.
- A unit pulled out before it starts loses `group` and `model` and runs after the group.
  `group` and `model` stay on `done` units.

## Done when

The plan shows group, model and work branch, and the state passes the state check
(`SKILL.md`) with the group running.
