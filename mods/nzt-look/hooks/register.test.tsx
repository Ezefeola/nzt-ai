import { expect, test } from 'claude-code/testing'

import { start, world as fakeSession } from './world.test-kit'
import type { Engine } from './world.test-kit'

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
