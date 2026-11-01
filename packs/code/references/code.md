# Code — the rules that hold in any language

Project rules, written as prohibitions because a prohibition can be checked. A language pack
adds only what is its own. **In a component this project's `Docs/` does not document, write
the way that code is written** and report the difference: these rules step aside.

## Rules

1. **Everything you write is in English** — types, members, locals, files, folders,
   comments — whatever language the spec uses.
   - A domain term takes the code name `Docs/Domain/glossary.md` gives it. Missing there and
     in the code, it is an entry `nzt-discovery` writes first, never a name coined here.
   - Text the user reads (labels, messages, validation copy) comes from the story, in its
     language, untranslated.
2. **One top-level type per file**, named after it. **A folder never takes a type's name**
   (`Orders/Order`): where folders become namespaces or modules, the two collide.
3. **Members in one order, each group contiguous**: nested types · constants and static
   fields · instance fields · constructors · properties · methods, public before private.
   - **A member added later joins its group** — never beside the method that needed it,
     never appended at the end of the file.
   - The domain model's order wins inside an entity or value object (`nzt-ddd`); a DTO puts
     properties before nested DTOs (`dtos.md`).
4. **Absence is handled, never asserted away.** No operator or cast that tells the checker
   "not null"; where the language checks nullability, zero warnings. A value that cannot be
   absent says so in its type.
5. **Async all the way.** Nothing fire-and-forget: every call is awaited or owned by
   something that observes its failure. Take a cancellation signal wherever the caller can
   give one and pass it to the end. Never block on async work.
6. **No nested if/else**: guard clauses and early return; a match expression where a chain
   would appear.
7. **No magic literals.** A string or number that means something — keys, claims, headers,
   policies, states, routes — gets a name: a constant, an enum, a member of a names type.
8. **Reflection is exceptional**: reading something off an object by reflection is a missing
   abstraction — give the type that surface. A case you are unsure of is asked, never decided
   alone. Reflection a package does for you is not yours.
9. **Comments say why**: a workaround and its cause, an imposed constraint, a decision that
   looks wrong and is not — citing a record that does not move (an ADR, a defect id).
   - A comment explaining *what* is a name to fix instead.
   - **No rule slug, story id or requirement text**: a rule quoted in code is a second
     original that drifts.
   - No commented-out code, change logs, authors or dates. Follow the comment style around
     you, and fix or delete a comment that stops being true in the same unit.

## Done when

Every rule above holds for the code you wrote, and an unsure reflection case was asked.
