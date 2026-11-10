import { expect, test } from 'claude-code/testing'

import { diagramOf } from './mermaid'
import type { Diagram } from './mermaid'
import { start, world } from './world.test-kit'
import type { Engine } from './world.test-kit'

const textOf = (diagram: Diagram | null) => diagram?.rows.map(runs => runs.map(run => run.text).join('')).join('\n') ?? null

const FLOW = ['flowchart TD', '  A[Pedido] --> B{¿Válido?}', '  B -->|sí| C[Cobrar]', '  B -->|no| D[Rechazar]', '  C --> E((Listo))'].join('\n')

test('a flowchart top-down: boxes in layers, arrows into each, labels by the arrow', async () => {
  const text = textOf(diagramOf(FLOW, 100))
  expect(text).toContain('│ Pedido │')
  expect(text).toContain('¿Válido?')
  expect(text).toContain('▼')
  expect(text).toContain('sí')
  expect(text).toContain('╭')
})

test('a flowchart left to right', async () => {
  const text = textOf(diagramOf('graph LR\n  A[Leer] --> B[Pensar] -->|listo| C[Escribir]', 100))
  expect(text).toContain('▶')
  expect(text!.split('\n').length).toBeLessThan(8)
})

test('a cycle does not loop the layout; the edge back goes round', async () => {
  const text = textOf(diagramOf('flowchart TD\n  A --> B\n  B --> C\n  C --> A', 100))
  expect(text).toContain('◀')
})

test('a state diagram with its start and end', async () => {
  const text = textOf(diagramOf('stateDiagram-v2\n  [*] --> Pendiente\n  Pendiente --> Contestada : elegir\n  Contestada --> [*]', 100))
  expect(text).toContain('●')
  expect(text).toContain('◉')
  expect(text).toContain('Pendiente')
})

test('a sequence diagram: heads, lifelines, messages and their labels', async () => {
  const text = textOf(
    diagramOf(
      ['sequenceDiagram', '  participant P as Persona', '  participant M as Mod', '  P->>M: aprieta /clear', '  M-->>P: pide confirmar', '  Note over P,M: 5 segundos'].join('\n'),
      100,
    ),
  )
  expect(text).toContain('Persona')
  expect(text).toContain('aprieta /clear')
  expect(text).toContain('▶')
  expect(text).toContain('┆')
})

test('a pie as bars with each share', async () => {
  const text = textOf(diagramOf('pie title Tokens\n  "Código" : 60\n  "Specs" : 30\n  "Otros" : 10', 100))
  expect(text).toContain('Tokens')
  expect(text).toContain('60%')
})

test('a mind map as a tree', async () => {
  const text = textOf(diagramOf('mindmap\n  root((NZT))\n    Método\n      Kernel\n      Skills\n    Mods\n      nzt-look', 100))
  expect(text).toContain('├─ Método')
  expect(text).toContain('└─ Mods')
})

test('what it does not draw stays as written: other kinds, subgraphs, too wide, unreadable', async () => {
  expect(diagramOf('classDiagram\n  A <|-- B', 100)).toBeNull()
  expect(diagramOf('flowchart TD\n  subgraph x\n  A --> B\n  end', 100)).toBeNull()
  expect(diagramOf(FLOW, 10)).toBeNull()
  expect(diagramOf('flowchart TD\n  A --> ??? ', 100)).toBeNull()
})

const mountReply = ($: Engine, surface: 'terminal' | 'desktop', text: string, id: string) =>
  $.ui.mount({
    plugin: 'nzt-look',
    surface,
    component: 'AssistantMessage',
    requestId: id,
    viewport: { columns: 110, rows: 60 },
    props: { text, isFirstOfReply: true },
  } as never)

test('a mermaid block in a reply is a card on both surfaces', async ($, on) => {
  world(on)
  await start($)
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await mountReply($, surface, `El flujo:\n\n\`\`\`mermaid\n${FLOW}\n\`\`\``, `g-${surface}`)
    expect(await ui.find({ type: 'Text', text: 'mermaid · flowchart' })).toBeDefined()
    await ui.unmount()
  }
})
