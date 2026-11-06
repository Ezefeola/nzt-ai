# Unity — the agent in the editor

The official connection is the Unity MCP server, a relay that the AI Assistant package
installs. Without it the agent edits files only; with it, it reads and drives the editor.

## Rules

1. **The project needs the `com.unity.ai.assistant` package**, and the user approves the
   connection in the editor the first time. Both are the user's, by hand.
2. **The server is the relay, run with `--mcp`**, from the user's home folder:

   | Platform | Command |
   |---|---|
   | Windows | `~\.unity\relay\relay_win.exe` |
   | macOS, Apple silicon | `~/.unity/relay/relay_mac_arm64.app/Contents/MacOS/relay_mac_arm64` |
   | macOS, Intel | `~/.unity/relay/relay_mac_x64.app/Contents/MacOS/relay_mac_x64` |
   | Linux | `~/.unity/relay/relay_linux` |

3. **It goes in the project's scope**, proposed and added with the user's yes like any tool
   (`nzt-architecture`'s `references/tech.md`), with the absolute path: a `~` is not
   expanded by every client.
4. **Check it answers in a new session** before relying on it; until then the work is
   files-only, and you say so.

## Done when

The relay is in the project's MCP file with this platform's absolute path, and it answered,
or the user knows the work is files-only.
