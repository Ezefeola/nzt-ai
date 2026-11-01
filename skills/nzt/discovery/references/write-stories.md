# User story

Produces `Plan/specs/<feature>/stories/US-NNN-<slug>.md`: the criteria of one story and
their coverage marks — **the only place progress is read from**.

## Steps

1. Read `spec.md` (criteria cite its rules by slug) and `tech.md` (it declares the areas).
2. Write the story when the plan's cadence says; until then it is one line in the index.

## The file

```markdown
# US-002 · A coupon that cannot be used
feature: F-003

As a customer with a promotion code, I want to know straight away that it will not apply,
so I do not confirm an order expecting a discount.

## Criteria
- [ ] **CA-01 · An expired coupon leaves the total untouched.** (RN-cupon-vencido)
  When I apply `INVIERNO20`, expired on 2026-05-01, to an order of $10.000, the total stays
  $10.000 and the coupon is reported as expired.
  backend ✓ · frontend — · qa —

## Notes
- Q-13 · Does a refund return the coupon? Does not block these criteria.
```

## Rules

1. **`CA-NN` per criterion**, assigned once, never reused or renumbered; cited elsewhere as
   `US-NNN CA-NN`.
2. **Declarative** (*when I apply a valid coupon*, never *when I click Apply*), **one `When`**,
   **concrete data** (real amounts, dates, codes), **the rule cited by slug**.
   A criterion needing a paragraph is several.
3. **At least one unhappy path** per story, or the written reason there is none.
4. **The coverage line** lists **every** area `tech.md` declares, applicable or not, and
   ends with `qa`:

   | Mark | Set by | Means |
   |---|---|---|
   | area `✓` | `nzt-build` | built, and its enabled tests pass |
   | `qa ✓` | `nzt-verify` | the scenarios of every built area passed |
   | `[x]` | the user | accepted, once every area and `qa` are `✓` |

   `qa ✓` is all built areas or nothing. This reference writes the line; it never marks it.
5. **One story is one outcome the user can accept**: never split by area, layer or system.
   One story per unit.
6. No priorities or severities: order comes from dependencies and the plan.
7. **Changing a story**: a criterion returns to `[ ]` (and `qa —`) only if what is observed
   changed; rewording keeps its marks. One that no longer applies is removed with its reason
   where it was decided. A new one arrives `[ ]` with the full line.

## Done when

Someone could build this story and someone else verify it without asking you; no criterion
names a technology, a widget or an endpoint.
