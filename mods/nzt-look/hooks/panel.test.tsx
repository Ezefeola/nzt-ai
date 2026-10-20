import { expect, mock, test } from 'claude-code/testing'

import { start, world } from './world.test-kit'
import type { Engine, On } from './world.test-kit'

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
    expect(await ui.find({ type: 'Text', text: /elegí uno en \/theme/ })).toBeDefined()
    await ui.unmount()
  }
})

/** A disk with the mod's two theme files and whatever the person's themes folder already holds. */
const disk = (on: On, held: Record<string, string> = {}) => {
  const files: Record<string, string> = { ...held }
  // The engine hands the path on absolute, in the host's own spelling (`C:\home\ana\…` on Windows).
  const at = (path: string) => path.replace(/\\/g, '/').replace(/^[A-Za-z]:/, '')
  on('fs.read', async (_, e) => {
    const path = at((e as { path: string }).path)
    if (!path.startsWith('/home/')) return { value: `{"from":"mod","file":"${path.split('/').pop()}"}` } as never
    if (files[path] === undefined) return { deny: 'ENOENT' } as never
    return { value: files[path] } as never
  })
  on('fs.write', async (_, e) => {
    const { path, text } = e as { path: string; text: string }
    files[at(path)] = text
    return { value: undefined } as never
  })
  return files
}

const THEMES_FOLDER = '/home/ana/.claude/themes'

test('the copy button puts NZT oscuro and claro in the person themes folder', async ($, on) => {
  world(on)
  mock.env(on, { HOME: '/home/ana' })
  const files = disk(on)
  await start($)
  const ui = await mountPane($)
  await ui.press({ key: 'install' })
  expect(Object.keys(files).sort()).toEqual([`${THEMES_FOLDER}/nzt-dark.json`, `${THEMES_FOLDER}/nzt-light.json`])
  expect(await ui.find({ type: 'Text', text: /Copiados a \/home\/ana\/\.claude\/themes/ })).toBeDefined()
})

test('a theme file the person already changed is left as it was, and the pane says so', async ($, on) => {
  world(on)
  mock.env(on, { HOME: '/home/ana' })
  const files = disk(on, { [`${THEMES_FOLDER}/nzt-dark.json`]: '{"edited":true}' })
  await start($)
  const ui = await mountPane($)
  await ui.press({ key: 'install' })
  expect(files[`${THEMES_FOLDER}/nzt-dark.json`]).toBe('{"edited":true}')
  expect(await ui.find({ type: 'Text', text: /Ya había un nzt-dark\.json distinto/ })).toBeDefined()
})

test('without a home to copy to, the pane says why and nothing is written', async ($, on) => {
  world(on)
  mock.env(on, {})
  const files = disk(on)
  await start($)
  const ui = await mountPane($)
  await ui.press({ key: 'install' })
  expect(files).toEqual({})
  expect(await ui.find({ type: 'Text', text: /No pude copiar los temas: no encuentro la carpeta/ })).toBeDefined()
})

const CLAUDE_THEMES = [
  ['custom:nzt-dark', 'nzt ●'],
  ['custom:nzt-look:nzt-light', 'nzt ●'],
  ['custom:otro', 'dracula ●'],
  ['dark', 'dracula ●'],
] as const

for (const [value, inForce] of CLAUDE_THEMES) {
  test(`/theme set to ${value} leaves the mod on ${inForce}`, async ($, on) => {
    world(on)
    on('config.set', async (_, e) => ({ value: (e as { value: unknown }).value }) as never)
    await start($)
    const ui = await mountPane($)
    await ui.press({ key: 'theme:dracula' })
    await $.config.set({ key: 'theme', value } as never)
    expect(await ui.find({ type: 'Text', text: inForce })).toBeDefined()
  })
}

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
