---
name: nzt-build-csharp-dtos
description: Use when writing or changing a C# DTO or its mapping extensions - the DTOs every .NET use case returns and every typed frontend client sends, their shape, their name and what a mapper may never decide.
---

# Writing DTOs

Load `nzt-build-csharp` before applying this.

## The shape

**`record` with explicit `get; set;` properties.** Not positional, not `init`, no primary
constructor.

```csharp
public sealed record CreateOrderRequestDto
{
    public string CustomerId { get; set; } = string.Empty;
    public DateOnly DeliveryDate { get; set; }
    public List<OrderLineRequestDto> Lines { get; set; } = [];
}
```

## One DTO per use case, and they are never shared

Two use cases that need the same fields today will not need them tomorrow, and **the shared
DTO is where the field only one of them uses ends up** — *"I added it for the other
endpoint"*. A DTO belongs to its use case and changes with it.

**One exception, and it is generic**: the paged wrapper every paginated read returns. It
carries no field of any feature, only the page and the total, so it has nothing to grow
into. **A use case never declares its own paging wrapper.**

## The name says what it is for; the suffix says what it is

**The suffix is mandatory: `RequestDto` or `ResponseDto`.** No other suffix, and never none.

The rest of the name describes **the purpose, not the shape**: `CreateOrderRequestDto`,
`OrderSummaryResponseDto`. `OrderDto` or `DataDto` says nothing about which use case it
serves, which is the only thing the reader needs.

## A DTO that belongs to another is declared inside it

A line, a nested object, a collection item — **that type is declared inside the parent**, not
in its own file and not beside it.

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

It is reached as `OrderSummaryResponseDto.OrderLineDto`, **and that is the point**: the
nested type has no life of its own. It exists because the parent needs it and changes when
the parent changes, and **nesting is what makes it impossible to reuse somewhere else by
accident** — the same rule as *one DTO per use case*, one level down.

**A nested DTO drops the `Request`/`Response` half and keeps `Dto`.** The parent already said
which of the two it is.

## Mapping

**Mapping lives in extension methods**, in a file named after the entity —
`OrderMappingExtensions.cs` — in a `static` class, which the compiler already seals.
**The method is named `To<DtoName>`**, after the DTO it produces.

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

**A mapper transforms data and nothing else.** It decides no HTTP — no status codes, no
headers, no *"if it is null return 404"* — and no `Result` behaviour: it does not wrap in
success or failure, does not validate, and does not throw for a business reason.

| It does not decide | Who does |
|---|---|
| Status codes, headers, what a missing row returns | The endpoint |
| Success or failure, validation, business errors | The use case |
| Where the file lives | The architecture skill the stack selected |

**A mapper that takes one of those decisions is a decision hidden where nobody looks for
it.** What is decided here is the mapper's name and what goes inside it.

## Closing checklist

- [ ] Every DTO is a `record` with `get; set;` — not positional, no `init`, no primary
      constructor.
- [ ] The suffix is `RequestDto` or `ResponseDto`, and no DTO is without one.
- [ ] The name describes what it is for, not the entity it resembles.
- [ ] No DTO is reused by two use cases.
- [ ] Every DTO belonging to another is declared inside it, ending in `Dto` without
      repeating `Request`/`Response`.
- [ ] Mapping is in `<Entity>MappingExtensions.cs`, `static`, with `To<DtoName>` methods.
- [ ] No mapper decides HTTP or `Result`, validates, or throws for a business reason.
