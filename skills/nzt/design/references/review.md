# Usability review

Produces findings about one screen, each with severity and **type** — the type says where it
goes. **An expert review, and the report says so**: it does not replace testing with users.

## Steps

1. **Say which input you reviewed** and what it cannot show:

   | Input | Shows | Cannot show |
   |---|---|---|
   | screen design | structure, missing cases, gaps against criteria | contrast, focus, real spacing |
   | mockup | hierarchy, contrast, keyboard order | real data, latency, behavior |
   | built screen | actual behavior, real data | the intent behind it |

   What you could not render, reach or log into is **not run**, never passed.
2. **Walk the tasks first**, start to finish, unhappy paths included; note where you
   hesitated. Task problems do not appear element by element.
3. **Sweep the ten heuristics**: system status · real-world match · user control · consistency
   (with this product's design system and neighbouring screens too) · error prevention ·
   recognition over recall · flexibility · minimalism · error recovery · help.
4. **Accessibility, WCAG 2.2 AA** (or the product's declared level; none → AA, and ask):
   contrast 4.5:1 text, 3:1 controls, computed on real pairs; visible focus not hidden by
   sticky elements; targets ≥ 24×24; an alternative to dragging; errors in text next to their
   cause; name, role and value on every control.
5. **Run `generic.md`'s pass** on what is rendered (a design alone: its plan). A tell with no
   reason is a finding.
6. **Write findings**:

   ```markdown
   ### The rejected coupon message disappears when the field is edited
   - **Severity:** 3 — every customer who mistypes hits it.
   - **Type:** breaks a criterion (US-002 CA-01) → defect.
   - **Where:** checkout, coupon region, rejected state.
   - **Evidence:** walked with an expired code in the mockup.
   ```

   Severity 0–4 by frequency, impact and persistence. Type → destination: breaks a criterion
   → a defect (`nzt-verify`); needs behavior no criterion states → a proposal to the user;
   construction only → fixed in the authorised work; a missing convention → the design
   system. **The review proposes; the spec decides.**

## Measuring an HTML file

Before presenting a mockup, prototype or manual, and every result written down: **320 px with
no horizontal scroll** (render in an iframe, compare `scrollWidth` and `clientWidth`);
**contrast on the real pairs**; **the keyboard order walked**. Not rendered → not verified.

## Done when

The user could act on every finding without asking what to do with it.
