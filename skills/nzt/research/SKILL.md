---
name: nzt-research
description: Use before stating or building on how an external system, API, library, standard or agent tool (an MCP server) behaves: the version in use, the authoritative source, every claim labelled.
---

# Research — how something outside the project behaves

Produces labelled claims with their sources and the consequence for the decision that needed
them. Any phase can need it; no router owns it — the kernel's rule on external facts sends
you here. Memory tells you what to look for, never what is true.

## References

| The unit is | Read |
|---|---|
| Finding, proposing, installing and registering a tool for the agent (kernel *Agent tools*) | `references/tools.md` |

## Steps

1. **Write the question and the decision it serves** before searching — *how do we receive
   an image a customer sends? → where it is stored, who downloads it, what happens when the
   download fails*. Read what answers it, not the provider's whole site.
2. **Establish the version in use** from the project: manifest or lockfile, configuration or
   client code, the contract in `Docs/Architecture/architecture.md`. Research that version —
   or the current one for something new — and say which you read.
3. **Read in rank order**:

   | Rank | Source | Can |
   |---|---|---|
   | 1 | official documentation and API reference **of that version** | support a claim |
   | 2 | official changelog, migration guide, deprecation and status notices | support a claim and its currency |
   | 3 | the standard itself (W3C, IETF RFC, ECMA, ISO…) | support a claim |
   | 4 | official SDK source, official repository issues | support undocumented behavior, labelled so |
   | 5 | articles, forums, Q&A, videos, generated summaries | lead to a source, never the only support |

   When sources disagree the current official one wins; report the disagreement when it
   would have changed the decision.
4. **For an integration, ask only what the decision needs**: authentication and rotation;
   request, response, webhook and event shapes; limits, quotas and expiries of tokens, URLs
   and ids; webhook signatures, retries, ordering, duplicates, timeouts; retryable errors
   and idempotency; a sandbox; deprecations, sunset dates, pricing or terms.
5. **For a tool for the agent** (an MCP server, a CLI, an editor bridge), the trust order is:
   the maker of the technology it serves (Unity for Unity, Microsoft for .NET) → the tool's
   maintainer (its repository and documentation) → third parties (rank 5). Report what it does for the agent, its version and last release, how it
   connects (a local process or a URL), what it installs on the machine and what it can
   reach (files, network, credentials). Reading about a tool never installs it: that is the
   user's yes.
6. **Label every claim**:

   | Label | Means | Carries |
   |---|---|---|
   | documented | a rank 1–4 source states it | URL and date read |
   | observed | a run against a sandbox or the project showed it | what was run and its result |
   | inferred | it follows from documented facts | the facts |
   | unverified | no source found or reachable | what would settle it |

   An inference is never presented as a fact; a decision resting on something unverified
   says so before anything is proposed on it.
7. **When the documentation is ambiguous** and the decision depends on it, propose a small
   proof against the sandbox inside the authorised work; its result is `observed`. Never
   production credentials or data without the user saying so.
8. **Without web access, say so**: use what is local — vendored SDK source, documentation in
   the repository, the contract already written — and label the rest `unverified`.

```markdown
**Receiving an image from the provider's API** — read 2026-09-13

- documented: the message webhook carries the image `id`, not the file.
- documented: the media URL expires in 5 minutes and needs the access token.
  Source: <url> · read 2026-09-13
- contradiction: a secondary article says the webhook carries the URL; the current
  documentation wins.
- inferred: download on the server when the webhook arrives and keep our own copy — the
  stored URL expires and the browser cannot send the token.
```

## Where the result goes

- **The conversation**: the answer, its labelled claims, and what it means for the decision,
  with the options when there is a real trade-off.
- **A technical decision**: its `QT-NN` cites the sources it rests on.
- **A tool for the agent**: proposed with its source; once installed, its row in
  `Docs/agent-tools.md`.
- **An integration**: the external systems table of `Docs/Architecture/architecture.md` and
  the feature's design **link** the provider's documentation, never transcribe it.
- A provider's capability is not a business rule: what the product promises is agreed in
  the spec, by the user.

## Done when

The user could check every claim by following what you cited, against the version declared.
