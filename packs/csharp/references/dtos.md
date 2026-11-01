# DTOs in C#

Builds on `../nzt-code/references/dtos.md` — read it first. This file holds only what is C#.

## Rules

1. **A `sealed record` with explicit `{ get; set; }` properties** — never positional, `init` or a
   primary constructor. Nested DTOs are `sealed record`s inside the parent, after its
   properties.
2. **Mapping is extension methods** in `<Entity>MappingExtensions.cs`, a `static` class, with
   `To<DtoName>` methods. A second class of that name in another namespace means it was copied.

```csharp
public sealed record OrderSummaryResponseDto
{
    public string OrderId { get; set; } = string.Empty;
    public List<OrderLineDto> Lines { get; set; } = [];

    public sealed record OrderLineDto
    {
        public string Sku { get; set; } = string.Empty;
        public int Units { get; set; }
    }
}

public static class OrderMappingExtensions
{
    public static OrderSummaryResponseDto ToOrderSummaryResponseDto(this Order order)
    {
        return new OrderSummaryResponseDto
        {
            OrderId = order.Id,
            Lines = order.Lines.Select(line => line.ToOrderLineDto()).ToList()
        };
    }
}
```

## Done when

Every DTO is a `sealed record` with `get; set;`, and each entity has one
`<Entity>MappingExtensions` class.
