# Backend validation — an operation's input

`<Operation>Validator` (`CreateOrderValidator`), in its own file. The use case runs it before
anything else and turns its failure into a failed Result; orchestration and status are the use
case's. **A frontend check never replaces it**: the operation boundary is the one every caller
crosses.

## Rules

1. **The mechanism is `tech.md`'s**: a validation library the project adopted, or by hand. A
   hand-written validator has no dependencies, so it never asks the database — uniqueness,
   existence and permissions are the use case's.
2. **It invents no limit and no message.** An entity concept reads its constant and message
   from the entity; an input only this operation has comes from the agreed contract. A
   missing material rule is asked, never imposed. An enum accepts the contract's values, not
   every number the type holds.
3. **Absent, null, empty and whitespace are different** when the contract says so; a default
   is never evidence the caller sent the field. A valid zero, `false` or empty value is kept.
4. **Every nested object and every element is validated**, with a null parent or element
   handled first: a valid count does not make the elements valid. Cross-field rules only
   when the input alone answers them.
5. **Normalise only as the contract defines**, using the same representation for validation
   and what follows. Never trim, change case, clamp, drop elements or substitute defaults to
   make validation pass — that hides invalid input.
6. **Verify**: a valid input, both sides of every limit, the absence distinctions, invalid
   nested fields and elements, normalisation; rejected input fails with no write, no external
   call and no state query. Inspection is not an executed test.

## Done when

Every rule and message traces to the entity or the contract, elements are validated one by
one, nothing is normalised away, and the evidence came from an execution or its limits are
said.
