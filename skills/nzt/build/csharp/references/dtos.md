# Writing DTOs

## Contents
- The shape
- One DTO per use case, and they are never shared
- The name says what it is for; the suffix says what it is
- A DTO that belongs to another is declared inside it
- Mapping
- Closing checklist

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

## One DTO per use case, and they are never shared

Two use cases that need the same fields today will not need them tomorrow, and **the shared
DTO is where the field only one of them uses ends up** — *"I added it for the other
endpoint"*. A DTO belongs to its use case and changes with it.

**One exception, and it is generic**: the paged wrapper every paginated read returns. It
carries no field of any feature, only the page and the total, so it has nothing to grow
into. **A use case never declares its own paging wrapper.**

## The name says what it is for; the suffix says what it is

**A top-level DTO ends in `RequestDto` or `ResponseDto`; a nested DTO ends in `Dto`.**

For a top-level DTO, the name describes **the purpose, not the shape**: `CreateOrderRequestDto`,
`OrderSummaryResponseDto`. `OrderDto` or `DataDto` says nothing about which use case it
serves, which is the only thing the reader needs.

## A DTO that belongs to another is declared inside it

A line, a nested object, a collection item — **that type is declared inside the parent**, not
in its own file and not beside it. **Properties come first; nested DTO declarations follow**,
recursively. This overrides the general C# member order for DTOs.

**Each parent declares its own children, even when their fields match another parent's.**
Do not extract a child to the feature root, a `Dtos` or `Shared` folder, or another parent
just to avoid repeated properties. The generic paging wrapper remains the only exception;
its item DTO belongs to the use case and is never shared between use cases.

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
the parent changes. **Do not reuse it from another parent or use case**: nesting expresses
ownership; the convention forbids sharing.

**A nested DTO drops the `Request`/`Response` half and keeps `Dto`.** The parent already said
which of the two it is. Name the child after the concept it represents, without repeating
the operation or collection role: `ListApplicationsResponseDto.ApplicationDto`, not
`ApplicationListItemDto` or `ListApplicationsApplicationDto`. Request and response parents
may each have their own `ApplicationDto`; matching fields do not make it a shared contract.

## Mapping

**Mapping lives in extension methods**, in a file named after the entity —
`OrderMappingExtensions.cs` — in a `static` class, which the compiler already seals.
**The method is named `To<DtoName>`**, after the DTO it produces.

**One file per entity, holding the mapping to every use case's DTOs.** The DTOs are not
shared, but their mapper is: **never a copy of `OrderMappingExtensions` in each operation
folder**, and never a mapper per use case. A second class with the same name in another
namespace is the sign that it was copied.

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
- [ ] Top-level DTOs end in `RequestDto` or `ResponseDto`; nested DTOs end in `Dto`.
- [ ] Top-level names express the use case; child names express the concept, without its
      operation or collection role.
- [ ] Each parent owns its child DTOs, even with repeated fields; none are extracted to a
      feature root or shared folder. Only the generic paging wrapper is shared.
- [ ] Properties precede nested DTO declarations at every nesting level.
- [ ] Every DTO belonging to another is declared inside it, ending in `Dto` without
      repeating `Request`/`Response`.
- [ ] Mapping is in `<Entity>MappingExtensions.cs`, `static`, with `To<DtoName>` methods —
      one file per entity, never copied into each operation folder.
- [ ] No mapper decides HTTP or `Result`, validates, or throws for a business reason.
