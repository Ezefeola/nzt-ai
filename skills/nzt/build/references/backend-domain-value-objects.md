# Backend domain — value objects

## Contents
- When something earns one
- How it is written
- Where they live in the model
- Where the file goes
- Closing checklist

A value object is **a value that has rules**: an email, an amount with its currency, a date
range, a tax id. It has no identity and no life of its own — **two with the same content are
the same thing.**

Only in projects whose domain axis is DDD **and whose stack says *value objects yes*** in its
DDD line. Without it, none is written. How it is stored belongs to the data mapping guidance.

## When something earns one

Two questions:

1. **Does the value have rules that must hold everywhere it appears?** An email that has to be
   well formed, a range whose end cannot precede its start, an amount that cannot be negative.
2. **Do two of them with the same content mean the same thing?** If yes, it is a value. If it
   needs to be told apart from an identical one, it is an entity.

**What does not earn one**: a plain string with no rule, or a value whose only rule is
*required* — that one is the validator's job, once, at the entry point.

What it buys is that **the rule is checked in one place and cannot be skipped**. A plain
string email is validated wherever someone remembers to; an `Email` is valid because it
exists.

## How it is written

**Immutable, equal by content, with one creation entry that validates first** — the same
shape, and the same order, as an aggregate (`backend-domain-ddd.md`).

- **Equality by value is the whole point**: two `DateRange` with the same dates compare equal,
  through what the language gives value types, not through a comparison written by hand.
- **One place assigns the values, and that place is the creation entry**, by name.
- **Never settable afterwards.** A value object is never modified — **changing it is creating
  another one** and assigning it.
- **No public way to build it and no creation entry that skips validation**, or an invalid
  instance exists and the type stops being a guarantee.
- **Members in one order**: what closes it, `Rules` and `Errors` if it has them, every
  property together, the creation entry, then its behaviour. A property added later joins
  the properties.

The caller **checks the value**, never the error list.

## Where they live in the model

A value object is **a property of an entity**, and it may hold others. It is not loaded on its
own, not queried on its own, and has no id.

Behaviour about the value goes **inside** it — `range.Overlaps(other)`, `money.Add(other)` —
returning new values, never mutating. That behaviour is the reason the concept exists rather
than being three loose fields.

**They do not cross to the outside**: a DTO carries the plain fields and the conversion
happens at the edge of the use case. **Exposing a value object in a contract makes an internal
decision part of the API.**

## Where the file goes

Decided by **how many aggregates use it**: inside the aggregate's folder, under
`ValueObjects/`, when only that aggregate uses it; under `Common/ValueObjects/` when more than
one does.

**The folder is `ValueObjects/`, plural, always** — a folder named after a type collides with
it.

Where the domain's root sits is the architecture reference's business; what is fixed here is
the shape inside it. And a value object **moves to the shared folder the moment a second
aggregate uses it** — it is never copied.

## Closing checklist

- [ ] It has rules of its own and equality by content — otherwise it is an entity or a plain
      field.
- [ ] It lives in a `ValueObjects/` folder: inside its aggregate if only that one uses it, in
      the shared area if more than one does.
- [ ] Immutable: modifying means creating another.
- [ ] One creation entry that validates first, and no other way in.
- [ ] Members in order, with every property together.
- [ ] The caller checks the value, not the error list.
- [ ] Its behaviour lives inside it and returns new values.
- [ ] It has no id, is not queried on its own, and does not appear in a DTO.
