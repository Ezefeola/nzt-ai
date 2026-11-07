#!/usr/bin/env bash
# Seeds the project of project.sh with US-012 built and not yet tested: backend and
# frontend marked on every criterion, qa still open, the listing's code in src/, and a
# plan whose next unit is testing it. It is the state verify starts from - without it
# the router's own rule (verify runs after build) makes the agent stop, and the case
# measures that rule instead of the test plan.
#
# The criteria state what a test plan needs to derive its expected results - the
# maximum pageSize, the empty-state message, the tie-break of the ordering - so a run
# is not graded on questions the fixture left open.
#
# Sourced by a case's scaffold.sh. Runs as you, outside the agent's sandbox,
# and only under `claude plugin eval --scaffold`.
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ws="${1:-$PWD}"

bash "$here/project.sh" "$ws"

cat > "$ws/Plan/specs/F-001-pedidos/feature.md" <<'MD'
# F-001 — Pedidos

## Alcance
Alta, listado y confirmación de pedidos.

## Reglas de negocio
- **RN-01.** Un pedido confirmado no se puede modificar.
- **RN-02.** El listado de un cliente muestra primero los más recientes; a igual fecha, el
  número de pedido más alto primero.

## Historias
| ID | Título | Estado |
|---|---|---|
| US-012 | Listado de pedidos por cliente | implementada |
MD

cat > "$ws/Plan/specs/F-001-pedidos/stories/US-012-listado-pedidos.md" <<'MD'
# US-012 — Listado de pedidos por cliente

Como operador quiero ver los pedidos de un cliente para revisar su historial.

## Criterios de aceptación
- **CA-01.** Dado un cliente con pedidos, cuando abro su historial, veo una página de 20
  pedidos ordenados del más reciente al más antiguo. `backend ✓ · frontend ✓ · qa —`
- **CA-02.** Dado un cliente sin pedidos, veo el estado vacío con el mensaje "Este cliente
  todavía no tiene pedidos." `backend ✓ · frontend ✓ · qa —`
- **CA-03.** Dado un `pageSize` mayor a 100, el máximo del proyecto, la operación responde
  con el error de validación. `backend ✓ · frontend ✓ · qa —`

## Reglas que aplica
- RN-02.
MD

cat > "$ws/src/Pedidos.Api/Features/Orders/ListOrdersByCustomer.cs" <<'MD'
namespace Pedidos.Api.Features.Orders;

// US-012 · RN-02
public static class ListOrdersByCustomerEndpoint
{
    public static void Map(IEndpointRouteBuilder app) =>
        app.MapGet("/customers/{customerId:int}/orders", HandleAsync);

    private static async Task<IResult> HandleAsync(
        [FromRoute] int customerId,
        [FromQuery] int page,
        [FromQuery] int pageSize,
        [FromServices] ListOrdersByCustomer useCase,
        CancellationToken cancellationToken)
    {
        var result = await useCase.ExecuteAsync(
            new ListOrdersByCustomerRequestDto(customerId, page, pageSize), cancellationToken);
        return result.ToHttpResult();
    }
}

public sealed record ListOrdersByCustomerRequestDto(int CustomerId, int Page, int PageSize);

public sealed class ListOrdersByCustomerValidator : AbstractValidator<ListOrdersByCustomerRequestDto>
{
    public const int MaxPageSize = 100;

    public ListOrdersByCustomerValidator()
    {
        RuleFor(x => x.Page).GreaterThanOrEqualTo(1);
        RuleFor(x => x.PageSize).InclusiveBetween(1, MaxPageSize);
    }
}

public sealed class ListOrdersByCustomer(IUnitOfWork unitOfWork, ListOrdersByCustomerValidator validator)
{
    public async Task<Result<PagedResponse<OrderSummaryDto>>> ExecuteAsync(
        ListOrdersByCustomerRequestDto request,
        CancellationToken cancellationToken)
    {
        var validation = await validator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
            return Result<PagedResponse<OrderSummaryDto>>.Failure(validation.ToErrors(), 400);

        var page = await unitOfWork.Orders.ListByCustomerAsync(
            request.CustomerId, request.Page, request.PageSize, cancellationToken);
        return Result<PagedResponse<OrderSummaryDto>>.Success(page, 200);
    }
}
MD

# The mappings give the tables and columns, so the data scripts can be written with the
# plan instead of being deferred until someone says what the schema is.
mkdir -p "$ws/src/Pedidos.Api/Persistence/Configurations"

cat > "$ws/src/Pedidos.Api/Persistence/PedidosDbContext.cs" <<'MD'
namespace Pedidos.Api.Persistence;

public sealed class PedidosDbContext(DbContextOptions<PedidosDbContext> options) : DbContext(options)
{
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Order> Orders => Set<Order>();

    protected override void OnModelCreating(ModelBuilder modelBuilder) =>
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(PedidosDbContext).Assembly);
}
MD

cat > "$ws/src/Pedidos.Api/Persistence/Configurations/CustomerConfiguration.cs" <<'MD'
namespace Pedidos.Api.Persistence.Configurations;

public sealed class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.ToTable("customers");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).HasColumnName("id").UseIdentityAlwaysColumn();
        builder.Property(c => c.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
        builder.Property(c => c.Email).HasColumnName("email").HasMaxLength(320).IsRequired();
        builder.HasIndex(c => c.Email).IsUnique();
    }
}
MD

cat > "$ws/src/Pedidos.Api/Persistence/Configurations/OrderConfiguration.cs" <<'MD'
namespace Pedidos.Api.Persistence.Configurations;

public sealed class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("orders");
        builder.HasKey(o => o.Id);
        builder.Property(o => o.Id).HasColumnName("id").UseIdentityAlwaysColumn();
        builder.Property(o => o.Number).HasColumnName("number").IsRequired();
        builder.Property(o => o.CustomerId).HasColumnName("customer_id").IsRequired();
        builder.Property(o => o.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(o => o.Total).HasColumnName("total").HasPrecision(12, 2);
        builder.Property(o => o.Status).HasColumnName("status").HasConversion<string>().HasMaxLength(20);
        builder.HasIndex(o => o.Number).IsUnique();
        builder.HasIndex(o => new { o.CustomerId, o.CreatedAt, o.Number });
        builder.HasOne<Customer>().WithMany().HasForeignKey(o => o.CustomerId);
    }
}
MD

cat > "$ws/src/Pedidos.Web/Features/Orders/CustomerOrders.razor" <<'MD'
@page "/clientes/{CustomerId:int}/pedidos"

<h1>Pedidos del cliente</h1>

@if (_loading)
{
    <p>Cargando pedidos…</p>
}
else if (_error is not null)
{
    <p class="text-danger">@_error</p>
}
else if (_orders.Count == 0)
{
    <p>Este cliente todavía no tiene pedidos.</p>
}
else
{
    <table class="table">
        @foreach (var order in _orders)
        {
            <tr><td>@order.Number</td><td>@order.CreatedAt.ToString("d")</td><td>@order.Total</td></tr>
        }
    </table>
    <button class="btn btn-secondary" disabled="@(!_hasNext)" @onclick="NextPageAsync">Siguiente</button>
}
MD

cat > "$ws/Plan/state.json" <<'JSON'
{
  "version": 1,
  "updated": "2026-09-16T18:00:00Z",
  "goal": "F-001 Pedidos: listado por cliente",
  "phase": "verify",
  "approved": true,
  "units": [
    { "id": 1, "do": "Implementar US-012", "status": "done" },
    { "id": 2, "do": "Probar US-012", "status": "todo" }
  ],
  "waiting_on": null,
  "notes": []
}
JSON
