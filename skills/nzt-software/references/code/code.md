# Code — the rules that hold in any language

Written as prohibitions so each one can be checked.

## Rules

1. **Code is in English** — types, members, locals, files, folders, comments — whatever
   language the spec uses.
   - A domain term uses its code name in `Docs/Domain/glossary.md`.
   - Text the user reads comes from the story, in its language, untranslated.
2. **One top-level type per file**, named after it.
3. **A folder never takes a type's name** (`Orders/Order`): where folders are namespaces,
   the two collide.
4. **Members in this order, each group contiguous**: nested types · constants and static
   fields · instance fields · constructors · properties · methods; public before private.
   - A member added later joins its group, never the end of the file.
   - Exceptions: the domain model's order (`references/ddd/ddd.md`) and the DTO's (`dtos.md`).
5. **Never assert absence away**: no operator or cast that says "not null", zero
   nullability warnings. A value that cannot be absent says so in its type.
6. **Async all the way**: every call awaited or owned by something that observes its
   failure; never block on async work.
7. **Take a cancellation signal** wherever the caller can give one, and pass it to the end.
8. **No nested if/else**: guard clauses and early return; a match expression instead of a
   chain.
9. **No magic literals**: a key, claim, header, policy, state or route is a named constant,
   enum or member.
10. **Reflection over your own objects is a missing abstraction**: give the type that surface.
    Reflection a package does is not yours. Unsure → ask.
11. **Comments say why** — a workaround and its cause, an imposed constraint, a decision that
    looks wrong — citing a record that does not move (an ADR, a defect id).
    - A comment that says *what* is a name to fix.
    - Never a rule slug, story id or requirement text: a copy in code drifts from the original.
    - Never commented-out code, change logs, authors or dates.
    - Follow the comment style around you; a comment that stops being true is fixed or
      deleted in the same unit.

## Done when

Every rule holds for the code you wrote.
