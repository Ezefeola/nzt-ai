# Backend validation — an operation's input

`<Operation>Validator` (`CreateOrderValidator`), in its own file. The use case runs it
(`use-cases.md`). **A frontend check never replaces it.**

## Rules

1. **The mechanism is `tech.md`'s**: an adopted validation library, or by hand.
2. **A validator never asks the database**: uniqueness, existence and permissions are the
   use case's.
3. **It invents no limit and no message**: an entity concept reads its constant and message
   from the entity; an input only this operation has, from the agreed contract. A missing
   rule is asked.
4. **An enum accepts the contract's values**, not every number the type holds.
5. **Absent, null, empty and whitespace are different** when the contract says so. A default
   is not evidence the caller sent the field; a valid zero, `false` or empty value is kept.
6. **Every nested object and every element is validated**, a null parent or element handled
   first.
7. **Cross-field rules only when the input alone answers them.**
8. **Normalise only as the contract defines**, with the same representation for validation and
   what follows. Never trim, change case, clamp, drop elements or substitute defaults to make
   validation pass.
9. **Test**: a valid input, both sides of every limit, the absence distinctions, invalid nested
   fields and elements, normalisation; a rejected input causes no write, no external call and
   no state query.

## Done when

Every rule holds, and the tests ran or their limits are said.
