# Do the documents still tell the truth

Produces a verdict per claim in the agreed cut, what was found consistent, and what could not
be checked. Corrects nothing on its own. **The measure is always a claim some document makes,
never your opinion.**

## Steps

1. **Document → product**: take each claim in the cut and check it still holds. Structure is
   in scope: `tech.md` saying `Architecture: vertical-slice` is a measurable claim.
2. **Product → document**: read what the product does and ask *if decided today, would this
   be in a document?* Yes and none carries it → the product moved ahead of what was approved.
3. **Write verdicts**:

   ```text
   Document: Docs/Architecture/tech.md — Pedidos.Api · Persistence: repositories
   The work: 4 of 11 features inject the data context into the endpoint
   Verdict:  the document no longer matches

   Document: none
   The work: payments are retried with backoff — Payments/Retry.cs:22
   Verdict:  the product moved ahead — no document declares it

   Checked and consistent: the glossary, the domain model, the other 7 features
   Could not check: whether the retry limit is configured in the deployed environment
   ```

   Verdicts: *no longer matches* (which side is wrong is not implied), *moved ahead*,
   *consistent* — reported too. What cannot be checked is listed apart, never as consistent.
4. **Say which correction the evidence supports**: update the document or roll back the
   product. The choice is the user's; a material change goes back to its phase.

Not here: a defect with no document behind it (`review.md`), a structure that matches its
document but costs too much (`nzt-architecture`'s review), a criterion never verified (unfinished
work).

## Done when

The user could decide, per verdict, whether to fix the document or the product, and see what
you did not look at.
