# Data pagination — a page of a listing

Paging is written **once**, as one function over an unexecuted query, and every paginated
read calls it.

## The function

1. **Count first** over the query as it arrives (same filters, no paging). **A zero count
   skips the second query.** The count is the accepted price of *page 3 of 47*.
2. **Then the page**: skip `(pageNumber - 1) * pageSize`, take `pageSize`; `pageNumber` is
   1-based.
3. **It returns the shared page type**: the items and the total matching the filters (not the
   items' size). It is the one shared DTO (`references/code/dtos.md`).
4. **It trusts its arguments**: no clamping, no defaults.

## Rules

1. **The operation's validator enforces** `pageNumber ≥ 1`, `pageSize ≥ 1` and under the
   project's maximum, failing as a Result: a `pageSize` of 10000 served as 100 makes the
   caller believe it got everything.
2. **Filter → order → project → paginate.** Never paginate a materialised list.
3. **Every paginated query carries its own ordering, ending in a unique column** (usually the
   id, last): otherwise pages overlap and skip rows, intermittently and only on real data.

## Done when

Every rule holds for the paginated reads you wrote.
