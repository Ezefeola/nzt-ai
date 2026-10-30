import { expect, test } from 'claude-code/testing'
import type { TestBody } from 'claude-code/testing'

type Engine = Parameters<TestBody>[0]
type On = Parameters<TestBody>[1]

/** A session with nzt-state (command) and nzt-changes (options only); the others missing. */
const fakeSession = (on: On, opts: { copy?: boolean; onClose?: (id: string) => void } = {}) => {
  on('command.list', async () => ({
    value: [{ name: 'nzt-state', description: '', source: 'plugin', plugin: 'nzt-state' }],
  }) as never)
  on('config.list', async () => ({
    value: [{ key: 'nzt-changes.language', label: 'Language', kind: 'choice', value: 'es', provider: 'plugin', isLocked: false }],
  }) as never)
  on('command.run', { command: 'nzt-state' }, async () => {
    return { text: 'Panel abierto.' }
  })
  on('ui.copy', async () => ({ value: opts.copy === false ? { isCopied: false, reason: 'no-clipboard' } : { isCopied: true } }) as never)
  on('ui.open', async () => ({ value: { isPlaced: true } }))
  on('ui.close', async (_, e) => {
    opts.onClose?.(e.id)
    return { value: undefined } as never
  })
}

const openPane = ($: Engine) =>
  $.command.run({
    command: 'nzt-hub',
    args: '',
    origin: { kind: 'composer' },
    presentation: { isFullscreen: true, columns: 160 },
  })

const mount = ($: Engine, bodyRows = 40, bodyColumns = 60, surface: 'terminal' | 'desktop' = 'terminal') =>
  $.ui.mount({
    plugin: 'nzt-hub',
    surface,
    component: 'Pane',
    requestId: 'nzt-hub',
    viewport: { columns: bodyColumns + 4, rows: bodyRows + 4 },
    props: {
      title: 'Mods',
      isFocused: true,
      bodyColumns,
      placement: 'dock',
      scroll: { offset: 0, bodyRows },
      view: {},
    },
  })

test('the pane lists every NZT mod with what it is for, and a button on the installed ones', async ($, on) => {
  fakeSession(on)
  expect(await openPane($)).toEqual({ text: 'Panel de mods abierto.' })
  const ui = await mount($)
  expect(await ui.find({ type: 'Text', text: 'Estado' })).toBeDefined()
  expect(await ui.find({ key: 'open:nzt-state' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /Plan\/state\.json/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'Archivos' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: / 2 de 4 instalados$/ })).toBeDefined()
})

test('Aspecto is the last of the generic mods, and without nzt-look it copies its install', async ($, on) => {
  fakeSession(on)
  await openPane($)
  const ui = await mount($)
  expect(await ui.find({ type: 'Text', text: 'Aspecto' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /marcas 30\/40/ })).toBeDefined()
  expect(await ui.find({ key: 'open:nzt-look' })).toBeUndefined()
  expect(await ui.find({ key: 'copy:nzt-look' })).toBeDefined()
})

test('the card keeps a blank row under the pane tabs and still fills the body', async ($, on) => {
  fakeSession(on)
  await openPane($)
  const ui = await mount($)
  expect(await ui.drawn()).toMatchObject({ props: { marginTop: 1, height: 39 } })
})

test('every installed mod has its button, and none is the context bar any more', async ($, on) => {
  fakeSession(on)
  await openPane($)
  const ui = await mount($)
  expect(await ui.find({ key: 'open:nzt-changes' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'barra sobre el prompt' })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: 'Contexto' })).toBeUndefined()
})

test('a missing mod copies its install command and says to paste it', async ($, on) => {
  fakeSession(on)
  await openPane($)
  const ui = await mount($)
  expect(await ui.find({ type: 'Text', text: ' no instalado' })).toBeDefined()
  expect(await ui.find({ key: 'open:nzt-files' })).toBeUndefined()
  await ui.press({ key: 'copy:nzt-files' })
  expect(await ui.find({ type: 'Text', text: /Copiado · pegalo en el prompt/ })).toBeDefined()
})

test('when the terminal refuses the copy, the command shows whole to select', async ($, on) => {
  fakeSession(on, { copy: false })
  await openPane($)
  const ui = await mount($)
  await ui.press({ key: 'copy:nzt-files' })
  expect(await ui.find({ type: 'Text', text: /No se pudo copiar/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: '/plugin install nzt-files --marketplace Ezefeola/nzt-ai' })).toBeDefined()
})

test('Abrir runs the mod command and the hub gives up its place', async ($, on) => {
  let closed = false
  fakeSession(on, { onClose: id => (closed = closed || id === 'nzt-hub') })
  await openPane($)
  const ui = await mount($)
  await ui.press({ key: 'open:nzt-state' })
  expect(closed).toBe(true)
})

test('the cards go under two group titles, and Archivos is among the generic ones with its install button', async ($, on) => {
  fakeSession(on)
  await openPane($)
  const ui = await mount($)
  expect(await ui.find({ type: 'Text', text: 'CON EL MÉTODO NZT' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'PARA CUALQUIER PROYECTO' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'Archivos' })).toBeDefined()
  expect(await ui.find({ key: 'copy:nzt-files' })).toBeDefined()
})

test('a narrow pane keeps the names and shortens the copy button', async ($, on) => {
  fakeSession(on)
  await openPane($)
  const ui = await mount($, 40, 36)
  expect(await ui.find({ type: 'Text', text: 'Cambios' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: ' ⧉ Copiar ' })).toBeDefined()
})

test('a short pane scrolls its list and says how many mods stay below', async ($, on) => {
  fakeSession(on)
  await openPane($)
  const ui = await mount($, 12)
  expect(await ui.find({ type: 'Text', text: /↓ \d más/ })).toBeDefined()
})

test('the command again closes the pane', async ($, on) => {
  fakeSession(on)
  await openPane($)
  await mount($)
  expect(await openPane($)).toEqual({ text: 'Panel de mods cerrado.' })
})

test('in the app the pane goes unframed and drawn whole: no Close, rule or key chips; the terminal keeps them', async ($, on) => {
  fakeSession(on)
  await openPane($)

  const desk = await mount($, 12, 60, 'desktop')
  const term = await mount($, 12)

  expect((await desk.findAll({ type: 'Box' })).map(box => box.props.borderStyle).filter(Boolean)).toEqual([])
  expect((await desk.findAll({ type: 'Box' })).map(box => box.props.height).filter(Boolean)).toEqual([])
  expect((await desk.findAll({ type: 'Button' })).map(button => button.props.hotkey).filter(Boolean)).toEqual([])
  expect(await desk.find({ key: 'close' })).toBeUndefined()
  expect(await desk.find({ type: 'Text', text: /^─+$/ })).toBeUndefined()
  expect(await desk.find({ type: 'Text', text: /↓ \d más/ })).toBeUndefined()
  expect(await desk.find({ key: 'copy:nzt-look' })).toBeDefined()
  expect(await term.find({ key: 'close' })).toBeDefined()
  expect(await term.find({ type: 'Text', text: /↓ \d más/ })).toBeDefined()
})

test('in the app Abrir and the install are buttons of the app with their words, and the mod keeps its color in its bar', async ($, on) => {
  fakeSession(on)
  await openPane($)

  const ui = await mount($, 40, 36, 'desktop')

  expect(await ui.find({ key: 'open:nzt-state' })).toMatchObject({ props: { label: 'Abrir ›', variant: 'secondary' } })
  expect(await ui.find({ key: 'copy:nzt-files' })).toMatchObject({ props: { label: '⧉ Copiar instalación' } })
  const bars = (await ui.findAll({ type: 'Box', key: 'bar' } as never)).map(bar => bar.props.backgroundColor)
  expect(bars).toContain('gray')
  // nzt-state and nzt-changes are installed.
  expect(bars.filter(color => color !== 'gray')).toHaveLength(2)
})

test('in the app a description wraps instead of running off the pane', async ($, on) => {
  fakeSession(on)
  await openPane($)

  const ui = await mount($, 40, 30, 'desktop')

  expect(await ui.find({ type: 'Text', text: /Plan\/state\.json/ })).toMatchObject({ props: { wrap: 'wrap' } })
})

test('in the app the command opens the pane beside the conversation and prints nothing', async ($, on) => {
  fakeSession(on)
  on('session.surfaces', async () => ({ value: ['desktop'] }) as never)

  expect((await openPane($)).text).toBeUndefined()
})

const wheel = (contentRows: number) => ({
  component: 'Pane' as const,
  requestId: 'nzt-hub',
  offset: 1,
  by: 1,
  bodyRows: 10,
  contentRows,
  origin: { kind: 'person' as const },
  pointer: { row: 4, column: 3 },
})

test('a wheel over a pane taller than its body goes on to the app, which scrolls it', async ($, on) => {
  fakeSession(on)
  const reached: number[] = []
  on('ui.scroll', async (_, e) => {
    reached.push(e.offset)
    return {} as never
  })
  await openPane($)

  await $.ui.scroll(wheel(40))

  expect(reached).toEqual([1])
})

test('a wheel over a pane as tall as its body moves the list, as on the terminal', async ($, on) => {
  fakeSession(on)
  const reached: number[] = []
  on('ui.scroll', async (_, e) => {
    reached.push(e.offset)
    return {} as never
  })
  await openPane($)

  await $.ui.scroll(wheel(10))

  expect(reached).toEqual([])
})
