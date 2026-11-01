# Planning by slices

A slice is a piece walked end to end with its own phases, so value — and defects — reach the
user before the whole scope is built. For full work, or when the user wants early delivery.

## Cut

1. A slice is cut by an outcome the user can try, never by layer or file. Default: a feature
   of up to three stories. Bigger is the user's call.
2. Work for the whole run — the product definition, a final release — is its own slice.
   Nothing lives outside slices.
3. **Analysis first**: a new product or feature starts with only the analysis slice and the
   shape of the rest in one line. When it closes, rewrite the plan with the concrete slices,
   set `approved: false` and ask again.
4. Plan only **delivery 1** (from `product.md`) in slices; later deliveries are one line.
   When delivery 1 has something to learn from users, offer a prototype (`nzt-ux`) inside
   the analysis slice. A new product's first build slice is the **walking skeleton**: the
   whole path end to end, thinnest form.

Delivery 1 cuts scope, never the definition of done.

## Cadence

Propose one, with its cost, and write it in `cadence`:

| Cadence | Cut | When |
|---|---|---|
| `delivery` *(default)* | first slice analyses the whole delivery; then one slice per feature with the other phases | most new work |
| `upfront` | the whole run's analysis in the first slice | the problem is clear |
| `just-in-time` | each slice brings its own analysis | almost nothing is known |

Whatever the cadence, a feature's scope, rules and story index exist before its first slice
is built; only the stories' criteria may wait. "The spec of F-001 and its stories" is one
step; when the index exists, cut one unit per story — no new approval needed.

## Run

- Phase rules hold inside each slice; verify after the slice's last build unit.
- The agent's QA chains inside the batch; a person's QA unit goes in `autonomy.keep_stops`.
- **QA fails:** the batch stops. The verify unit is `done` (it ran) with the defect in the
  testing file; verify stays `doing` with `waiting_on` naming it. When the user authorises
  the fix, reopen that slice's `build` with a new unit and set verify back to `todo` with a
  re-run unit — the only case where a `done` phase reopens.

## Show

One table per slice under `S2 · <name>`, never a slice column. Below: the declarations of
`proposal.md`, the cadence and why, the autonomy offer, and the shape after delivery 1.

## Done when

Every slice can be tried alone and is its own table; analysis comes first with re-approval
after it; `cadence` is written; no verify unit sits between two build units of a slice.
