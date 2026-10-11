# Backend errors — one global handler

**An exception that escapes a use case ends in one place**: a single global handler that
answers with a clear message and leaves the whole exception in the log. Nothing else in the
API catches to translate.

## Expected failures never get here

What the operation can anticipate is checked **before** it writes and returned as a failed
Result, with the message of its entity — `backend-use-cases.md`:

| The rule | Checked before writing with |
|---|---|
| *There is no other one of these* | An existence query on the same scope as the unique index |
| *Nobody changed it since it was read* | The version the client sent against the stored one |
| *Nothing still points at it* | An existence query on the dependants before deleting |

The database constraint stays: it is what keeps the data true. **What reaches this handler
is what no check can prevent** — two requests passing the same check at once, the database
not answering, a bug.

**A use case does not catch to turn a database error into a Result.** No filtered catch, no
classifier of provider errors, no exception types written to be caught in one place. The rare
`try/catch` a use case may hold is defined in `backend-use-cases.md`, and translating
persistence failures is never it.

## Recognised by type, never by code or text

The handler distinguishes failures **only by the type of the exception** the language and the
data-access library raise.

- **No provider error numbers**, no SQLSTATE, no constraint name.
- **No matching on the message.** It is not a contract, and the server writes it in its own
  language.
- **No package that classifies provider errors** unless the stack adopted one.

A failure that cannot be told apart by type gets the message of its broader kind. That
message is still clear: it says what happened and what to do, not which constraint fired.

## The handler

- **One handler.** One dispatch over the type, read top to bottom. No handler per exception
  and no second layer of its own catching.
- **The most specific type first**: when one exception type derives from another, the order
  of the arms is part of the rule.
- **Same shape as a failed Result**, whichever way the stack's *Result to HTTP* axis sends
  one out. The client reads one field for every failure, whoever produced it.
- **The status matches the pre-check's.** If the version check answers `412`, the race on
  the same rule answers `412` too.
- **Nothing internal reaches a user**: no stack trace, no SQL, no table or constraint names,
  no exception message. The one exception is a detail field **only in development**, so the
  developer sees what happened without opening the log.
- **The base messages are the base, not the final text.** The final wording is agreed in the
  project — the spec or the UX system — in the product's language. A new row needs a type
  that tells it apart, never a code or a message.
- **The exception is logged once, whole.** Whoever logs it — the handler or the framework
  around it — the other does not log it a second time, and nothing makes it disappear from
  the log.

Where the file lives is the architecture reference's business: it belongs with the host's
HTTP translation, never under `Persistence/`.

## Closing checklist

- [ ] Expected failures are pre-checks returning a Result; the database constraint is still
      in place.
- [ ] No use case catches to translate a database error, and nothing in the project
      classifies provider errors.
- [ ] One global handler, recognising failures by type only, most specific first.
- [ ] Its response has the same shape as a failed Result, with the status the pre-check of
      the same rule uses.
- [ ] No internal detail reaches a user; the exception's message only in development.
- [ ] The exception is logged once.
- [ ] The message texts are the project's agreed ones, not the base ones.
