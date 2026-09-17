---
name: nzt-build-secrets
description: Use when credentials or sensitive configuration are involved: keeping values out of the chat, code, logs and evidence, and treating exposure as compromise.
---

# Secrets and sensitive configuration

Produces code and configuration where a secret is **referenced and never reproduced**. The
value lives in the project's own mechanism; everything else names the key.

If you did not arrive here from `nzt-build`, load it first.

## The three rules

1. **Never ask the user to paste a secret into the chat.** Ask them to set it where the
   project keeps secrets, and tell them the exact key name.
2. **Never print a value.** Not in output, not in a report, not "just this once" to debug.
3. **Check presence, not content.** *"`Billing__ApiKey` is set"* or *"it is missing"* is the
   whole diagnostic you need, and it is safe to write down.

These hold everywhere the work leaves a trace: replies, reports, commit messages, test
evidence, screenshots and logs. **Evidence is where secrets actually leak** — the code gets
reviewed, the screenshot does not.

## Where the value lives

Use the mechanism this project already has — the SDK's secret store, environment variables,
the platform's vault, the CI secret store. Read the configuration before deciding; a second
mechanism introduced quietly means half the secrets are somewhere nobody looks.

- The repository holds the **name** and the shape, never the value: an example file with
  keys and empty or obviously fake values.
- A connection string with credentials in it is a secret, whatever it is called.
- A default value that works is the most dangerous kind of placeholder: it ships.

## In the code

- Read secrets through the project's configuration layer, at the point of use. A secret
  copied into a variable, a DTO or a log context travels further than you can follow.
- **Error messages and diagnostics do not echo the request.** A handler that dumps what it
  received will eventually dump a token.
- What gets logged is decided deliberately: identifiers yes, credentials and personal data
  no. Redaction happens before the write, not by hoping nobody reads the log.

## When one is exposed

Treat it as **compromised**, not as a mistake to tidy up:

1. **Say so immediately**, naming what was exposed and where — the key, not the value.
2. **Rotation comes first.** Deleting the line does not un-leak it: anything committed is in
   the history, and anything printed is in someone's scrollback.
3. Then remove it from the code and replace it with the reference.
4. Say plainly what you cannot clean: published history, logs already shipped, a
   screenshot already sent.

Never quietly delete a committed secret and move on. The user has to know a rotation is
needed, and that is their call to make, not yours to hide.

## Running things that need one

- Ask for the key to be set, name it, and say how you will check it is there.
- If it is missing, that is a blocked step with a named cause — not a reason to hardcode a
  value "temporarily" or to invent a test credential that ends up shipping.
- A secret you were given in the conversation anyway is used for that step and never
  written into a file, a report or the state.

## Done when

Rehearse it: could this whole unit — code, config, report, evidence — be published without
anything having to be rotated?

- No value appears anywhere outside the secret store.
- Every check is a presence check, by key name.
- The example file lists the keys the project needs.
- Logs and error messages carry identifiers, not credentials.
- Any exposure was reported with its rotation, not cleaned up silently.
