# Secrets and sensitive configuration

A secret is **referenced, never reproduced**: the value lives in the project's own mechanism,
everything else names the key.

## Rules

1. **Never ask the user to paste a secret** into the chat: name the exact key and where the
   project keeps secrets.
2. **Never print a value** — not in output, reports, commits, test evidence, screenshots or
   logs. Evidence is where secrets actually leak.
3. **Check presence, not content**: *"`Billing__ApiKey` is set"*.
4. Use the mechanism the project already has (secret store, environment, vault, CI store).
   The repository holds names and shape only — an example file with empty or fake values.
   A connection string with credentials is a secret. A working default value ships.
5. Read secrets through the configuration layer at the point of use; never copy them into
   variables, DTOs or log context. Errors and diagnostics never echo the request. Logs carry
   identifiers, never credentials or personal data — redacted before the write.
6. Missing secret → a blocked step with a named cause, never a hardcoded "temporary" value.
   A secret given in the conversation anyway is used for that step and written nowhere.

## When one is exposed

1. Say so immediately: the key and where, never the value.
2. **Rotation first** — deleting the line does not un-leak history or scrollback.
3. Then replace it with the reference.
4. Say what you cannot clean: published history, shipped logs, sent screenshots.

## Done when

The whole unit — work, configuration, report, evidence — could be published without rotating
anything.
