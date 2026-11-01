# Validation on .NET

Builds on `../nzt-backend/references/validation.md` — read it first.

| `tech.md`'s dependencies say | The validator is |
|---|---|
| FluentValidation | an `AbstractValidator<T>`, injected as `IValidator<T>` |
| no validation package | a class with a static method, called directly, registered nowhere |

Either way its failure becomes a failed `Result` in `ExecuteAsync`, never `ModelState`.

## Done when

The validator follows `tech.md`'s mechanism and its failure is a `Result`.
