# The state file

Produces `Plan/state.json` at the project root: plan and state together. There is no
separate plan file, it is never a log, and progress lives in the artifacts. Write it from
this file, never from memory.

```json
{
  "version": 1,
  "updated": "2026-09-16T14:22:00Z",
  "goal": "one line: what this run is for",
  "phases": [{ "name": "build", "status": "doing", "units": [
    { "id": 4, "do": "one line", "status": "doing", "detail": "where you stopped" }] }],
  "approved": true, "delegation": "ask",
  "autonomy": { "units": [4, 5], "keep_stops": [5] },
  "waiting_on": "what you are blocked on, or null",
  "notes": ["at most 3 short items"]
}
```

- `status` is `todo`, `doing`, `done` or `dropped`. One unit `doing`, or one group's. Every entry, one line.
- `phases` are the phases `nzt` chose, in run order, named `analysis`, `architecture`, `ux`,
  `build`, `verify` or `ship` and no other, with the same statuses and **at most one `doing`**:
  that one is the current phase, a skipped one is not listed. **Each unit lives in its phase's
  `units`**, in run order, ids unique in the file; the next unit is the first `todo` of the
  phase `doing`. **When a phase's last unit ends, that same write marks it `done` and the
  next one `doing`**; one with empty `units` stays `todo`, one the user drops is `dropped`.
- **A plan cut into slices** has `version` 2 and `slices` (`id`, `name`, `status`, `phases`)
  in place of `phases`: each is walked end to end under the rules above, one `doing` at most;
  `cadence` (`delivery`, `upfront`, `just-in-time`; absent `upfront`) says how. How slices are
  cut and run is `nzt-plan`'s slices reference.
- `approved` is the lock on the main stop: without `true`, nothing executes.
- `autonomy` records the batch the user selected: which units run without stopping, and
  which stops are kept anyway. **Absent or empty means accompanied.** `delegation` is the
  project's subagent mode, `auto`, `ask` or `off`; absent is `ask`, and only the user sets it.
- **A parallel group** adds `group`, `model` and `work_branch`; their shape is in
  `nzt-plan`'s parallel reference, read when the plan marks one.
- Never write the file while you are inside a unit. Rewrite the plan when the user changes
  it. **A new run rewrites the file** with its own goal, phases and units, ids counting on
  from the last run, `delegation` kept; inside a run, nothing `done` or `dropped` is deleted.
- **Write it for a session that has none of this conversation**: a decision taken out loud,
  where a unit actually stopped, what it is waiting on — if resuming needs it, it goes in
  the file. Context gets cleared; what is not here is gone.

## Done when

The file passes `nzt-ai state check`, and a session that has none of this conversation can
read where the work stands, what comes next and what it is waiting on.
