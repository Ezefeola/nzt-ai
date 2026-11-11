#!/usr/bin/env bash
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "$here/../../_fixtures/story-built.sh" "$PWD"

# US-012 is built and verify is next. The project has one agent tool, for documentation;
# nothing that drives a browser. D96: a tool is offered in any phase, not only when the
# technologies are chosen - here, verify needs to drive the screen.
cat > "$PWD/Docs/agent-tools.md" <<'MD'
# Agent tools

| Tool | Kind | Use it for | Not for | Source | Installed |
|---|---|---|---|---|---|
| Microsoft Learn | MCP, URL | .NET, C# and Blazor documentation of the versions in `tech.md` | what this project decided | Microsoft Learn, read 2026-10-30 | project, `.mcp.json` |

## Declined
MD

cat > "$PWD/.mcp.json" <<'JSON'
{ "mcpServers": { "microsoft-learn": { "type": "http", "url": "https://learn.microsoft.com/api/mcp" } } }
JSON
