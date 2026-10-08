# Tests that ship with .NET code

## Contents
- Framework and runner: the project's, unchanged
- Layout
- Partitions become rows, not copies
- Time is injected
- Assertions
- Test doubles
- EF Core and persistence — with integration enabled
- APIs — with the in-process level enabled
- Mutation testing
- Closing checklist

What makes a test valuable does not change with the stack; this is **how a .NET project puts it
into practice**. The stack document records the adopted choices, and **the test projects
already in the repository are the evidence in force** for how this project writes a test —
framework, layout, conventions. **Which levels get written is not evidence, it is the
`Test levels` opt-in**, and a project sitting there is not a decision to add to it. Every
section below applies only at the levels that opt-in enabled.

Load `nzt-build-backend-dotnet` and `nzt-build-tests` before applying this: the criteria that
decide what is worth testing, what is substituted and what survives a refactor live there,
and this leaf only says how .NET does it.

## Framework and runner: the project's, unchanged

Use the framework already there — xUnit, MSTest or NUnit — at the version in the manifest.
**Never add a second framework, and never migrate the suite to match an example.** In a new
component, propose one in the plan and record it in the stack; xUnit v3 is a common default.

Some projects run on Microsoft.Testing.Platform instead of VSTest. **Check the test project
before choosing command-line options** (`UseMicrosoftTestingPlatformRunner`,
`EnableMSTestRunner`, `TestingPlatformDotnetTestSupport`): the two runners do not accept the
same arguments, and the flags fail in ways that look like broken tests.

```powershell
dotnet test                                   # whole solution
dotnet test tests/Orders.UnitTests            # one project
dotnet test --filter "FullyQualifiedName~Coupon"
```

## Layout

- `tests/<Component>.UnitTests` and `tests/<Component>.IntegrationTests`, **separate**. The
  unit project references no database provider, no container and no web host — the day it does,
  the fast suite stops being fast and nobody runs it.
- **A project exists because a level is enabled.** With integration off there is no
  `IntegrationTests` project, and nothing of it moves into the unit one: no provider, no
  container, no host. Creating the project "so it is there" adopts the level by the back door.
- Test folders mirror the feature or slice under test, not the class list.
- A test data builder lives next to the tests that use it, and is shared only when several
  features build the same entity.

## Partitions become rows, not copies

```csharp
[Theory]
[InlineData(0, false)]
[InlineData(1, true)]
[InlineData(100, true)]
[InlineData(101, false)]
public void Create_DiscountPercentage_AcceptsOneToHundred(int percentage, bool isValid)
{
    var result = DiscountPercentage.Create(percentage);

    Assert.Equal(isValid, result.IsSuccess);
}
```

MSTest uses `[DataRow]` and NUnit `[TestCase]`; follow the framework in use.

## Time is injected

Code that reads the clock receives `TimeProvider`, registered as `TimeProvider.System` in
production. Tests use `FakeTimeProvider` from `Microsoft.Extensions.TimeProvider.Testing` and
move time with `SetUtcNow` or `Advance`. **No custom clock interface** where the target
framework has `TimeProvider`, and **no mixing real and fake time in one test** — that is the
test that passes all year and fails on one date. When the use case already receives the moment
as a parameter, pass it.

## Assertions

Use the framework's assertions, or the library the stack adopted. Adding one is a dependency
decision (`nzt-build-dependencies`): **FluentAssertions 8 and later require a paid licence for
commercial use**, so it is never added by default. Open-licence alternatives exist —
AwesomeAssertions (Apache 2.0 fork), Shouldly. **Check the licence of the version before
proposing it.**

For the Result pattern: assert `IsSuccess` first, then the payload, or the status and errors the
rule defines. **Compare message text only when the text is the contract.**

## Test doubles

A hand-written fake is often clearer for a small port. Use a mocking library only when the
project already has one or the stack adopts it. **Substitute the interfaces this component owns
in front of out-of-process systems** — payment, mail, bus, third-party APIs — and **never mock
`DbContext`, `DbSet` or this project's repositories**: what comes back then is the test's own
opinion about the ORM.

## EF Core and persistence — with integration enabled

- **Queries, constraints, transactions and migrations are proven in the integration project
  against the production engine.** The engine comes from the opt-in: a disposable container
  where ephemeral containers are enabled, otherwise the test instance the stack names.
- **The EF Core in-memory provider does not test data access.** It does not behave like a
  relational database — Microsoft discourages it — and a suite green against it says nothing
  about constraints, translation or transactions.
- SQLite in-memory is closer, still different, and cannot run provider-specific functions.
- **With integration off, neither of those becomes the fallback.** Data access stays
  uncovered and the report says so: the in-memory provider as a substitute for a level nobody
  enabled is a green suite that proves nothing, and it costs the time it took to write.
- Each test owns its data, or the fixture resets the database between tests.
- **An integration database is disposable and explicitly for tests.** A test never points at a
  shared or production connection.

## APIs — with the in-process level enabled

Endpoints are tested in the integration project with `WebApplicationFactory<TProgram>`:
**replace only unowned external services and keep the real pipeline** — serialisation,
validation, authorisation. Assert the status code, the project's error shape on failure
(`ProblemDetails` with result extensions, the serialised `Result` with a result filter) and the
persisted effect when the endpoint writes.

With that level off, the endpoint keeps its own tests only where the handler holds behavior
worth pinning — and the pipeline itself, binding and error shape included, is uncovered.

## Mutation testing

Stryker.NET mutates the code and reports what no test detected. **Propose it for critical
modules** — pricing, payments, permissions — and record its adoption and thresholds in the
stack. It is slow, and it does not run on every change.

## Closing checklist

- [ ] The `Test levels` opt-in was read, and no project, provider or container was added for a
      level it does not enable.
- [ ] The project's framework, runner and assertion library were used unchanged.
- [ ] Unit and integration tests live in separate projects, and the unit project stayed free of
      provider, container and host.
- [ ] Time comes from `TimeProvider`, faked in tests, never mixed with the real clock.
- [ ] No new assertion or mocking dependency without a stack decision and a licence check.
- [ ] Nothing owned by the project was mocked in place of the real thing.
- [ ] With integration enabled, data access was proven against a real relational engine, never
      the in-memory provider; with it disabled, it was left uncovered and reported, not faked.
- [ ] `dotnet test` was run and **its real result reported**, failures included.
