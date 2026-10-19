import { expect, test } from 'claude-code/testing'

import type { Running, Usage } from '../types'
import { bandModelOf, levelColor, widthOf } from './band'
import { TEXTS } from './i18n'
import { agentLineOf, countdownOf, levelOf, limitsOf, modelNameOf } from './kernel'
import { DEFAULT_PREFS, paletteOf } from './prefs'
import { start, world } from './world.test-kit'
import type { Engine } from './world.test-kit'

const t = TEXTS.es
const HOUR = 3_600_000
const NOW = Date.parse('2026-10-18T12:00:00Z')

const usage = (percent: number, extra: Partial<Usage> = {}): Usage => ({
  reading: { kind: 'ok', percent, tokens: percent * 2000, window: 200_000 },
  limits: [
    { kind: 'fiveHour', percent: 41, resetsAt: NOW + 2 * HOUR + 15 * 60_000 },
    { kind: 'week', percent: 12, resetsAt: NOW + 4 * 24 * HOUR + 3 * HOUR },
  ],
  costUsd: 1.84,
  ...extra,
})

const NO_RUNNING: Running = { model: null, effort: null }
const OPUS: Running = { model: 'claude-opus-5-5', effort: 'high' }

const model = (u: Usage, columns = 160, more: { isWorking?: boolean; isConfirming?: boolean; parts?: typeof DEFAULT_PREFS.band; running?: Running } = {}) =>
  bandModelOf({ usage: u, running: more.running ?? NO_RUNNING, now: NOW, parts: more.parts ?? DEFAULT_PREFS.band, columns, isWorking: more.isWorking ?? false, isConfirming: more.isConfirming ?? false, t })

test("the kernel's stretches: under 20, from 20, from 30, from 40", async () => {
  expect([19, 20, 29, 30, 39, 40].map(levelOf)).toEqual(['low', 'warn', 'warn', 'high', 'high', 'critical'])
})

test('the context turns yellow from 20, orange from 30 and red from 40, with no word for it', async () => {
  const palette = paletteOf('nzt', [], 'dark')
  const colors = (['low', 'warn', 'high', 'critical'] as const).map(level => levelColor(palette, level))
  expect(colors).toEqual([palette.user, palette.warn, '#e5b284', palette.err])
  expect(model(usage(34))?.context).toEqual({ kind: 'ok', percent: 34, level: 'high', tokens: '68k/200k' })
})

test('the clear button is dim under 20, the main action from 20, and gone while Claude works', async () => {
  expect(model(usage(12))?.clear).toBe('dim')
  expect(model(usage(24))?.clear).toBe('main')
  expect(model(usage(24), 160, { isWorking: true })?.clear).toBeNull()
  expect(model(usage(24), 160, { isConfirming: true })?.clear).toBe('confirm')
})

test('the windows show what is used and what is left to reset', async () => {
  expect(model(usage(34))?.limits).toEqual([
    { kind: 'fiveHour', percent: 41, label: 'Límite 5h', countdown: '2h15' },
    { kind: 'week', percent: 12, label: 'Límite semanal', countdown: '4d3h' },
  ])
  expect(countdownOf(NOW + 40 * 60_000, NOW)).toBe('0h40')
  expect(limitsOf([{ kind: 'spend_limit', percentUsed: 3 }, { kind: 'five_hour', percentUsed: 7 }])).toEqual([
    { kind: 'fiveHour', percent: 7, resetsAt: null },
  ])
})

test('with no reading yet the band says so and draws no 0%, no limits and no button', async () => {
  const none = model({ reading: { kind: 'none' }, limits: [], costUsd: 0 })
  expect(none).toEqual({ context: { kind: 'none', label: 'sin lectura todavía' }, limits: [], cost: null, running: null, clear: null, hasLabels: true })
})

test('an account with no plan limits draws the context, the cost and the button', async () => {
  const keyed = model(usage(24, { limits: [] }))
  expect(keyed?.limits).toEqual([])
  expect(keyed?.cost).toBe('$1.84')
})

test('every part off draws no band', async () => {
  expect(model(usage(24), 160, { parts: { context: false, fiveHour: false, week: false, cost: false, model: false, clear: false } })).toBeNull()
})

test('narrow, the tokens go first, then the cost, the weekly, the 5h and the button; the meter stays', async () => {
  const full = model(usage(34))!
  const steps = [widthOf(full, t) - 1, 70, 52, 34, 24]
  const shown = steps.map(columns => {
    const m = model(usage(34), columns)!
    return [m.context?.kind === 'ok' && m.context.tokens !== null, m.cost !== null, m.limits.length, m.clear !== null]
  })
  expect(shown[0]).toEqual([false, true, 2, true])
  expect(shown.at(-1)).toEqual([false, false, 0, false])
  const tight = model(usage(34), 20)!
  expect(tight.context).toMatchObject({ kind: 'ok', percent: 34 })
})

test('the band shows the model by its short name and its effort beside it', async () => {
  expect(model(usage(12), 160, { running: OPUS })?.running).toEqual({ name: 'Opus 5.5', effort: 'high' })
  expect(modelNameOf('claude-sonnet-4-5-20250929')).toBe('Sonnet 4.5')
  expect(modelNameOf('claude-opus-4-6[1m]')).toBe('Opus 4.6 [1m]')
  expect(modelNameOf('Opus 5.5 (1M context)')).toBe('Opus 5.5 (1M context)')
})

test('before the first model request, or on a model without effort, only the model shows', async () => {
  expect(model(usage(12), 160, { running: { model: 'claude-opus-5-5', effort: null } })?.running).toEqual({ name: 'Opus 5.5', effort: null })
})

test('the model is not a usage figure: it shows with no reading yet', async () => {
  const none = model({ reading: { kind: 'none' }, limits: [], costUsd: null }, 160, { running: OPUS })
  expect(none?.context).toMatchObject({ kind: 'none' })
  expect(none?.running).toEqual({ name: 'Opus 5.5', effort: 'high' })
})

test('with the model part off, or the model unreadable, the band goes on without it', async () => {
  expect(model(usage(24), 160, { running: OPUS, parts: { ...DEFAULT_PREFS.band, model: false } })?.running).toBeNull()
  const unread = model(usage(24), 160)!
  expect(unread.running).toBeNull()
  expect(unread.cost).toBe('$1.84')
})

test('narrow, after the tokens, the countdowns and the cost go the effort and then the model, before the weekly', async () => {
  const at = (columns: number) => {
    const m = model(usage(34), columns, { running: OPUS })!
    return [m.limits[0]?.countdown ?? null, m.cost !== null, m.running?.effort ?? null, m.running?.name ?? null, m.limits.length]
  }
  const full = model(usage(34), 300, { running: OPUS })!
  expect(at(widthOf(full, t))).toEqual(['2h15', true, 'high', 'Opus 5.5', 2])
  const bare = { ...full, context: { ...(full.context as object), tokens: null } as never, limits: full.limits.map(limit => ({ ...limit, countdown: null })), cost: null }
  expect(at(widthOf(bare, t))).toEqual([null, false, 'high', 'Opus 5.5', 2])
  expect(at(widthOf(bare, t) - 1)).toEqual([null, false, null, 'Opus 5.5', 2])
  expect(at(widthOf(bare, t) - ' · high'.length - 1)).toEqual([null, false, null, null, 2])
})

test('the agent line is short, English, and says the stretch', async () => {
  const line = agentLineOf({ kind: 'ok', percent: 34, tokens: 68_000, window: 200_000 })
  expect(line).toBe('[nzt-look] Context used: 34% (68k of 200k tokens), 30%+, say it plainly.')
  expect(line.split(/\s+/).length).toBeLessThan(20)
})

const measure = ($: Engine, percent: number) =>
  $.session.measure({
    context: { tokens: percent * 2000, window: 200_000, percent },
    rateLimits: [{ kind: 'five_hour', percentUsed: 41 }],
    cost: { usd: 1.84 },
    changed: [],
  } as never)

const mountBand = ($: Engine, surface: 'terminal' | 'desktop', isWorking = false) =>
  $.ui.mount({
    plugin: 'nzt-look',
    surface,
    component: 'AbovePrompt',
    props: { hasSurvey: false, isWorking, maxRows: 10, bodyColumns: 140, scroll: { offset: 0, bodyRows: 10 }, view: {} },
  } as never)

test('the band redraws with each figure the session pushes, on the terminal and the desktop', async ($, on) => {
  world(on, { prefs: { calm: true } })
  await start($)
  await measure($, 34)
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await mountBand($, surface)
    expect(await ui.find({ type: 'Text', text: /34%/ })).toBeDefined()
    expect(await ui.find({ key: 'clear' })).toBeDefined()
    await ui.unmount()
  }
})

test('each part carries its label at its left and the model none, on both surfaces', async ($, on) => {
  world(on, { prefs: { calm: true } })
  on('session.start', async () => ({ cwd: '/repo' }) as never)
  on('session.model', async () => ({ value: 'claude-opus-5-5' }) as never)
  await start($)
  await measure($, 34)
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await mountBand($, surface)
    // The session pushed no reset time, so the limit's label goes without its countdown.
    for (const label of ['Contexto', 'Límite 5h', 'Costo']) expect(await ui.find({ type: 'Text', text: label })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Modelo|limpi(á|ar)/ })).toBeUndefined()
    await ui.unmount()
  }
})

test('in one line at 120 columns the tokens, the countdowns and the cost go, and the model stays', async () => {
  const fits = model(usage(34), 120, { running: OPUS })!
  const tokens = fits.context?.kind === 'ok' ? fits.context.tokens : 'none'
  expect([tokens, fits.limits.map(limit => limit.countdown), fits.cost, fits.running, fits.hasLabels]).toEqual([
    null,
    [null, null],
    null,
    { name: 'Opus 5.5', effort: 'high' },
    true,
  ])
})

const step = async ($: Engine, effort: 'low' | 'high' | undefined, agentId?: string) => {
  const stream = $.turn.step({ turnId: 't1', index: 0, model: 'claude-opus-5-5', effort, messageCount: 1, agentId } as never)
  for await (const _ of stream) {
    // drained: the step's chunks do not matter here
  }
  return stream.result
}

test('the band shows the model at the start and the effort from the first request, on both surfaces', async ($, on) => {
  world(on, { prefs: { calm: true } })
  // The model is read once the session has started, so the start needs an answer beneath.
  on('session.start', async () => ({ cwd: '/repo' }) as never)
  on('session.model', async () => ({ value: 'claude-sonnet-5-5' }) as never)
  on('turn.step', async function* (_, e) {
    return { turnId: e.turnId, index: e.index, answer: '', toolUses: [] } as never
  })
  await start($)
  await measure($, 12)
  const before = await mountBand($, 'terminal')
  expect(await before.find({ type: 'Text', text: /Sonnet 5\.5/ })).toBeDefined()
  expect(await before.find({ type: 'Text', text: /· high/ })).toBeUndefined()
  await before.unmount()
  await step($, 'low', 'sub-1')
  await step($, 'high')
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await mountBand($, surface)
    expect(await ui.find({ type: 'Text', text: /Opus 5\.5/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /· high/ })).toBeDefined()
    await ui.unmount()
  }
})

test('a /model switch shows the new model at once, its effort unknown until the next request', async ($, on) => {
  world(on, { prefs: { calm: true } })
  on('session.model', async () => ({ value: 'claude-opus-5-5' }) as never)
  on('turn.step', async function* (_, e) {
    return { turnId: e.turnId, index: e.index, answer: '', toolUses: [] } as never
  })
  on('classic.PostModelSwitch', async () => ({}) as never)
  await start($)
  await measure($, 12)
  await step($, 'high')
  await $.classic.PostModelSwitch({ from_model: 'claude-opus-5-5', to_model: 'claude-haiku-5-5', requested_model: 'haiku' } as never)
  const ui = await mountBand($, 'terminal')
  expect(await ui.find({ type: 'Text', text: /Haiku 5\.5/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /· high/ })).toBeUndefined()
})

test('out of calm mode the context meter moves on the terminal, beside its label drawn still', async ($, on) => {
  world(on)
  await start($)
  await measure($, 34)
  const moving = await mountBand($, 'terminal')
  expect(await moving.find({ type: 'Text', text: 'Contexto' })).toBeDefined()
  expect(await moving.find({ type: 'Text', text: /34%/ })).toBeUndefined()
  await moving.advance(500)
  expect(await moving.find({ type: 'Text', text: /34%/, in: 'context' } as never)).toBeDefined()
})

test('a press asks to confirm and the second one runs /clear', async ($, on) => {
  const { clock } = world(on, { prefs: { calm: true } }, NOW)
  const ran: string[] = []
  on('command.run', async (_, e) => {
    ran.push((e as { command: string }).command)
    return { text: '' }
  })
  await start($)
  await measure($, 24)
  const ui = await mountBand($, 'terminal')
  await ui.press({ key: 'clear' })
  expect(await ui.find({ type: 'Text', text: /otra vez para limpiar/ })).toBeDefined()
  expect(ran).toEqual([])
  await ui.press({ key: 'clear' })
  await clock.advance(10)
  expect(ran).toEqual(['clear'])
})

test('unconfirmed, the button goes back after five seconds', async ($, on) => {
  const { clock } = world(on, { prefs: { calm: true } }, NOW)
  await start($)
  await measure($, 24)
  const ui = await mountBand($, 'terminal')
  await ui.press({ key: 'clear' })
  await clock.advance(5001)
  expect(await ui.find({ type: 'Text', text: /otra vez para limpiar/ })).toBeUndefined()
})

const submitted = (on: Parameters<typeof world>[0]) => {
  const seen = { context: [] as readonly string[] }
  on('prompt.submit', async (_, e) => {
    seen.context = (e as { context?: readonly string[] }).context ?? []
    return { text: (e as { text: string }).text } as never
  })
  return seen
}

test('the prompt carries the agent line', async ($, on) => {
  world(on)
  const seen = submitted(on)
  await start($)
  await $.prompt.submit({ text: 'hola', wait: false } as never)
  expect(seen.context.filter(line => line.startsWith('[nzt-look] Context used'))).toHaveLength(1)
})

test('with the agent line off, the prompt goes as typed', async ($, on) => {
  world(on, { prefs: { agentLine: false } })
  const seen = submitted(on)
  await start($)
  await $.prompt.submit({ text: 'hola', wait: false } as never)
  expect(seen.context).toEqual([])
})
