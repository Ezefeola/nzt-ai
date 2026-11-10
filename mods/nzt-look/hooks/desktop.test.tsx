import { expect, mock, test } from 'claude-code/testing'

import { paletteOf } from './prefs'
import { start, world } from './world.test-kit'
import type { Engine } from './world.test-kit'

const TABLE = '| Ruta | Límite |\n|---|---|\n| /chat | 60 |'

const mountReply = ($: Engine, surface: 'terminal' | 'desktop', id: string) =>
  $.ui.mount({
    plugin: 'nzt-look',
    surface,
    component: 'AssistantMessage',
    requestId: id,
    viewport: { columns: 100, rows: 60 },
    props: { text: TABLE, isFirstOfReply: true },
  } as never)

test('in the app the variant chosen in the panel wins over a light system, as in the terminal', async ($, on) => {
  world(on, { prefs: { variant: 'dark' } })
  // The system draws light, and an app shows the session beside the terminal.
  mock.env(on, { COLORFGBG: '0;15' })
  on('session.surfaces', async () => ({ value: ['terminal', 'desktop'] }) as never)
  await start($)

  const desk = await mountReply($, 'desktop', 'v1')
  const term = await mountReply($, 'terminal', 'v2')

  expect(await desk.find({ type: 'Text', text: 'Ruta' })).toMatchObject({ props: { color: paletteOf('nzt', [], 'dark').fg } })
  expect(await term.find({ type: 'Text', text: / Ruta / })).toMatchObject({ props: { color: paletteOf('nzt', [], 'dark').user } })
})
