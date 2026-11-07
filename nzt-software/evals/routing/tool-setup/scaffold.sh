#!/usr/bin/env bash
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "$here/../../_fixtures/project.sh" "$PWD"

# A fresh clone: tech.md declares .NET, ASP.NET Core and Blazor, and the project has no
# agent tools yet - no Docs/agent-tools.md, no MCP file, no project plugins.
rm -rf "$PWD/.claude" "$PWD/.mcp.json" "$PWD/Docs/agent-tools.md"
