# Test-first

**Only where `tech.md`'s Test-first opt-in selected it.** Existing tests are not that
decision. This decides the order, never the value: what is worth testing is `tests.md`.

## The cycle — one behavior at a time

1. Write the test for the next criterion, with **the data the criterion gives**.
2. **Run it and watch it fail for the right reason** — the behavior is missing, not a typo or
   a broken setup. A test that never failed proves nothing.
3. Write the least work that makes it pass.
4. Refactor with the test green.
5. Next behavior. Never five tests and then the code.

## What goes test-first

Rules, calculations, state transitions, validations — anything with a decision or stated as a
criterion, unhappy paths included. Not wiring, configuration, logic-free mappings, generated
code, or the framework's own behavior.

## When it does not pass

Never change the expectation to make it green: an expected result that looks wrong is a
question about the criterion. A test that is hard to write is information about the design —
say what made it hard. One that cannot fail first (the behavior exists) is a covering test;
say so.

## Done when

Every behavior you added had a moment when its test failed for the right reason, and
`implement.md`'s *Done when* holds.
