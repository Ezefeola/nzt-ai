---
name: nzt
description: Use when work starts, when resuming a session, or when it is unclear which phase the work belongs to. Reads the state, classifies and sizes the request, picks the phases and hands off.
---

# NZT entry point

Decides **where the work starts, its size and its phases**, then hands off. It produces no
artifact and never proposes a plan (that is `nzt-plan`).

## Steps

1. **Read the state.** If `Plan/state.json` exists, read it before asking anything:
   - a unit `doing` → report it and continue there;
   - all units `done` → the new request is a new run;
   - `approved: false` → show that plan again instead of writing a new one;
   - `waiting_on` set → say what it waits on first.
2. **Read the ground** (only without state): one cheap pass over top-level entries, `Docs/`,
   `Plan/specs/`, README and manifest files. Not the source tree. Never classify by the
   project's name.
3. **Route out** two kinds of request: learning a skill ("teach me", or continuing a topic in
   `Learn/`) → load `nzt-learn`; a question that is not work → answer it, NZT does not apply.
4. **Size it** by what the work touches, never by how it was phrased:

   | The request | Size | Starts at |
   |---|---|---|
   | A reported defect | Direct | Reproduce, fix, check |
   | A small change or chore | Direct | The work itself |
   | An improvement, or a feature of one or two stories that fits the current architecture | Standard | Analysis of that feature |
   | A new product, three or more stories, a new component, a technology decision, several new screens or levels | Full | Analysis, cut into slices |
   | "Put this project in order" with no `Plan/specs/` | Full | Reverse engineering, module by module |

   Direct: no plan, no state. Standard: one plan of phases, approved once. Full: slices.
   In doubt, the lighter size; when the work outgrows it, say so and propose the next.
   Size cuts ceremony, never the definition of done.
5. **Pick the phases** that change what gets built, in this order:
   - **analysis** (`nzt-discovery`) — the request names a product, a feature, users or rules;
   - **architecture** — new components, a technology choice, cross-component interaction;
   - **design** (`nzt-design`) — a person will see or operate something that does not exist
     yet: a screen, a menu, a level, a page layout;
   - **build** — always, if the product changes;
   - **verify** — always, if behavior changes, after build finishes the slice;
   - **ship** — the user asked for a release, a pipeline, a deploy or a publication.

   Say in one line why each skipped phase was skipped.
6. **Hand off**, saying in one line the situation, size and phases:
   - more than one unit, or closing an accepted feature → load `nzt-plan`;
   - a single unit → load its phase router and do it.

## Done when

You named the situation, size and phases in one line and handed off.
