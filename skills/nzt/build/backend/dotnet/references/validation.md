# Validation on .NET

**Read `../nzt-build/references/backend-validation.md` first.** It holds where the rules come
from, absence, nested inputs, normalisation and how validation is verified. This file holds
only what is .NET.

## The mechanism comes from the stack

| The stack's packages say | The validator is |
|---|---|
| FluentValidation | derived from `AbstractValidator<T>`, injected as `IValidator<T>` |
| no validation package | a class with a static method, called directly, registered nowhere |

Either way, its failure becomes a failed `Result` in `ExecuteAsync`
(`references/use-cases.md`), never `ModelState`.
