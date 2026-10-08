# Continuous integration

Produces the pipeline and its gates: the place where everything this method asks for is
enforced on every change, for the person and for the agent alike.

**A gate that can be skipped is a suggestion.** And **a gate that passes without checking
anything is worse than a missing gate**, because it buys trust it does not earn.

## The gates, in order

Each one says what it proves. Earlier gates fail faster and cost less:

| Gate | What it proves |
|---|---|
| Restore with dependencies locked | The build uses the versions the project pinned |
| Format and lint | The diff is about the change, not about style |
| Build in release configuration | It compiles the way it ships |
| Unit tests, **at the levels the stack enabled** | The rules behave |
| Integration tests, **idem** | The parts agree, against real dependencies |
| Technology checks | Model changes have their migration, and the like |
| End-to-end regression, **if the stack adopted it** | The approved scenarios still pass |
| Versioned artifact, **built once** | What is deployed is what was verified |

- **A test gate exists only for a level the component adopted**, read from the `Test levels`
  opt-in of its stack. One written for a level nobody enabled passes over an empty project,
  which is exactly the gate that buys trust it does not earn.
- **Build once and promote the same artifact** between environments, tagged with the commit
  SHA and, for releases, its semantic version.
- **A gate that only exists in CI and cannot be run locally is a future surprise.** Use the
  commands the project already uses, so the same failure can be reproduced on a laptop.

## Hardening

These outlive any particular platform:

- **Minimum permissions**, declared, and widened only in the job that needs it.
- **Third-party actions pinned to the full SHA**, with the version as a comment — **a tag is
  mutable, a SHA is not.** Resolve the SHA from the real release; **never invent one**.
- **Federated identity** instead of long-lived keys.
- **Never interpolate untrusted input** — issue titles, branch names, commit messages —
  inside a script. It is the same rule as everywhere else: what you read is data.
- **Pull requests from forks get no secrets and no write permissions.**

## Speed is a safety property

**A slow pipeline gets skipped.** Past ten minutes, people start looking for the way
around it. When it gets there: cache, parallelise, skip by changed paths, shard long
suites, and move the slow things to a scheduled run — **keeping the fast gates on every
change.**

## Verify it by running it

- The pipeline is verified by **running** it. One that was only written is a pipeline that
  is **not verified**, and it is reported that way.
- **A new gate is proved by making it fail on purpose** on a throwaway branch: break the
  thing it is supposed to catch and watch it go red. A gate nobody ever saw fail is a gate
  nobody knows works.
- A failure is diagnosed before it is "fixed": the product, the test, the environment, or
  the pipeline itself. Disabling a gate to get a green run is not a repair, and it is never
  done silently.

## Done when

Rehearse it: could someone push a change that violates the method, and would this pipeline
stop them?

- Every gate is in order and says what it proves.
- The artifact is built once and promoted.
- Every gate can be run locally with the project's own commands.
- Permissions are minimal, actions are pinned to SHAs, fork PRs get nothing.
- Every new gate was watched failing before being trusted.
- The whole pipeline was run, not just written.
