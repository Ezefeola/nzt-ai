# EF Core — what holds for every operation

## Rules

1. **Tracking stays EF's default; `AsNoTracking()` is written** on every query that
   materialises entities only to read them:

   | The query | Tracking |
   |---|---|
   | shows or exports entities | `AsNoTracking()` |
   | projects to a DTO, counts, checks existence, aggregates | nothing: no entity comes out |
   | projects through a client-side method that receives the entity | pass the columns instead, or `AsNoTracking()` |
   | reads to modify and save | nothing: tracking persists the change |

2. **Never no-tracking globally**: an unmarked update would silently not save.
3. **The `DbContext` is registered scoped.**
4. **No lazy-loading proxies.**

## Done when

Every rule holds for the queries you wrote.
