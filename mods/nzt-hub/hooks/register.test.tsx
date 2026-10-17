import { expect, test } from 'claude-code/testing'
import type { TestBody } from 'claude-code/testing'

type Engine = Parameters<TestBody>[0]
type On = Parameters<TestBody>[1]

/** A session with nzt-state (command) and nzt-context (options only); the others missing. */
const fakeSession = (on: On, opts: { copy?: boolean; onClose?: (id: string) => void } = {}) => {
  on('command.list', async () => ({
    value: [{ name: 'nzt-state', description: '', source: 'plugin', plugin: 'nzt-state' }],
  }) as never)
  on('config.list', async () => ({
    value: [{ key: 'nzt-context.language', label: 'Language', kind: 'choice', value: 'es', provider: 'plugin', isLocked: false }],
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

const mount = ($: Engine, bodyRows = 40, bodyColumns = 60) =>
  $.ui.mount({
    plugin: 'nzt-hub',
    surface: 'terminal',
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
  expect(await ui.find({ type: 'Text', text: / 2 de 5 instalados$/ })).toBeDefined()
})

test('the card keeps a blank row under the pane tabs and still fills the body', async ($, on) => {
  fakeSession(on)
  await openPane($)
  const ui = await mount($)
  expect(await ui.drawn()).toMatchObject({ props: { marginTop: 1, height: 39 } })
})

test('a mod with no pane says where it shows, with no button', async ($, on) => {
  fakeSession(on)
  await openPane($)
  const ui = await mount($)
  expect(await ui.find({ type: 'Text', text: 'barra sobre el prompt' })).toBeDefined()
  expect(await ui.find({ key: 'open:nzt-context' })).toBeUndefined()
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
  await ui.press({ key: 'copy:nzt-changes' })
  expect(await ui.find({ type: 'Text', text: /No se pudo copiar/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: '/plugin install nzt-changes --marketplace Ezefeola/nzt-ai' })).toBeDefined()
})

test('Abrir runs the mod command and the hub gives up its place', async ($, on) => {
  let closed = false
  fakeSession(on, { onClose: id => (closed = closed || id === 'nzt-hub') })
  await openPane($)
  const ui = await mount($)
  await ui.press({ key: 'open:nzt-state' })
  expect(closed).toBe(true)
})

test('the cards go under two group titles, and Preguntas is among the generic ones with its install button', async ($, on) => {
  fakeSession(on)
  await openPane($)
  const ui = await mount($)
  expect(await ui.find({ type: 'Text', text: 'CON EL MÉTODO NZT' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'PARA CUALQUIER PROYECTO' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'Preguntas' })).toBeDefined()
  expect(await ui.find({ key: 'copy:nzt-questions' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /marcas 20\/30\/40 de NZT/ })).toBeDefined()
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
