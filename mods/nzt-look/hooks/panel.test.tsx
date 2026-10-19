import { expect, test } from 'claude-code/testing'

import { start, world } from './world.test-kit'
import type { Engine } from './world.test-kit'

const mountPane = ($: Engine, surface: 'terminal' | 'desktop' = 'terminal') =>
  $.ui.mount({
    plugin: 'nzt-look',
    surface,
    component: 'Pane',
    requestId: 'nzt-look',
    props: { title: 'Aspecto', isFocused: true, bodyColumns: 68, placement: 'dock', scroll: { offset: 0, bodyRows: 80 }, view: {} },
  } as never)

test('the pane lists the sixteen themes with the one in force marked, on both surfaces', async ($, on) => {
  world(on)
  await start($)
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await mountPane($, surface)
    const buttons = await ui.findAll({ type: 'Button' })
    expect(buttons.filter(button => String(button.key).startsWith('theme:'))).toHaveLength(16)
    expect(await ui.find({ type: 'Text', text: 'nzt ●' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /NZT oscuro y NZT claro están en \/theme/ })).toBeDefined()
    await ui.unmount()
  }
})

test('picking a theme applies it at once and the preview follows', async ($, on) => {
  world(on)
  await start($)
  const ui = await mountPane($)
  await ui.press({ key: 'theme:dracula' })
  expect(await ui.find({ type: 'Text', text: 'dracula ●' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'nzt ○' })).toBeDefined()
})

test("a band part switched off is kept, and the agent line has its own switch", async ($, on) => {
  world(on)
  await start($)
  const ui = await mountPane($)
  await ui.press({ key: 'band:cost' })
  expect(await ui.find({ type: 'Text', text: 'costo ○' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'línea al agente ●' })).toBeDefined()
})

test("the words are a selector, claude by default, and picking mod keeps it", async ($, on) => {
  world(on)
  await start($)
  const ui = await mountPane($)
  expect(await ui.find({ type: 'Text', text: 'claude ●' })).toBeDefined()
  await ui.press({ key: 'words:theme' })
  expect(await ui.find({ type: 'Text', text: 'mod ●' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'claude' })).toBeDefined()
})

test('a color that is not one says so and changes nothing', async ($, on) => {
  world(on)
  await start($)
  const ui = await mountPane($)
  await ui.press({ key: 'color:user' })
  await ui.input({ key: 'paint:user', text: '#72f4z' })
  expect(await ui.find({ type: 'Text', text: /#72f4z no es un color/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'nzt ●' })).toBeDefined()
})

test('a repaint is saved as mi-<tema> and applied, the original kept', async ($, on) => {
  world(on)
  await start($)
  const ui = await mountPane($)
  await ui.press({ key: 'color:user' })
  await ui.input({ key: 'paint:user', text: '#ff00ff' })
  expect(await ui.find({ type: 'Text', text: /Guardado como mi-nzt; nzt queda como estaba/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'mi-nzt ●' })).toBeDefined()
  expect(await ui.find({ key: 'theme:nzt' })).toBeDefined()
})

test('a theme pinned to the folder, then made the usual one', async ($, on) => {
  world(on)
  await start($)
  const ui = await mountPane($)
  await ui.press({ key: 'theme:nord' })
  await ui.press({ key: 'pin' })
  expect(await ui.find({ type: 'Text', text: 'fijado: nord' })).toBeDefined()
  await ui.press({ key: 'make-default' })
  expect(await ui.find({ key: 'pin' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'nord ●' })).toBeDefined()
})

test('with the drawing off, the pane says the band and the agent line stay', async ($, on) => {
  world(on, { prefs: { isDrawing: false } })
  await start($)
  const ui = await mountPane($)
  expect(await ui.find({ type: 'Text', text: /La banda y la línea al agente siguen/ })).toBeDefined()
})
