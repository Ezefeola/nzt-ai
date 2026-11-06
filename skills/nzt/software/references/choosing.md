# Choosing a pack's values

What each value of an axis, and each DDD piece, costs. Read it to ask the user the axes of
the packs a component lists — each option's cost as its consequence — and write the value in
`tech.md` exactly as spelled here.

## Backend

| Axis | Value | What it costs |
|---|---|---|
| Architecture | `vertical-slice` | one folder per feature, removed by deleting it; a duplicate between slices is the accepted cheap problem |
| | `clean-architecture` | four layers, every reference inward; one feature touches several units |
| | `hexagonal-architecture` | a core with every contract and one adapter per external system; more units, every dependency isolated |
| Domain model | `ddd` | entities protect their own rules; more modelling up front |
| | `anemic` | entities carry data, use cases the rules; a rule two use cases need is duplicated |
| Persistence | `repositories` | one per aggregate root plus a unit of work; a seam for tests, a layer on every query |
| | `direct` | use cases use the data handle itself; less code, tied to that library |
| Endpoints (`dotnet`) | `minimal-apis` | an endpoint is a function: route, verb and handler in one declaration |
| | `controllers` | a class per feature with attribute routing and the MVC pipeline; more ceremony |
| Result to HTTP (`dotnet`) | `result-extensions` | the `Result` stays inside: the payload on success, `ProblemDetails` on failure |
| | `result-filter` | the `Result` is the response contract, one shape for success and failure |
| ORM (`dotnet`) | `EF Core` (any version) | the context, its migrations and its tooling |

## Frontend

| Axis | Value | What it costs |
|---|---|---|
| Architecture | `vertical-slice` | one folder per feature, with its page and its typed client |
| Render mode (`blazor`) | `server` | a round trip per interaction, every user's state in server memory |
| | `webassembly` | the first visit downloads the runtime; everything in the browser is public |
| | `auto` | fast first visit, then the browser; every component correct in both places |
| | `static` | no interactivity: every change is a request, a form posts the page |
| Component organisation (`blazor`) | `inline` | markup and code in one `.razor` file |
| | `code-behind` | a `.razor` and a `.razor.cs` per component |

## DDD

Each piece is answered `yes` or `no` in `tech.md`.

| Piece | What it costs |
|---|---|
| aggregates | boundaries drawn from rules; loading and saving by root |
| value objects | a type per rule-bearing value, mapped on every store |
| domain events | an event and a handler per reaction between aggregates |
| typed ids | a wrapper per id, converted at every boundary |

## Done when

Every axis of the listed packs, and every DDD piece, has a value in `tech.md` spelled as
here, and the user heard each option's cost.
