import { expect, test } from 'claude-code/testing'

import { designedOf, slugOf } from './design'
import { KEYS } from './palette'
import { start, world } from './world.test-kit'
import type { Engine } from './world.test-kit'

const SUNSET = Object.fromEntries(KEYS.map((key, i) => [key, key === 'surface' ? '#1a1020' : key === 'zebra' ? '#22142a' : `#ff${(80 + i * 8).toString(16)}40`]))

test("a theme's name is kept in lower case with dashes, never a built-in's", async () => {
  expect(slugOf('Atardecer en Córdoba')).toBe('atardecer-en-cordoba')
  expect(slugOf('Dracula')).toBe('mi-dracula')
})

test('a theme with every color is kept, its light palette derived when not given', async () => {
  const designed = designedOf({ name: 'Atardecer', dark: SUNSET })
  expect('theme' in designed && designed.theme.name).toBe('atardecer')
  expect('theme' in designed && designed.theme.light.surface).toBe('#ffffff')
})

test('a theme missing colors says which', async () => {
  expect(designedOf({ name: 'Roto', dark: { ...SUNSET, err: 'rojo', warn: undefined } })).toEqual({ missing: ['dark.err', 'dark.warn'] })
})

const run = ($: Engine, args = '') =>
  $.command.run({ command: 'nzt-look', args, origin: { kind: 'composer' }, presentation: { isFullscreen: true, columns: 160 } } as never)

test('the agent’s theme is applied and kept as one of the person’s', async ($, on) => {
  world(on)
  await start($)
  const called = await $.tool.call({ tool: 'mcp__nzt-look__design', tool_use_id: 'd1', name: 'Atardecer', dark: SUNSET } as never)
  expect(called).toMatchObject({ result: { applied: 'atardecer' } })
  expect(await run($, 'atardecer')).toEqual({ text: 'Tema: atardecer.' })
})

test('a theme it cannot read is refused and the one in use stays', async ($, on) => {
  world(on)
  await start($)
  const called = await $.tool.call({ tool: 'mcp__nzt-look__design', tool_use_id: 'd2', name: 'Roto', dark: { fg: '#fff' } } as never)
  expect(called).toMatchObject({ deny: expect.stringContaining('dark.read') })
})

test('the diagram note reaches the agent only with diagrams on and an interface', async ($, on) => {
  world(on)
  on('prompt.compose', async () => ({ sections: [] }) as never)
  await start($)
  const drawn = await $.prompt.compose({ model: 'm', promptModel: 'm', surfaces: ['terminal'], tools: [], outputStyle: null, traits: [] } as never)
  expect(drawn.sections.map(section => section.id)).toEqual(['nzt-look-diagrams'])
  const headless = await $.prompt.compose({ model: 'm', promptModel: 'm', surfaces: [], tools: [], outputStyle: null, traits: [] } as never)
  expect(headless.sections).toEqual([])
})
