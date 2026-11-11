# Tests that ship with the work

What makes an automated test worth keeping, whatever the technology. How this project writes
one — framework, layout, runner — is `nzt-software`'s, by what `tech.md` declares.

## Steps

1. **Read `tech.md`'s Test levels opt-in** for the component. A level it does not enable is
   not written — unit included. Say in one line which levels are off and what that leaves
   uncovered, and go on. No `tech.md` is raised in the plan (`nzt-architecture`). Adopting a
   level or its framework is a `tech.md` and dependency decision, never done in passing.
2. **Decide what earns tests**, within the enabled levels: every change that creates or
   alters behavior; every defect gets the test that reproduces it, kept as regression; a pure
   refactor leans on existing tests.
3. **Test behavior through the public surface**: rules, operations, validations, calculations,
   mappings with logic, error paths. A unit is a unit of behavior, not a class. Never private
   methods, trivial code, the framework, or the order of internal calls.
4. **Substitute only what the project does not own**:

   | Dependency | In the test |
   |---|---|
   | out-of-process and not ours (payments, mail, third-party APIs) | substituted; interaction asserted only when sending **is** the contract |
   | our own data store | the real engine, where integration is enabled — never a fake |
   | time, randomness, ids, culture | injected and controlled |
   | in-process collaborators of the same behavior | real |

   Prefer state over interaction. **A disabled level is uncovered, never faked.** Name doubles
   by what they do (stub supplies, mock is asserted, fake works). A mocking library only if
   the project has or adopts one.
5. **Write it well**: Arrange-Act-Assert with one Act; the name states scenario and result;
   minimal input via builders with valid defaults; no logic inside; named values; failures in
   domain terms; the suite's framework unchanged; folders mirror the feature.
6. **Make it deterministic**: injected clock, fixed randomness, explicit culture, each test
   owns its data, wait on conditions, never on sleeps.
7. **Integration levels** (each enabled separately — real engine, ephemeral containers,
   in-process API): their own project; the unit project references no data provider,
   container or host. A disposable test-only database, never a shared one. An in-process API
   test keeps the real pipeline and asserts status, error shape and persisted effect. An
   enabled level that cannot run here is written and reported as not executed.
8. **Run them and report** the commands and real results: tests added, the failure seen
   before a fix, what could not run, the levels that are off. Static inspection is not a
   passing suite.

## Discipline

Watch a new test fail before trusting it. Never weaken an assertion, skip a test or change an
expected business result to pass — a changed requirement goes through `nzt-discovery`. A
flaky test is a defect: fix it or quarantine it with its cause written. Coverage shows what
never ran; it is not a target. Mutation testing is proposed for critical modules with its
cost, never a default.

## Done when

Every test you wrote would fail if the behavior broke — and only then — and every result
reported comes from an execution.
