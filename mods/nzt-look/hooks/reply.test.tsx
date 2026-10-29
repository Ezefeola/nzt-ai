import { expect, test } from 'claude-code/testing'

import { segmentsOf } from './markdown'
import { paletteOf } from './prefs'
import { bandOf, fitColumns, sharesOf, wrapCell } from './reply'
import { start, world } from './world.test-kit'
import type { Engine } from './world.test-kit'

const REPLY = [
  'Listo. Cambié el límite de la API del hub.',
  '',
  '| Ruta | Límite | Ventana |',
  '|---|--:|---|',
  '| /chat | 60 | 1 min |',
  '| /upload | 10 | 1 min |',
  '',
  '> [!WARNING]',
  '> El límite de /upload es por usuario.',
  '',
  '- [x] Sumar el límite',
  '- [ ] Probarlo en vivo',
].join('\n')

test('a reply is cut into prose, a table, a callout and tasks, each with its source', async () => {
  const segments = segmentsOf(REPLY)
  expect(segments.map(segment => segment.kind)).toEqual(['prose', 'table', 'callout', 'tasks'])
  const table = segments[1]!
  expect(table.kind === 'table' && table.align).toEqual(['left', 'right', 'left'])
  expect(table.kind === 'table' && table.rows[1]).toEqual(['/upload', '10', '1 min'])
})

test('a fence names its language, mermaid and math apart; an unclosed one stays prose', async () => {
  const kinds = segmentsOf('```ts\nconst a = 1\n```\n\n```mermaid\ngraph LR\nA-->B\n```\n\n$$\n\\frac{a}{b}\n$$').map(s => s.kind)
  expect(kinds).toEqual(['code', 'mermaid', 'math'])
  expect(segmentsOf('```ts\nconst a = 1').map(s => s.kind)).toEqual(['prose'])
})

const mountReply = ($: Engine, surface: 'terminal' | 'desktop', text: string, id = 'm1', columns = 100) =>
  $.ui.mount({
    plugin: 'nzt-look',
    surface,
    component: 'AssistantMessage',
    requestId: id,
    viewport: { columns, rows: 60 },
    props: { text, isFirstOfReply: true },
  } as never)

test('the table, the callout and the tasks are drawn, the prose stays Claude Code’s markdown, on both surfaces', async ($, on) => {
  world(on)
  await start($)
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await mountReply($, surface, REPLY)
    expect(await ui.find({ type: 'Text', text: /Ruta/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: '▲ Aviso' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: '1 de 2' })).toBeDefined()
    expect(await ui.find({ type: 'Markdown', text: /Listo\. Cambié el límite/ })).toBeDefined()
    await ui.unmount()
  }
})

test('a reply the mod draws starts with Claude Code’s bullet on the terminal; the desktop has none', async ($, on) => {
  world(on)
  await start($)
  const table = REPLY.split('\n').slice(0, 6).join('\n')
  const terminal = await mountReply($, 'terminal', table, 'b1')
  expect(await terminal.find({ type: 'Text', text: '● ' })).toBeDefined()
  const desktop = await mountReply($, 'desktop', table, 'b2')
  expect(await desktop.find({ type: 'Text', text: '● ' })).toBeUndefined()
})

test('on the terminal a table is a grid of padded lines split by │', async ($, on) => {
  world(on)
  await start($)

  const ui = await mountReply($, 'terminal', REPLY, 'g1')

  expect(await ui.find({ type: 'Text', text: / Ruta +│ Límite │ Ventana / })).toBeDefined()
})

test('on the desktop a table is a grid of boxes: one per cell, its text alone, wrapping in its column', async ($, on) => {
  world(on)
  await start($)
  const wide = '| Unidad | Qué produce |\n|---|--:|\n| 243 | Quito toda mención de la referencia en specs, mockups y el código del mod |'

  const ui = await mountReply($, 'desktop', wide, 'g2', 40)

  expect(await ui.findAll({ type: 'Text', text: /│/ })).toEqual([])
  expect(await ui.find({ type: 'Text', text: 'Unidad' })).toMatchObject({ props: { bold: true } })
  expect(await ui.find({ type: 'Text', text: '243' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /^Quito toda mención .* del mod$/ })).toMatchObject({ props: { wrap: 'wrap' } })
  expect(await ui.find({ type: 'Text', text: 'claude-code' })).toBeUndefined()
})

test('on the desktop the header sits on a band of the accent over the surface, with the copy button at its end', async ($, on) => {
  const seen = world(on, { prefs: { variant: 'dark' } })
  await start($)
  const palette = paletteOf('nzt', [], 'dark')
  const source = '| Antes | Ahora |\n|---|---|\n| sin id | CA-NN estable |'

  const ui = await mountReply($, 'desktop', source, 'g3')

  expect((await ui.findAll({ type: 'Box' })).some(box => box.props.backgroundColor === bandOf(palette))).toBe(true)
  expect(await ui.find({ type: 'Text', text: 'Antes' })).toMatchObject({ props: { bold: true, color: palette.fg } })
  await ui.press({ key: 'block:g3:0:copy' })
  expect(seen.copies).toEqual([source])
})

test('each column takes a share of the row by its longest text, a short one at least 6, a long one at most 40', async () => {
  expect(sharesOf([3, 70])).toEqual([13, 87])
  expect(sharesOf([10, 10])).toEqual([50, 50])
  expect(sharesOf([6, 13])).toEqual([32, 68])
})

test('a table past 14 rows folds, and ▾ shows the rest', async ($, on) => {
  world(on)
  await start($)
  const rows = Array.from({ length: 20 }, (_, i) => `| r${i + 1} | ${i} |`).join('\n')
  const ui = await mountReply($, 'terminal', `| a | b |\n|---|---|\n${rows}`, 'm2')
  expect(await ui.find({ type: 'Text', text: / r16 / })).toBeUndefined()
  await ui.press({ key: 'block:m2:0:more' })
  expect(await ui.find({ type: 'Text', text: / r16 / })).toBeDefined()
})

test('a table wider than the room wraps its cells inside the grid', async ($, on) => {
  world(on)
  await start($)
  const wide = '| Unidad | Qué produce |\n|---|---|\n| 243 | Quito toda mención de la referencia en specs, mockups y el código del mod |'
  const ui = await mountReply($, 'terminal', wide, 'm3', 40)
  expect(await ui.find({ type: 'Text', text: 'claude-code' })).toBeUndefined()
  const rows = await ui.findAll({ type: 'Text', text: /│/ })
  expect(rows.length).toBeGreaterThan(2)
  expect(rows.every(row => [...String(row.text)].length <= 36)).toBe(true)
  expect(await ui.find({ type: 'Text', text: /referencia/ })).toBeDefined()
})

test('a table whose columns would fall under 6 cells stays as Claude Code draws it', async ($, on) => {
  world(on)
  await start($)
  const many = `| ${Array.from({ length: 10 }, (_, i) => `columna${i}`).join(' | ')} |\n|${'---|'.repeat(10)}\n| ${Array.from({ length: 10 }, () => 'valor largo').join(' | ')} |`
  const ui = await mountReply($, 'terminal', many, 'm4', 60)
  expect(await ui.find({ type: 'Text', text: 'claude-code' })).toBeDefined()
})

test('columns shrink widest first and never under the minimum; a long word is broken', async () => {
  expect(fitColumns([5, 40], 30)).toEqual([5, 20])
  expect(fitColumns([20, 20, 20], 26)).toEqual([6, 6, 6])
  expect(fitColumns([20, 20, 20], 25)).toBeNull()
  expect(wrapCell('Quito toda mención', 8)).toEqual(['Quito', 'toda', 'mención'])
  expect(wrapCell('supercalifragilístico', 8)).toEqual(['supercal', 'ifragilí', 'stico'])
})

test('with tables switched off a table is prose again', async ($, on) => {
  world(on, { prefs: { parts: { tables: false } } })
  await start($)
  const ui = await mountReply($, 'terminal', '| a | b |\n|---|---|\n| 1 | 2 |', 'm4')
  expect(await ui.find({ type: 'Text', text: 'claude-code' })).toBeDefined()
})

test('a block’s copy button puts its source on the clipboard', async ($, on) => {
  const seen = world(on)
  await start($)
  const ui = await mountReply($, 'terminal', '| a | b |\n|---|---|\n| 1 | 2 |', 'm5')
  await ui.press({ key: 'block:m5:0:copy' })
  expect(seen.copies).toEqual(['| a | b |\n|---|---|\n| 1 | 2 |'])
})
