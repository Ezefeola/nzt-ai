# The agent tools file

`Docs/agent-tools.md`, in the work's folder, lists what the work uses besides the agent:
plugins, MCP servers, programs and domain packages, and the ones the person declined. It
is created with the first tool installed or declined. Headings stay as below; what goes in
the rows is written in the person's language.

```markdown
# Agent tools

## In use
| Name | Kind | Use it for | Source | Installed in | Since | Checked |
|---|---|---|---|---|---|---|
| Spell checker for Spanish | program | checking the book's chapters | maker's site, read 2026-11-09 | this work's folder | 2026-11-09 | checked chapter 1, found 3 errors |

## Declined
| Name | Offered for | Date | Reason |
|---|---|---|---|
| Shared documents connector | editing the chapters with the editor | 2026-11-09 | the editor works on exported files |
```

Kind is one of `plugin`, `MCP`, `program` or `package`.

## Rules

1. **A row says what the tool is for, not how it works:** no configuration or setup steps;
   those live in its source.
2. **A tool used from the person's own setup** also gets a row, with where it is installed,
   so the next session knows the work relies on it.
3. **Declined keeps its reason,** so a later session knows why it is not offered again.
4. **Kept current when it changes:** a tool removed, replaced or no longer answering is
   updated in the same work that finds it.
