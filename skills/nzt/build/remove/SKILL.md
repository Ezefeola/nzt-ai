---
name: nzt-build-remove
description: Use when a behavior that exists has to be taken out: the sweep from the entry point inwards, the data decision kept separate, and the documents updated.
---

# Remove a behavior

Produces a behavior that is **gone**, with nothing left behind that reads as if it were
still in use.

**The build catches what you broke. It does not catch what you left.** That is the whole
reason this is a procedure and not an edit: half a removal is worse than none, because what
stays compiles, gets maintained, and is read by the next person as live code.

If you did not arrive here from `nzt-build`, load it first.

## Sweep from the outside in

In this order, because each step tells you what the next one can lose:

1. **The entry point** — the screen, the route, the endpoint, the menu item, the command.
2. **The operation** it triggers, and everything only it called.
3. **Its registration** — dependency injection, the route table, the scheduler, the
   handlers it was wired into.
4. **Its surface text** — labels, translations, messages, help text, error strings.
5. **Its data access** — the queries, the mappings, the indexes that existed for it.
6. **The model** — fields and types that existed only to serve it.
7. **What fed it** — background jobs, imports, feature flags, configuration keys,
   permissions, secrets.
8. **Its tests**, and the fixtures and test data built for it.

**At every step, one question: does anything else use this?** Search by name, by route, by
string, by configuration key — not just by the symbol your editor knows about. Reflection,
configuration and string references do not show up in a rename.

- Anything shared stays, and you say so in the report.
- Anything you are unsure about stays, named as unresolved. A doubt is not a licence.

## Data is a separate decision

Deleting a column, a table or the rows in it is **not** part of removing code:

- It is irreversible, so it is the user's decision, asked explicitly, with what is lost.
- Until it is answered, the code goes and the data stays. Unused data is cheap; deleted
  data is gone.
- When it is authorised, it happens through a generated migration like any other schema
  change, and never as a side effect of a code cleanup.

## The documents describe what is left

- The business rule that no longer applies comes **out** of `spec.md`. Its slug is not
  reused for something else.
- Criteria and stories that describe the removed behavior go too. The spec describes the
  present; a criterion for behavior that does not exist can only be verified as a failure.
- A stack document, a feature design or an architecture document naming what you removed is
  updated in the same unit.
- A `[remove]` marker is what authorised this. It stays until the feature is closed; it is
  not cleared by whoever implements.

## Deprecating instead of removing

When something outside this project depends on it, removal is staged, and both stages are
written down: what keeps working, for how long, and who is told. **A deprecation with no
removal date is not a plan**, it is the same code with an apology attached.

## Closing

- What is affected compiles and the checks around what you removed have been run.
- **Say what you searched for and where.** "Nothing else uses it" is a claim; the list of
  names, routes and keys you searched is the evidence for it.
- Everything you deliberately left — shared code, data, a deprecated path — is in the
  report, with why.

## Done when

Rehearse it: could someone read the codebase tomorrow and find no trace that suggests this
still works?

- No entry point reaches it, at any layer.
- Nothing is registered, scheduled, translated or configured for it.
- Its tests and test data are gone, not skipped.
- The documents no longer describe it.
- What was left on purpose is named, and the data decision was asked, not assumed.
