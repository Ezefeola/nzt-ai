# Test-first

**This applies only where the stack document selected it.** An absent field does not enable
it, and the existence of tests in the repository is not a decision to work this way. If the
stack does not say test-first, build the story with `nzt-build-implement` and write the
tests that ship with the code.

**This leaf decides the order, never the value.** What is worth testing, what gets
substituted and what makes a test survive a refactor is `nzt-build-tests`, and it holds
whether the test comes first or last.

## The cycle

One behavior at a time:

1. **Write the test for the next criterion**, with the concrete data the criterion gives
   you.
2. **Run it and watch it fail** — and read the failure. It has to fail because the behavior
   is missing, not because a name is wrong or the setup threw.
3. **Write the least code that makes it pass.**
4. **Refactor with the test green**, structure only.
5. Next behavior.

**A test that never failed proves nothing.** It may be asserting something that was already
true, or nothing at all; you cannot tell the difference afterwards. Step 2 is the step that
makes the rest worth doing.

Do not write five tests and then the code. Batched tests lose the feedback the cycle
exists for, and they all pass at the end without any of them having been watched.

## What is written this way

- Business rules, calculations, state transitions, validation of the rules — anything with
  a decision in it, and anything the spec states as a criterion.
- **Not** wiring, configuration, mappings with no logic, or generated code. A test written
  first for glue buys nothing and gets deleted by whoever changes the glue.
- Not the framework's behavior. Testing that the framework routes a request tests the
  framework.

## The test comes from the criterion

- One criterion, one test, with **its** data: the amounts, dates and codes the story wrote,
  not invented ones. The criterion is already the specification of the test.
- Name the test after the behavior it pins: *an expired coupon leaves the total untouched*,
  not *TestCouponValidator2*.
- One behavior per test. A test with three assertions about three things fails as one
  thing and tells you the least useful half of the story.
- The unhappy path is a criterion too, and it gets its test first like any other.

## When it does not pass

- **Do not change the expectation to make it green.** If the expected result looks wrong,
  the question is about the criterion, and it goes back to the spec — not into the
  assertion.
- If the test is hard to write, that is information about the design, not a reason to skip
  it. Say what made it hard.
- A test you cannot make fail first — because the behavior already exists — is not a
  test-first test. Keep it as a covering test and say so.

## Closing

The same close as any build unit: what is affected compiles, the tests have been **run**,
the area is marked only on criteria whose tests pass, and what they cannot reach is named
as not covered until QA.

## Done when

Rehearse it: for every behavior you added, was there a moment when its test failed for the
right reason?

- Every criterion you covered has a test that was watched failing first.
- No test asserts more than one behavior.
- The data in the tests is the data the criteria gave.
- Nothing structural was left un-refactored with the tests green.
- No expectation was edited to make a test pass.
