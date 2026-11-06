# Tests that ship with .NET code

The test projects already in the repository are the evidence for how a test is written here;
**which levels get written is the `Test levels` opt-in**, and each section applies only at a
level it enabled.

## Rules

1. **The framework already there** (xUnit, MSTest, NUnit) at the manifest's version; a new
   component proposes one in the plan and records it in `tech.md` (xUnit v3 is a common default).
2. **Check the runner before choosing options**: Microsoft.Testing.Platform
   (`UseMicrosoftTestingPlatformRunner`, `EnableMSTestRunner`,
   `TestingPlatformDotnetTestSupport`) and VSTest accept different arguments.
3. **`tests/<Component>.UnitTests` and `tests/<Component>.IntegrationTests`, separate**, each only
   when its level is enabled. The unit project references no provider, container or host.
4. **Partitions are rows** (`[Theory]`/`[InlineData]`, MSTest `[DataRow]`, NUnit `[TestCase]`),
   never copies.
5. **Time is `TimeProvider`** (`TimeProvider.System` in production, `FakeTimeProvider` from
   `Microsoft.Extensions.TimeProvider.Testing` in tests, moved with `SetUtcNow`/`Advance`) — no
   custom clock interface. A moment the use case receives as a parameter is just passed.
6. **An assertion library is a dependency decision** (`nzt-build`'s `references/dependencies.md`):
   FluentAssertions 8+ needs a paid licence for commercial use, so never by default;
   AwesomeAssertions and Shouldly are open. A `Result` asserts `IsSuccess` first.
7. **Never mock `DbContext`, `DbSet` or the project's repositories.**
8. **With integration**: queries, constraints, transactions and migrations run against the
   production engine — a disposable container with ephemeral containers enabled, else the test
   instance `tech.md` names. **Never the EF Core in-memory provider** (not relational,
   discouraged by Microsoft); SQLite in-memory is closer and still different. With integration
   off, data access is reported uncovered — neither becomes the fallback.
9. **With the in-process level**: endpoints through `WebApplicationFactory<TProgram>`, asserting
   the project's error shape. Off, the pipeline is uncovered.
10. **Stryker.NET** is proposed for critical modules (pricing, payments, permissions), with its
    adoption and thresholds recorded in `tech.md`.

```csharp
[Theory]
[InlineData(0, false)]
[InlineData(1, true)]
[InlineData(100, true)]
[InlineData(101, false)]
public void Create_DiscountPercentage_AcceptsOneToHundred(int percentage, bool isValid)
{
    (IReadOnlyList<string> errors, DiscountPercentage? discount) = DiscountPercentage.Create(percentage);

    Assert.Equal(isValid, discount is not null);
}
```

```powershell
dotnet test
dotnet test tests/Orders.UnitTests
dotnet test --filter "FullyQualifiedName~Coupon"
```

## Done when

Every rule holds, and `dotnet test`'s real result is reported.
