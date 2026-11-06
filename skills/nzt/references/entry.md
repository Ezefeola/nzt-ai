
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
   `Plan/specs/`, the README and the files that declare what it is made of (manifests,
   configuration) — not the work itself. Never classify by the project's name.
3. **Route out** two kinds of request: learning a skill ("teach me", or continuing a topic in
   `Learn/`) → load `nzt-learn`; a question that is not work → answer it, NZT does not apply.
4. **Size it** by what the work touches, never by how it was phrased:

   | What changes | Size | Starts at |
   |---|---|---|
   | Something that exists is corrected or adjusted; what was agreed stays as it is | Direct | Reproducing what fails, or the change itself |
   | Behavior is added or changed within the current structure, in one or two stories | Standard | Discovery of that change |
   | Something new end to end, the structure (a new part or technology), or three or more stories | Full | Discovery, cut into slices |
   | Existing work has no `Plan/specs/` and has to be put in order | Full | Reconstructing what it does, part by part |

   Standard: one plan of phases, approved once. Full: slices.
   In doubt, the lighter size; when the work outgrows it, say so and propose the next.
   Size cuts ceremony, never the definition of done.
5. **Pick the phases whose question is still open**, in this order:
   - **discovery** — what it must do, or for whom, is not agreed yet, or
     changes;
   - **architecture** — how it is made is not decided yet: a new part, a new technology or
     tool, or parts that start depending on each other;
   - **design** — someone will perceive or operate something whose form is not
     decided yet;
   - **build** — always, if the work product changes;
   - **verify** — always, if what it does changes;
   - **ship** — the user asked for the work to reach other people.

   Say in one line why each skipped phase was skipped.
6. **Hand off**, saying in one line the situation, size and phases:
   - more than one unit, or closing an accepted feature → load `nzt-plan`;
   - a single unit → load its phase router and do it.

## Done when

You named the situation, size and phases in one line and handed off.
