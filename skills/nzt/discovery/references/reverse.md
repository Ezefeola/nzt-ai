# Reverse engineering

Produces findings about behavior that exists only in the product — code, content, data —
under `R-NN` in `Plan/specs/<feature>/analysis.md`. The user rules on each; only then does it
become a rule with `origin: reverse (R-NN)`.

**Never declare a business rule.** Write *"the product does X"*, never *"the rule is X"*: the
product does the same thing whether it is a decision or an accident. A comment saying why is
evidence, not authority. Never write a finding for something you have not read.

## Steps

1. **Cut by capability**, never by folder or layer (*applying a coupon at checkout*, not *the
   Services folder*). One per unit.
2. Follow the behavior wherever it goes — entry, validation, storage, jobs — and say where
   you stopped.
3. Write one finding per behavior:

   ```markdown
   ### R-03 · A coupon stops working 30 days after it is created
   - **Behavior:** rejected 30 days after creation, whatever its own expiry date.
   - **Where it is seen:** `CouponValidator.IsUsable`, the check against `CreatedAt`.
   - **When it happens:** every validation, checkout included.
   - **Nothing declares it:** no document, comment or test mentions 30 days.
   - Rule, defect or accident?
   ```

   An unexplained number, limit or timeout is a finding. If something does declare it, say
   so and whether it agrees.
4. Close with **the silent areas** (read, no decisions found) and **what you could not
   determine**, with what would settle it.
5. After the user rules: **rule** → into `spec.md` with `origin: reverse (R-NN)`; **defect** →
   the expected behavior is recorded and it enters the work as a defect; **accident** →
   recorded as such. Unruled findings never graduate.

## Done when

The user could decide this capability's rules using only what you wrote, and nothing you
wrote calls itself a rule.
