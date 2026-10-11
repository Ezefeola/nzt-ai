# Writing DTOs in C#

**Read `../nzt-build/references/code-dtos.md` first.** It holds one DTO per operation, the
naming and suffixes, nested DTOs declared inside their parent, and the mapper that transforms
and decides nothing. This file holds only what is C#.

## The shape

**`record` with explicit `get; set;` properties.** Not positional, not `init`, no primary
constructor.

```csharp
public sealed record CreateOrderRequestDto
{
    public string CustomerId { get; set; } = string.Empty;
    public DateOnly DeliveryDate { get; set; }
    public List<OrderLineDto> Lines { get; set; } = [];

    public sealed record OrderLineDto
    {
        public string Sku { get; set; } = string.Empty;
        public int Units { get; set; }
    }
}
```

**A use case never declares its own paging wrapper.** A nested DTO overrides the general C#
member order: properties first.

```csharp
public sealed record OrderSummaryResponseDto
{
    public string OrderId { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public List<OrderLineDto> Lines { get; set; } = [];

    public sealed record OrderLineDto
    {
        public string Sku { get; set; } = string.Empty;
        public int Units { get; set; }
    }
}
```

## Mapping

**Mapping lives in extension methods**, in a file named after the entity —
`OrderMappingExtensions.cs` — in a `static` class, which the compiler already seals.
**The method is named `To<DtoName>`.** **Never a copy of `OrderMappingExtensions` in each
operation folder**: a second class with the same name in another namespace is the sign that it
was copied.

```csharp
public static class OrderMappingExtensions
{
    public static OrderSummaryResponseDto ToOrderSummaryResponseDto(this Order order)
    {
        return new OrderSummaryResponseDto
        {
            OrderId = order.Id,
            Total = order.Total,
            Lines = order.Lines.Select(line => line.ToOrderLineDto()).ToList()
        };
    }
}
```

## Closing checklist

- [ ] Every DTO is a `record` with `get; set;` — not positional, no `init`, no primary
      constructor.
- [ ] Mapping is in `<Entity>MappingExtensions.cs`, `static`, with `To<DtoName>` methods —
      one file per entity, never copied into each operation folder.
