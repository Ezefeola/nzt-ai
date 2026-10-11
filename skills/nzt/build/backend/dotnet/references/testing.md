# Tests that ship with .NET code

## Contents
- Framework and runner
- Layout
- Partitions become rows, not copies
- Time is injected
- Assertions
- Test doubles
- EF Core and persistence — with integration enabled
- APIs — with the in-process level enabled
- Mutation testing
- Closing checklist

**Read `../nzt-build/references/tests.md` first.** It holds what makes a test valuable, the
levels as the stack's opt-in, what is substituted, the shape, determinism and integration;
this is **how a .NET project puts it into practice**. The stack document records the adopted
choices, and **the test projects already in the repository are the evidence in force** for
how this project writes a test. **Which levels get written is not evidence, it is the
`Test levels` opt-in**, and every section below applies only at the levels it enabled.

## Framework and runner

Use the framework already there — xUnit, MSTest or NUnit — at the version in the manifest. In
a new component, propose one in the plan and record it in the stack; xUnit v3 is a common
default.

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

- `tests/<Component>.UnitTests` and `tests/<Component>.IntegrationTests`, separate.
- **A project exists because a level is enabled.** With integration off there is no
  `IntegrationTests` project, and nothing of it moves into the unit one: no provider, no
  container, no host. Creating the project "so it is there" adopts the level by the back door.

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
framework has `TimeProvider`. When the use case already receives the moment as a parameter,
pass it.

## Assertions

Adding a library is a dependency decision (`nzt-build-dependencies`): **FluentAssertions 8 and
later require a paid licence for commercial use**, so it is never added by default.
Open-licence alternatives exist — AwesomeAssertions (Apache 2.0 fork), Shouldly.

For the Result pattern: assert `IsSuccess` first, then the payload, or the status and errors the
rule defines.

## Test doubles

**Never mock `DbContext`, `DbSet` or this project's repositories**: what comes back then is the
test's own opinion about the ORM.

## EF Core and persistence — with integration enabled

- **Queries, constraints, transactions and migrations are proven in the integration project
  against the production engine.** The engine comes from the opt-in: a disposable container
  where ephemeral containers are enabled, otherwise the test instance the stack names.
- **The EF Core in-memory provider does not test data access.** It does not behave like a
  relational database — Microsoft discourages it — and a suite green against it says nothing
  about constraints, translation or transactions.
- SQLite in-memory is closer, still different, and cannot run provider-specific functions.
- **With integration off, neither of those becomes the fallback.** Data access stays
  uncovered and the report says so.

## APIs — with the in-process level enabled

Endpoints are tested in the integration project with `WebApplicationFactory<TProgram>`. The
project's error shape on failure is `ProblemDetails` with result extensions, the serialised
`Result` with a result filter.

With that level off, the endpoint keeps its own tests only where the handler holds behavior
worth pinning — and the pipeline itself, binding and error shape included, is uncovered.

## Mutation testing

Stryker.NET mutates the code and reports what no test detected. **Propose it for critical
modules** — pricing, payments, permissions — and record its adoption and thresholds in the
stack.

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
