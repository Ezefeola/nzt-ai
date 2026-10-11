# Code — the rules that hold in any language

These are **project rules written as prohibitions on purpose**: a prohibition is verifiable
and a preference is not. They hold in every component, backend or frontend, whatever the
language.

**In a foreign component — one this project's `Docs/` does not document — you write the way
that code is written and these rules step aside.** This set is installed globally and will
see repositories that are not its own.

## Everything you write is in English

Type names, members, parameters, locals, files, folders and comments, whatever language the
spec is in. The specs, the glossary and the artifacts in `Plan/` stay in the project's
language: **you are the boundary where the term lands in English code.**

- **The translation is not yours to invent.** `Docs/Domain/glossary.md` carries the code
  name of every domain term; if it is there, that is the name. If it is missing and the code
  has none, it is a glossary entry `nzt-discovery` writes before the code uses it — never a
  name coined here. Two translations of one term are the same term with two names.
- What is not a domain term — a local, a helper, a private method — you name yourself.
- **The one exception is text the user reads**: labels, messages and validation copy come
  from the story, in the story's language, and are never translated.

## Files and types

- **One top-level type per file**, and the file is named after it.
- **A folder name never matches a type name.** For an `Order` type the folder is `Orders`:
  the plural names the group, the singular names the thing, and in a language where the folder
  becomes part of a namespace or a module path the two collide.

## Members in one order, and each group together

Inside a type: **nested types · constants and static fields · instance fields ·
constructors · properties · methods**, public before private, for the kinds the language has.
Each group is contiguous.

**A member added later joins its group.** Declaring it beside the method that uses it, or at
the end of the file because that is where the file ended, scatters a type's state through
its behaviour — and it is the most common way this order breaks, because the member is
usually written in the same edit as the method that needed it. **Adding a member is not
appending to the file.**

The domain model fixes its own order on top of this, and inside an entity or a value object
that one wins (`backend-domain-ddd.md`). DTOs also override this order: **properties first,
then nested DTO declarations**, recursively, as defined in `code-dtos.md`.

## Absence is handled, never asserted away

If a value can be absent, check it and handle it; if it cannot, the type should say so. **An
operator or a cast that tells the checker "this is not null" is forbidden**, and where the
language checks nullability, **zero nullability warnings**: a warning is a null dereference
that has not happened yet.

## Async

- **Nothing is fire-and-forget.** Every asynchronous call is awaited or explicitly owned by
  something that observes its failure.
- **Take a cancellation signal wherever the caller can give one, and pass it down** — to the
  next method, the data access, the HTTP call. A signal that stops halfway is the same as none.
- **Never block on asynchronous work** to get its result synchronously. Always await.
- If what you call is async, your method is async, all the way up.

## Control flow

**No nested if/else.** Guard clauses and early return, and a match expression or pattern
matching where a chain would appear, where the language has them.

Nesting is where the case nobody wrote hides.

## No magic strings, and no magic numbers

A literal that means something gets a name — a constant, an enum, or a member of a type that
groups the names. Keys, claims, headers, policies, states and routes, and numbers that mean
something too.

## Reflection is exceptional

**Reaching for reflection to read something off an object is the symptom of a missing
abstraction.** Give the type the surface the code is asking for.

The cases where reflection is genuinely right are rare, and **you do not decide alone: if
you are not sure yours is one, ask before writing it.** Reflection a package does for you is
not yours.

## Closing checklist

- [ ] Every identifier, file, folder and comment in English, with domain terms taking the
      name `Docs/Domain/glossary.md` gives them.
- [ ] User-facing text in the story's language, as the story wrote it.
- [ ] One top-level type per file, named after it.
- [ ] No folder named after a type.
- [ ] Members in order with each group contiguous, and nothing appended at the end of the
      file; DTOs put properties before nested DTOs, and domain types use their own order.
- [ ] No absence asserted away, and zero nullability warnings where the language checks them.
- [ ] Nothing fire-and-forget, nothing blocking on async work; cancellation taken and
      propagated.
- [ ] No nested if/else, no meaningful literal left unnamed.
- [ ] No hand-written reflection, and a doubtful case was asked rather than decided alone.
