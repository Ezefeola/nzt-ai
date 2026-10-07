---
name: nzt-build-tests
description: Use when writing the automated tests that ship with a change: what is worth testing, what is substituted, and what makes a test survive a refactor. Whatever the stack is.
---

# Tests that ship with the code

Produces the automated tests that travel with the change, and the report of what actually
ran. **What makes a test worth keeping does not change with the stack, and that is this
file**; how this project writes one — framework, layout, the clock it injects — is its area
leaf's, which names this one in its load line.

If you did not arrive here from `nzt-build`, load it first.

## The levels are the stack's decision, not yours

**Read the `Test levels` opt-in of the component's stack before writing a single test.** It
answers each level separately — unit, integration against the real engine, ephemeral
containers, in-process API — and **a level it does not enable is not written**, whatever
this file says is good practice.

- **A level not written in the opt-in is disabled, and that includes unit.** A test project
  sitting in the repository is not a decision to write tests. **Say in one line which levels
  are off and what that leaves uncovered, and go on** — this never stops a unit, and it is
  not relitigated inside one.
- **No stack document is not the same as no decision.** The stack is mandatory before a
  component's code is touched, so the missing document is the thing to raise
  (`nzt-architecture-stack`), in the plan, not in passing.
- Adopting a level, or the framework that runs it, is a decision of the stack and a
  dependency decision (`nzt-build-dependencies`). **Never install one in passing.**

## When a change earns tests

Within the levels the stack enabled:

- **Every change that creates or alters behavior.**
- **A defect earns the test that reproduces it**, and that test stays as the regression. A
  fix with no failing test before it is a fix nobody can prove. If the level that would
  catch it is off, say so — that is the cost of the level being off, in that one line.
- **A pure refactor leans on the tests that exist**, and adds coverage only where the
  behavior it touches is unprotected. If it needed new behavior tested, it was not a
  refactor.

## What is tested, and what is not

Behavior observable **through the public surface** of the unit: domain rules, use cases,
validations, calculations, mappings that carry logic, error paths.

Not private methods — they are covered by the public behavior that uses them, and one that
deserves its own tests deserves its own public home. Not trivial code with no logic, not the
framework itself, and never the order of internal calls.

**A unit is a unit of behavior, not a class.** One test may exercise several classes of the
same component when together they produce one behavior.

## What makes a test worth keeping

Four qualities, weighed together: it **protects against regressions**, it **survives a
refactor**, it gives **fast feedback**, and it is **cheap to maintain**. The second one is
not negotiable — a test that breaks when behavior did not change is a false alarm, and a
suite of false alarms stops being read, which costs more than having no suite.

> The question for every assertion: **would this fail if the behavior broke, and only then?**

## What gets substituted

| The dependency | In the test |
|---|---|
| out-of-process and not ours — payments, mail, bus, third-party API | substituted; assert the interaction only when sending **is** the contract |
| our own database | the real engine, in an integration test **where the stack enabled that level** — never a fake of the data access |
| time, randomness, identifiers, culture | injected and controlled |
| in-process collaborators of the same behavior | the real ones |

- **Prefer state over interaction.** Assert the result, or what was persisted — not that a
  method was called. An interaction is asserted only when the effect itself is the contract:
  *the confirmation is sent exactly once*.
- **Never substitute what the project owns** in place of the real thing. What comes back then
  is the test's own opinion about its own code.
- **A level that is off is uncovered, never faked.** With integration disabled, the behavior
  that depends on the database stays untested and is reported as such. Faking the data access
  to get a green unit test is the worst of the three outcomes: the cost of the real engine
  was avoided and a false assurance was bought with it.
- **Call a double by what it does**: a stub supplies data, a mock is asserted on, a fake is a
  working lightweight implementation. A misnamed double misleads the next reader about what
  the test verifies.

## The shape

- **Arrange, Act, Assert, visibly separated, with one Act.** Two Acts are two tests, or one
  parameterized test.
- **The name states the scenario and the expected result**, in the convention the suite
  already uses. Someone reading the list of test names learns the behavior without opening
  the code.
- **Minimal input:** only the values the behavior depends on. A data builder with valid
  defaults lets each test set just the one thing it is about.
- **Readable over dry.** Duplication that keeps a test readable is fine; a helper that hides
  the value the test depends on is not.
- **No logic inside a test:** no conditionals, no loops, no computing the expected value.
  Partitions and boundaries become parameterized cases, not a loop over an array.
- **Named values.** A limit that explains itself beats a bare number nobody can place.
- Failure output shows expected and actual **in the domain's terms**.

## Determinism

The same result on every run, on any machine, in any order.

- Time comes from the injected clock, never from the real one, and the two are never mixed
  in one test.
- Random values and identifiers are fixed or injected.
- Culture and time zone are explicit wherever something is formatted or parsed.
- **Each test creates its own data**, and nothing depends on another test having run first.
- **Wait on an observable condition, never on a fixed sleep.**

## Integration tests, when the stack enabled them

**This whole section applies only where the opt-in enabled the level**, and each level is
separate: proving the database against the real engine, running that engine in an ephemeral
container, and exercising the HTTP pipeline in process are three decisions, not one. What is
off is not built and not approximated.

Where they are on: behavior that depends on the database, serialization, the HTTP pipeline or
configuration is proven against the real piece. They live in **their own project**, so the
fast suite stays fast and free of infrastructure — the day the unit suite needs a container,
nobody runs it.

Each test owns its data, or runs inside a reset strategy. **A shared mutable fixture is how a
suite starts depending on order**, and that failure looks like flakiness for weeks.

**An enabled level that cannot run here is not a skipped level.** No container runtime on this
machine means the tests are written and the report says they could not be executed — that is
an unverified result, not a reason to delete them or to lower them to unit.

## Discipline

- **Watch a new test fail for the right reason** before trusting that it passes. A test that
  never failed proves nothing.
- **Never weaken an assertion, skip a test, or change an expected business result to get a
  pass.** A failing test is diagnosed: either the code is wrong, or the requirement changed —
  and a requirement changes through `nzt-discovery-change`, never here.
- **A flaky test is a defect.** Find the nondeterminism; if it cannot be fixed inside the
  unit, quarantine it **with its cause written down** instead of deleting it, and say so in
  the report.
- **Coverage is an indicator of what was never executed, not a target.** A high number with
  weak assertions protects nothing, and chasing it produces tests written for the number.
- **Mutation testing** measures whether the tests notice a change to the code. For critical
  modules it is proposed with its cost; it is never a default, and it does not run on every
  change.

## Report what ran

The commands and their real results: which tests were added, the failure observed before the
fix when there was one, what could not run, and **the one line naming the levels that are off
and what they leave uncovered**. **Static inspection is not a passing suite**,
and code that compiles is not code that works. Anything with no execution evidence is
reported as not verified, and the criterion's area stays unmarked.

## Where this stops

- **Writing the test first** is a different question — the order, not the value — and it is
  an opt-in of the stack: `nzt-build-tdd`.
- **How this stack does it** — framework, runner, project layout, doubles, the real engine it
  runs against — is the area leaf of the component.
- **The application-level test plan**, its scenarios and its evidence are `nzt-verify`'s. The
  boundary: the tests that travel with the code are this phase's; the ones derived from an
  approved test-plan scenario are not.

## Done when

Rehearse it: would every test you wrote fail if the behavior broke — and only then?

- The `Test levels` opt-in was read, no level was written that it does not enable, and the
  levels that are off were named with what they leave uncovered.
- Every changed behavior has its tests **at the enabled levels**, or the plan says why not.
- The tests go through the public surface and survive a refactor that changes no behavior.
- Only what the project does not own was substituted, and state was preferred to interaction.
- One Act per test, names that state scenario and result, no logic inside.
- Time, randomness and data are controlled; nothing depends on order or on a sleep.
- No assertion was weakened and no test skipped to obtain a pass.
- The results reported come from an execution, and what did not run is named.
