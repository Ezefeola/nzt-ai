# Planning by slices

Produces a plan cut into **slices**: pieces walked end to end, each with its own phases, so
value reaches the user — and a defect reaches you — before the whole scope is built. The
state format is in *The state file* of `nzt-plan`; this file says how to cut and run it.

## When

- A new product, a feature of several stories, or work the user wants delivered early.
- Not a reported bug, not a small change, not one story alone: those stay a plan with
  `phases`, which is a plan of one slice.

## What a slice is

What the plan cuts to walk end to end, with the phases it needs. **By default a feature.**
Cut smaller — one story, or the fewest that can only be tested together — when faster
feedback is worth the extra stops. The cut is a line of the plan, and the user approves it.

- A slice is cut by outcome the user can try, never by layer or by file.
- Work that belongs to the whole run — the product definition, a final release — is its own
  slice. There are no phases outside slices.

## Discovery comes first

Slices come out of discovery; you cannot cut what you do not know yet.

1. A new product or feature starts with a plan that knows **only the discovery slice**, and
   draws the shape of the rest in one line.
2. When that slice closes, **rewrite the plan with the concrete slices** — which, in what
   order, how big, with which cadence — set `approved: false`, and ask again. That approval
   is where delivery 1 and the batch are decided.

## Delivery 1

The product's delivery 1 (`nzt-discovery`'s `product.md`) says what reaches the user first
and for which objective. Its slices are planned; later deliveries stay as one line in the
plan's shape, never as units. When delivery 1 has something to learn from users, **offer an
HTML prototype** (`nzt-ux`) inside the discovery slice: it is thrown away, never turned into
production code. In a new product, the first build slice is the **walking skeleton**: the
whole path end to end in its thinnest form, real code the next slices grow.

**Delivery 1 cuts scope, never the definition of done**: coverage per area, `qa` and the
user's acceptance hold in every slice.

## Cadence

Propose it in the plan, say what each mode costs, and write the one approved in `cadence`.

| Cadence | How the slices are cut | When |
|---|---|---|
| `delivery` — **propose by default** | first slice: the analysis of the whole delivery, its specs and stories; then one slice per feature or smaller, with architecture, UX, build and verify | most new work: define once, then run in a batch |
| `upfront` | the analysis of the whole run in the first slice | the problem is clear, or delivery 1 is the whole scope |
| `just-in-time` | each slice brings its own analysis | almost nothing is known yet |

**Whatever the cadence, a feature's scope, business rules and story index are written
before its first slice is built.** What waits is the stories' criteria, never the rules: a
rule crosses stories, and defined late it gets defined three different ways. The story
index, one line *As… I want… so that…* per story, is the backlog; there is no other list.

## Inside a slice

The phase rules of the state file hold inside each slice: in order, no name repeated, at
most one `doing`. **Verify runs once the slice is built in every area**, never between two
build units of it: build never designs or runs application tests.

- **Who tests.** The AI's QA chains inside the batch. A person's QA unit goes in
  `autonomy.keep_stops`: the batch waits for them there.
- When a slice's last phase ends, the same write marks it `done` and the next `doing`, with
  its first phase `doing`.

## When QA fails inside the batch

The batch stops. Nothing is built on top of what failed.

1. The verify unit is `done` — it ran — and its result is in the testing file, with the bug.
2. Verify stays `doing`; `waiting_on` names the slice and the bug. Report and stop.
3. When the user authorises the fix, reopen that slice's `build` to `doing` with the fix as
   a new unit, and set verify back to `todo` with a new unit for the re-run. **It is the only
   case where a `done` phase goes back**, and only inside the current slice.

## How it is shown

The plan table gets a **Slice** column, and under it the declarations of `proposal.md`, plus:

- the cadence, and why;
- which slices run in a batch and which stops are kept — the autonomy offer, once;
- the shape of what comes after delivery 1, in one line.

## Done when

- Every slice can be tried by the user on its own, and says which phases it needs.
- The discovery slice comes first when the scope is not known yet, with re-approval after it.
- `cadence` is written, and no feature starts building without its scope and rules.
- No verify unit sits between two build units of the same slice.
