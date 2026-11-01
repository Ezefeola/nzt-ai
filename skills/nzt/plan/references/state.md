# The state file

`Plan/state.json` at the project root: plan and state together. Not a log — progress lives
in the artifacts.

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

## Rules

1. `status` is `todo`, `doing`, `done` or `dropped`. One unit `doing`, or one parallel
   group's units. Every entry is one line.
2. `phases` are named `analysis`, `architecture`, `ux`, `build`, `verify` or `ship`, in run
   order, skipped ones absent, **at most one `doing`**: the current phase. Ids are unique in
   the file; the next unit is the first `todo` of the `doing` phase.
3. When a phase's last unit ends, the same write marks it `done` and the next one `doing`.
   A phase with empty `units` stays `todo`; one the user drops is `dropped`.
4. **Sliced plans** have `version: 2` and `slices` (`id`, `name`, `status`, `phases`)
   instead of `phases`, each walked under the rules above; `cadence` is `delivery`,
   `upfront` or `just-in-time` (absent: `upfront`). See `slices.md`.
5. `approved` locks execution. `autonomy` is the batch the user chose; absent or empty is
   accompanied. `delegation` is `auto`, `ask` or `off` (absent: `ask`), set only by the user.
6. Parallel groups add `group`, `model` and `work_branch` (`parallel.md`).
7. Never write it inside a unit. A new run rewrites the file — ids continue, `delegation`
   kept; inside a run nothing `done` or `dropped` is deleted.
8. **Write it for a session that has none of this conversation**: decisions taken out loud,
   where the unit stopped, what it waits on.

## Done when

It passes `nzt-ai state check`, and a fresh session can tell where the work stands, what
comes next and what it is waiting on.
