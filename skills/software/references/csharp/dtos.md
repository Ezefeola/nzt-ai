# DTOs in C#

## Rules

1. **A DTO is a `sealed record`**, nested DTOs too.
2. **Properties are `{ get; set; }`**, never `init`.
3. **Properties declared in the body**, never positional.
4. **Mapping is a `static class <Entity>MappingExtensions`** with `To<DtoName>` extension
   methods. Two classes of that name in different namespaces means one was copied.

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

Every rule holds for the DTOs and mappers you wrote.
