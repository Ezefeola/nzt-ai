#!/usr/bin/env bash
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "$here/../../_fixtures/project.sh" "$PWD"

# A fresh clone: tech.md lists dotnet, ddd and blazor, and the project has no MCP file yet.
rm -rf "$PWD/.claude" "$PWD/.mcp.json"
