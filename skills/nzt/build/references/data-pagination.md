# Data pagination — a page of a listing

Paging is the same three steps in every listing — count, skip, take — so it is written
**once**, as one function over an unexecuted query, and every paginated read calls it.

It runs **two queries**: a count over the query as it arrives — same filters, no paging — and
then the page itself, skipping `(pageNumber - 1) * pageSize` rows and taking `pageSize`.
**If the count comes back zero the second query is not run** and the items come back empty.
**`pageNumber` is 1-based**: page 1 is the first page, there is no page 0.

## The response

A page carries its items and the total. **The total is the total matching the filters, not the
size of the items** — it is what lets a client say how many pages there are.

This generic page type is **the one shared response DTO in the project**: everything else is
one DTO per operation (`code-dtos.md`), and a paginated operation returns a Result of a page of
its response DTO instead of declaring its own paging wrapper.

## Where it goes in the chain

**After the projection.** Filter → order → project to the DTO → paginate. So the page's items
are the response DTO, and both the count and the page are computed over the projected query.

**Never call it on a query that materialised first**: paging over an already-fetched list pays
for every row and then throws most of them away.

## The ordering rule

> **The pagination function does not order. Every paginated query carries its own ordering, and
> the ordering ends in a unique column.**

Nothing enforces this when the code is built — it is on whoever writes the query, and it is the
one mistake that matters here.

Without an order the database may return rows in any order it likes, and skipping and taking
then hands out pages that **overlap and skip rows**: the same record appears on pages 2 and 3
while another is never seen. **With twenty rows in development it looks perfect**, because
small tables tend to come back in insertion order; it breaks in production, intermittently, and
reads like a data problem rather than a query problem.

Ordering by a non-unique column fails the same way at the page boundary: ten orders share a
date and the tie is broken differently on each query. **So the ordering ends in something
unique** — usually the id, as the last key.

## Page and size are validated, not corrected

**The pagination function trusts its arguments.** It does not clamp, default or fix anything.

The limits belong to the operation's validator (`backend-validation.md`), which the operation
runs first: `pageNumber` at least 1, `pageSize` at least 1 and **under a maximum the project
sets**. A request outside those bounds comes back as a failed Result saying so.

That is deliberate: **a `pageSize` of 10000 silently served as 100 leaves the caller believing
it got everything**, and the bug surfaces as missing data somewhere else entirely.

## Cost

Two round trips per page, and on a large table the count is the expensive one — it applies the
whole filter to produce a number nobody reads row by row. That is the accepted trade for being
able to say *page 3 of 47*, and it is why the items query is skipped when the count is zero.

## Closing checklist

- [ ] The query is filtered, **ordered** and projected to its DTO **before** it is paginated.
- [ ] The ordering exists and **ends in a unique column**.
- [ ] `pageNumber` is 1-based, and both values are validated in the operation's validator — the
      function corrects nothing.
- [ ] The operation returns a Result of the shared page type, with no per-feature paging
      wrapper declared.
- [ ] Nothing was materialised before the call.
- [ ] The cancellation was passed.
