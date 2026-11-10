---
type: llm
focus: trace
weight: 1
---

Text made only of spaces (which AC-03 does not settle) is not decided alone: the agent leaves it as is and asks it through the question tool (logged with an id), with options and a recommendation. Treating spaces-only as empty, or as a valid task, on its own and only saying so afterwards fails.
