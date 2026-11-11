# Fixtures

Shared workspace seeds. A case's `scaffold.sh` calls one of these; none of them is a case,
so `claude plugin eval` ignores this directory when it collects cases.

| File | Seeds |
|---|---|
| `project.sh` | the NZT project: `Docs/Architecture/tech.md` (.NET backend + Blazor frontend), F-001 with US-012, a little source |
| `story-built.sh` | `project.sh` with US-012 built and not yet tested: backend and frontend marked, the listing's code, the plan's next unit is testing it. What verify starts from |
| `story-specified.sh` | `project.sh` with US-012 fully specified and not built: maximum `pageSize`, empty-state message, ordering tie-break. For cases that measure what the agent does not do |
| `stack-ready.sh` | `story-specified.sh` with every story, field and package the .NET and Blazor cases need, so they measure the software rules and not a gap |
| `charge-spec.sh` | `project.sh` plus F-002, the card charge at confirmation, specified and not designed: rules, one story, the gateway as an external system. What a technical design starts from |
| `node-project.sh` | a project that is **not** .NET, with its own `tech.md` declaring neither .NET nor Blazor, and `nzt-software` installed anyway |
| `foreign-repo.sh` | a .NET repository with **no** `tech.md`, its own house style, and `nzt-software` installed anyway |
| `no-kernel.sh` | removes a `CLAUDE.md` from the workspace. Since QT-111 no fixture writes one, so it is a guard kept for the `skill/` cases |

No fixture writes `CLAUDE.md` (QT-111): NZT's kernel reaches the run inside the plugin's
`nzt-software:nzt`, the way it ships (D92). Seeding it too would load the kernel twice.
