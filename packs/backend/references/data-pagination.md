# Data pagination — a page of a listing

Paging is written **once**, as one function over an unexecuted query, and every paginated read
calls it. Read with `data-queries.md`.

## The function

1. **Two queries**: a count over the query as it arrives (same filters, no paging), then the
   page — skip `(pageNumber - 1) * pageSize`, take `pageSize`. **A zero count skips the
   second query.** `pageNumber` is 1-based.
2. **It returns the shared page type** — items and the total matching the filters (not the
   items' size). It is the one shared response DTO (`nzt-code`'s `dtos.md`): an operation
   returns a Result of a page of its own DTO, never its own wrapper.
3. **It trusts its arguments** — no clamping or defaults. The operation's validator enforces
   `pageNumber ≥ 1`, `pageSize ≥ 1` and under the project's maximum, failing as a Result: a
   `pageSize` of 10000 silently served as 100 makes the caller believe it got everything.

## Rules

1. **Filter → order → project → paginate.** Never paginate a materialised list.
2. **Every paginated query carries its own ordering, ending in a unique column** (usually the
   id, last). Without it pages overlap and skip rows — invisible on twenty rows in
   development, intermittent in production. A non-unique order fails the same way at page
   boundaries. Nothing enforces this but you.
3. The count is the expensive round trip — the accepted price of *page 3 of 47*.

## Done when

Every paginated query is ordered by something ending in a unique column, projected before
paging, validated by its operation, and returns the shared page type.
