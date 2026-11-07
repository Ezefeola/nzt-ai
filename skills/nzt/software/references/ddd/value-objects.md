# Value objects in code

**A value that has rules** — an email, an amount with its currency, a date range. No identity:
two with the same content are the same thing. **Only with *value objects yes*** in `tech.md`'s
DDD line. Storage is the data access files'.

## Rules

1. **It earns one** when the value has rules that must hold everywhere it appears **and** two
   with the same content mean the same thing (otherwise it is an entity). A plain string, or a
   value whose only rule is *required*, earns none.
2. **Immutable, equal by content** through what the language gives value types, never a
   hand-written comparison. Changing it is creating another.
3. **Created like an entity** (`ddd.md`): the same layout, one entry that validates first, the
   caller checking the value; no other way in.
4. **A property of an entity** (it may hold others): never loaded, queried or identified on its
   own. Behaviour about the value lives inside it (`range.Overlaps(other)`) and returns new
   values.
5. **It never crosses the boundary**: DTOs carry plain fields, converted at the edge of the use
   case — a value object in a contract makes an internal decision part of the API.
6. **Its folder is `ValueObjects/`**, inside its aggregate's folder while one aggregate uses it,
   in `Common/ValueObjects/` from the moment a second does — moved, never copied.

## Done when

Every rule holds for the value objects you wrote.
