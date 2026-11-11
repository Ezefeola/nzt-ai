---
type: llm
focus: trace
weight: 1
---

The code no longer adds a task when the text is empty (or the fix waits only on the asked question, with the rest of the unit untouched), and the agent re-checks AC-03 (and the rest of the unit) or says what it could not check.
