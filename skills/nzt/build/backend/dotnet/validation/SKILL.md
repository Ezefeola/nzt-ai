---
name: nzt-build-backend-dotnet-validation
description: Use when adding, changing or reviewing the inputs of a .NET operation and their validator - the shape of the input checked at the operation boundary, with the rules taken from the contract and never invented.
---

# Validating an operation's input

`<Operation>Validator` — `CreateOrderValidator` — in its own file. The use case invokes it
before queries, writes or external calls and turns its failure into a failed `Result`:
**orchestration and status belong to the use case, not here.**

**A check in the frontend does not replace this one.** The operation boundary is where input
is validated, because it is the boundary every caller crosses.

Load `nzt-build-backend-dotnet` before applying this.

## The mechanism comes from the stack

| The stack's packages say | The validator is |
|---|---|
| FluentValidation | derived from `AbstractValidator<T>`, injected as `IValidator<T>` |
| no validation package | a class with a static method, called directly, registered nowhere |

**The hand-written validator has no dependencies** — which is also why it cannot ask the
database anything, and why that kind of rule is somebody else's.

## The rules come from the contract, never from you

**The validator invents no limit and no message.**

- A rule about an entity concept reads its constant and its message **from the entity**, as
  the selected domain skill defines it.
- A rule about an input that exists only for this operation comes from the project's agreed
  contract.
- **A missing material rule is resolved, not imposed.** A limit invented here becomes the
  contract by accident, and the first person to hit it will be a user.

Check what the operation actually needs: required fields, lengths, formats, ranges, admitted
values. **For an enum, use the contract's admitted values** — not every number the type can
represent is an accepted option.

## Absence has more than one meaning

**Distinguish absent, null, empty and whitespace-only** according to the contract, and
**never read a default value as evidence that the caller supplied the field.** If omitting
something means one thing and sending it empty means another, the input representation has to
keep them apart before validation can.

Preserve a valid zero, `false` or empty value when the contract admits it. A rule that
rejects them because they look like nothing is a rule nobody wrote.

## Nested inputs and collections

- Validate **each applicable nested object and each element**, including their required
  fields and ranges, and handle a null parent or element before reaching into it.
- **A valid collection count does not make its elements valid.** An order with a non-empty
  `Lines` still needs every line's product reference and quantity checked.
- Check size limits when the project defines them, and relationships between fields when the
  contract requires them **and the input alone can answer**. Whether the product exists needs
  state, so it is not this validator's.

## Normalisation

Normalise **only when the contract defines it**, in the order it prescribes, using the same
representation for validation and for what happens after.

**Never trim, change case, clamp, drop invalid elements or substitute defaults to make
validation pass.** That is invalid input being hidden rather than rejected, and the caller
never finds out what they sent. An agreed default for an omitted optional field is a
different thing, and the distinction stays visible.

## Verification

Cover a valid input, the boundaries on both sides of every defined range or limit, the
absent/null/empty distinctions, invalid nested fields and invalid elements, and normalisation
where it applies.

**Verify that rejected input produces the expected failure with no write and no external
call, and that validation runs before any state query.** Record what actually ran and any
limits on it: **inspection is not an executed test**.

## Closing checklist

- [ ] The validator's structure follows the stack, and it holds no orchestration.
- [ ] Every rule and message came from the entity or the agreed contract; none was invented.
- [ ] Absence, null, empty and whitespace are distinguished as the contract requires.
- [ ] Nested objects and collection elements are validated, not just counted.
- [ ] Normalisation is contract-defined and hides no invalid input.
- [ ] State-dependent rules — uniqueness, existence, permissions — stayed out of here.
- [ ] Accepted and rejected cases have evidence, or the execution limits are stated.
