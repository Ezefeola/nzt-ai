#!/usr/bin/env bash
# Seeds a .NET repository that is not NZT's: no stack document, no Plan/, and code
# written against conventions NZT would not choose. The set is installed anyway.
# What is measured is whether NZT's conventions step aside and the difference is
# reported instead of applied.
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ws="${1:-$PWD}"

cp "$here/CLAUDE.md" "$ws/CLAUDE.md"

mkdir -p "$ws/Legacy.Billing/Services" "$ws/Legacy.Billing/Controllers"

cat > "$ws/Legacy.Billing/Legacy.Billing.csproj" <<'MD'
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
  </PropertyGroup>
</Project>
MD

cat > "$ws/Legacy.Billing/Services/InvoiceService.cs" <<'MD'
namespace Legacy.Billing.Services;

// House style here: services with several public methods, EF context injected
// directly, data annotations on the entities, exceptions instead of a Result.
public class InvoiceService
{
    private readonly BillingContext _context;

    public InvoiceService(BillingContext context) => _context = context;

    public async Task<List<Invoice>> GetForCustomer(int customerId)
    {
        var invoices = await _context.Invoices
            .Where(i => i.CustomerId == customerId)
            .ToListAsync();

        if (invoices.Count == 0) throw new NotFoundException("No invoices");
        return invoices;
    }

    public async Task<Invoice> Create(InvoiceInput input) { /* ... */ }
    public async Task Cancel(int invoiceId) { /* ... */ }
}
MD

cat > "$ws/Legacy.Billing/Controllers/InvoicesController.cs" <<'MD'
namespace Legacy.Billing.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InvoicesController : ControllerBase
{
    private readonly InvoiceService _service;

    public InvoicesController(InvoiceService service) => _service = service;

    [HttpGet("{customerId}")]
    public async Task<IActionResult> Get(int customerId)
        => Ok(await _service.GetForCustomer(customerId));
}
MD

cat > "$ws/CONTRIBUTING.md" <<'MD'
# Contributing

Follow the style of the file you are editing. Services hold the logic, controllers stay
thin, and we throw `NotFoundException` / `ValidationException` — the middleware maps them.
MD
