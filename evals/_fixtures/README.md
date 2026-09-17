# Fixtures

Shared workspace seeds. A case's `scaffold.sh` calls one of these; none of them is a case,
so `claude plugin eval` ignores this directory when it collects cases.

| File | Seeds |
|---|---|
| `project.sh` | the NZT project: kernel, two stack documents (.NET backend + Blazor frontend), F-001 with US-012, a little source |
| `node-project.sh` | a project that is **not** .NET, with its own stack document |
| `foreign-repo.sh` | a .NET repository with **no** stack document and its own house style |
| `CLAUDE.md` | **not in the repo** — `install/build.*` copies the freshly built kernel here when it assembles `dist/plugin/`. Running the suite against a stale build measures a stale kernel |

Every fixture writes `CLAUDE.md` into the workspace first. **That is the point**: NZT's
routing is instructed in the kernel (R2), so a run without it measures description matching
instead — a different product than the one being built.
