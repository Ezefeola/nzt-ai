import { expect, test } from 'claude-code/testing'

import { THEMES } from './palette'
import { start, world as fakeSession } from './world.test-kit'
import type { Engine, On } from './world.test-kit'

const run = ($: Engine, args = '') =>
  $.command.run({ command: 'nzt-look', args, origin: { kind: 'composer' }, presentation: { isFullscreen: true, columns: 160 } } as never)

test('the command opens the pane and, run again, closes it', async ($, on) => {
  const session = fakeSession(on)
  expect(await run($)).toEqual({ text: 'Panel de Aspecto abierto.' })
  expect(await run($)).toEqual({ text: 'Panel de Aspecto cerrado.' })
  expect(session.opens).toBe(1)
})

test('off and on switch the drawing, and say the band stays', async ($, on) => {
  fakeSession(on)
  expect(await run($, 'off')).toEqual({ text: expect.stringContaining('La banda y la línea al agente siguen') })
  expect(await run($, 'on')).toEqual({ text: 'Dibujo prendido.' })
})

test('a theme by name is applied, an unknown one lists the themes', async ($, on) => {
  fakeSession(on)
  expect(await run($, 'dracula')).toEqual({ text: 'Tema: dracula.' })
  expect(await run($, 'atardecer')).toEqual({ text: expect.stringContaining('No hay un tema atardecer') })
})

const MINE = { name: 'mio', label: 'Mío', dark: THEMES[0]!.dark, light: THEMES[0]!.dark }

/**
 * A session whose id the test moves on, as /clear does, and a store whose custom themes it
 * changes behind the mod's back: what the mod knows after that came from reading the store again.
 */
const sessionThatClears = (on: On) => {
  const held = { id: 'first', custom: [] as unknown[] }
  fakeSession(on, null)
  on('session.id', async () => ({ value: held.id }) as never)
  on('store.get', async (_, e) => ({ value: (e as { key: string }).key === 'custom' ? held.custom : undefined }) as never)
  on('store.set', async () => ({ value: undefined }) as never)
  on('classic.SessionStart', async () => ({}) as never)
  return held
}

test('after a /clear the mod reads the store again, so the look chosen stays', async ($, on) => {
  const session = sessionThatClears(on)
  await start($)
  session.custom = [MINE]
  session.id = 'second'
  await $.classic.SessionStart({ source: 'clear' } as never)
  expect(await run($, 'mio')).toEqual({ text: 'Tema: mio.' })
})

test('where SessionStart does not reach the mod, the new session first row reads the store', async ($, on) => {
  const session = sessionThatClears(on)
  await start($)
  session.custom = [MINE]
  session.id = 'second'
  await $.session.append({ door: 'prompt', message: { role: 'user', content: [{ type: 'text', text: 'hola' }] } } as never).catch(() => undefined)
  expect(await run($, 'mio')).toEqual({ text: 'Tema: mio.' })
})

test('within the same session a row does not read the store again', async ($, on) => {
  const session = sessionThatClears(on)
  await start($)
  session.custom = [MINE]
  await $.session.append({ door: 'prompt', message: { role: 'user', content: [{ type: 'text', text: 'hola' }] } } as never).catch(() => undefined)
  expect(await run($, 'mio')).toEqual({ text: expect.stringContaining('No hay un tema mio') })
})

test('the language option speaks English', { options: { language: 'en' } }, async ($, on) => {
  fakeSession(on)
  expect(await run($)).toEqual({ text: 'Look pane opened.' })
})

test('on the phone the pane says where its options are changed', async ($, on) => {
  fakeSession(on)
  await start($)
  const ui = await $.ui.mount({
    plugin: 'nzt-look',
    surface: 'mobile',
    component: 'Pane',
    requestId: 'nzt-look',
    props: { title: 'Aspecto', isFocused: true, bodyColumns: 40, placement: 'inline', scroll: { offset: 0, bodyRows: 20 }, view: {} },
  } as never)
  expect(await ui.find({ type: 'Text', text: /terminal o la app de escritorio/ })).toBeDefined()
})
