# Automated regression

**Only where `tech.md` names an end-to-end tool.** An installed tool is not that decision.
Produces automated tests for scenarios already approved and passing.

## Steps

1. **Qualify**: approved, **passed by hand at least once**, no open question in its expected
   result. Never automate to find out whether it passes. Prefer paths carrying money,
   permissions, data loss, and defects already found once.
2. **Write it** like running by hand: locate by role and accessible name, wait on observable
   conditions, port the scenario's setup and teardown into the test's own hooks (no second
   seeding path, no dependence on other tests), assert the plan's expected result.
3. **When one fails, diagnose before touching it**:

   | Diagnosis | Do |
   |---|---|
   | product regression | open a defect; the test is right |
   | broken test (locator, timing) | fix the test; the expectation stays |
   | outdated scenario | the spec changes first, then the test |
   | flaky | quarantine with its cause written, fix the cause |

   **Never change the expected result to get green.** Self-healing tooling: accept locator
   fixes, reject anything that changes what is asserted.
4. Keep it honest: an unexplained failure is unverified, not "known"; a removed scenario takes
   its test along; the testing index says what is automated.

## Done when

Each test would fail if, and only if, the behavior it protects broke.
