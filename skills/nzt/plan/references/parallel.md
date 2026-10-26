# Parallel groups

Produces the plan's parallel groups — units that run at the same time, each in its own
worker — and how the state holds them. Which units qualify, the model table and how a group
is handed out and merged are `nzt-delegate`'s reference on units; this file is only the
plan and the state.

## In the plan

1. **Offer a group only where it can run**: `delegation` is not `off`, the host has
   subagents and `nzt-worker` is installed. Otherwise there are no groups, and the plan is
   the same plan run one unit after another.
2. **A group is units of one phase, in one slice**, that hold the conditions of
   `nzt-delegate`'s reference on units — build or verify, or ship only preparing. A unit
   that fails one stays out, in sequence.
3. **Give each unit of the group `group`** — the group's id, `P1`, `P2`, … in plan order —
   and **`model: "small"`** when the model table sends it to a smaller model. Absent, the
   unit runs on the main conversation's model; `"main"` says the same explicitly.
4. **Declare the work branch** in `work_branch` with the first group. Approving the plan
   authorises the commit of each group's starting point on it, and nothing else.
5. **A group stops once, when it ends.** Its units run without a stop between them; the
   group's report is the stop, as if the user had chosen it as a batch.

## In the state

```json
{
  "work_branch": "nzt/run-12",
  "phases": [{ "name": "build", "status": "doing", "units": [
    { "id": 12, "do": "one line", "status": "doing", "group": "P1", "model": "small",
      "detail": "worker on worktree-a1b2" },
    { "id": 13, "do": "one line", "status": "doing", "group": "P1",
      "detail": "worker on worktree-c3d4" },
    { "id": 14, "do": "one line", "status": "todo", "group": "P1" }] }]
}
```

- **At most one unit is `doing`, or several of the same group.** Never units of two groups,
  and never a group's unit with one outside it.
- A unit is `doing` from the moment its worker starts, with the worker's branch in `detail`.
  The rest of its group stays `todo` until a worker is free.
- **A unit is `done` once its branch is merged and the checks after the last merge pass.**
  A worker's report alone does not make it `done`.
- A unit pulled out of its group before it starts loses `group` and `model`, and runs in
  sequence after the group.
- `group` and `model` stay on a unit that is `done`: they say how it was built.

## Done when

- Every group was offered only where it can run, and every unit in it holds the conditions.
- The plan shows each group, each unit's model and the work branch, and says the group
  stops once.
- The state passes `nzt-ai state check` with the group running.
