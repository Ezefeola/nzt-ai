# DTOs — the data that crosses a boundary

A DTO is properties and nothing else.

## Rules

1. **One DTO per operation, never shared**: two operations alike today diverge tomorrow.
   Only exception: the generic paged wrapper (page and total, no feature field), which no
   operation declares its own copy of.
2. **Suffixes**: a top-level DTO ends in `RequestDto` or `ResponseDto`, a nested one in `Dto`.
3. **A top-level name says the purpose** (`CreateOrderRequestDto`), never the shape
   (`OrderDto`, `DataDto`).
4. **A child DTO is declared inside its parent** (in the parent's file where the language
   does not nest types) and reached through it: `OrderSummaryResponseDto.OrderLineDto`.
   - Properties first, nested declarations after, at every level.
   - Each parent declares its own children, even when fields match another's: never in a
     `Dtos`/`Shared` folder, the feature root or another parent.
   - The child is named after its concept: `ApplicationDto`, not `ApplicationListItemDto`.
5. **One mapping file per entity**, named after it, with one `To<DtoName>` per DTO. Never a
   mapper per operation or a copy per folder.
6. **A mapper only transforms data**:

   | It never decides | Who does |
   |---|---|
   | status codes, headers, what a missing row returns | the endpoint |
   | success or failure, validation, business errors | the use case |
   | where the file lives | the architecture in `tech.md` |

## Done when

Every rule holds for the DTOs and mappers you wrote.
