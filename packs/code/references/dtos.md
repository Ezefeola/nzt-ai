# DTOs — the data that crosses a boundary

A DTO is plain data: properties and nothing else. The language's construct for it is the
language pack's.

## Rules

1. **One DTO per operation, never shared.** Two operations that need the same fields today
   diverge tomorrow, and a shared DTO collects the field only one uses. **The one exception**
   is the generic paged wrapper (page and total, no feature field); an operation never
   declares its own.
2. **Suffixes**: a top-level DTO ends in `RequestDto` or `ResponseDto`, a nested one in
   `Dto`. A top-level name says the purpose — `CreateOrderRequestDto`,
   `OrderSummaryResponseDto` — never the shape (`OrderDto`, `DataDto`).
3. **A DTO that belongs to another is declared inside it** — inside the parent where the
   language nests types, else in the parent's file with the parent's name. Reached through
   the parent (`OrderSummaryResponseDto.OrderLineDto`).
   - **Properties first, nested declarations after**, at every level.
   - **Each parent declares its own children**, even with fields matching another's: never
     extracted to a feature root, a `Dtos`/`Shared` folder or another parent.
   - The child is named after its concept, without the operation or collection role:
     `ListApplicationsResponseDto.ApplicationDto`, not `ApplicationListItemDto`.
4. **Mapping: one file per entity**, named after it, with one `To<DtoName>` function per DTO
   produced. Never a mapper per operation, never a copy in each operation folder.
5. **A mapper transforms data and nothing else**:

   | It never decides | Who does |
   |---|---|
   | status codes, headers, what a missing row returns | the endpoint |
   | success or failure, validation, business errors | the use case |
   | where the file lives | the architecture in `tech.md` |

## Done when

Every DTO belongs to one operation with the right suffix, every child lives in its parent,
every entity has one mapper, and no mapper takes a decision from the table.
