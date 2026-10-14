import { describe, expect, test } from 'claude-code/testing'
import type { TestBody } from 'claude-code/testing'

import { abbreviate, cellsOf, layoutOf, levelOf, modelLineOf, readingOf, scaleOf } from './gauge'

describe('levelOf', () => {
  test('the stretches start at the kernel marks', async () => {
    expect([0, 19, 20, 29, 30, 39, 40, 100].map(levelOf)).toEqual([
      'low', 'low', 'warn', 'warn', 'high', 'high', 'critical', 'critical',
    ])
  })
})

describe('readingOf', () => {
  test('a fill the engine has not reported is no reading, never 0%', async () => {
    expect(readingOf({ window: 200_000 })).toEqual({ kind: 'none' })
    expect(readingOf({ window: 200_000, tokens: 34_000, percent: 17 })).toEqual({
      kind: 'ok', percent: 17, tokens: 34_000, window: 200_000,
    })
  })
})

describe('abbreviate', () => {
  test('thousands below a million, millions from there', async () => {
    expect([34_000, 412_400, 1_000_000, 1_500_000].map(abbreviate)).toEqual(['34k', '412k', '1M', '1.5M'])
  })
})

describe('cellsOf', () => {
  test('the marks sit at 20, 30 and 40 and light up only once the fill reaches them', async () => {
    const cells = cellsOf(25, 50)
    expect(cells[10]).toEqual({ kind: 'mark', level: 'warn', at: 20, isLit: true })
    expect(cells[15]).toEqual({ kind: 'mark', level: 'high', at: 30, isLit: false })
    expect(cells[20]).toEqual({ kind: 'mark', level: 'critical', at: 40, isLit: false })
    expect(cells[12]).toEqual({ kind: 'fill' })
    expect(cells[13]).toEqual({ kind: 'rail', zone: 'warn' })
    expect(cells[17]).toEqual({ kind: 'rail', zone: 'high' })
    expect(cells[30]).toEqual({ kind: 'rail', zone: 'low' })
  })

  test('the scale writes each number under its mark', async () => {
    expect(scaleOf(50).map(p => p.text).join('')).toBe(`${' '.repeat(10)}20   30   40`)
  })
})

describe('layoutOf', () => {
  const parts = { label: 'contexto', percent: ' 17% ', tokens: '34k/200k' }

  test('a wide band keeps the label and the tokens', async () => {
    expect(layoutOf(80, parts)).toEqual({ label: true, tokens: true, width: 80 - 9 - 6 - 9 })
  })

  test('a narrow one drops the label first, then the tokens', async () => {
    expect(layoutOf(40, parts)).toMatchObject({ label: false, tokens: true })
    expect(layoutOf(26, parts)).toMatchObject({ label: false, tokens: false })
  })
})

describe('modelLineOf', () => {
  test('stays short and names the stretch, or says there is no reading', async () => {
    const line = modelLineOf({ kind: 'ok', percent: 31, tokens: 62_000, window: 200_000 })
    expect(line).toBe('[nzt-context] Context used: 31% (62k of 200k tokens), 30%+, say it plainly.')
    expect(line.length).toBeLessThan(120)
    expect(modelLineOf({ kind: 'none' })).toBe('[nzt-context] Context used: no reading yet.')
  })
})

/** Starts a session whose context the engine reports as `context`, and mounts the band. */
const mountBand = async (
  $: Parameters<TestBody>[0],
  on: Parameters<TestBody>[1],
  context: { tokens?: number; window: number; percent?: number },
  surface: 'terminal' | 'desktop' = 'terminal',
  options: { columns?: number; hasSurvey?: boolean; isWorking?: boolean } = {},
) => {
  on('session.start', async (_, e) => ({ cwd: e.cwd }))
  on('session.usage', async () => ({ value: { startedAt: 0, context, rateLimits: [] } }))
  await $.session.start({ cwd: '/project', surface, isInteractive: true })
  const columns = options.columns ?? 80
  return $.ui.mount({
    plugin: 'nzt-context',
    surface,
    component: 'AbovePrompt',
    viewport: { columns: columns + 5, rows: 40 },
    props: band(columns, options.hasSurvey, options.isWorking),
  })
}

type Mounted = Awaited<ReturnType<typeof mountBand>>
type Query = Parameters<Mounted['find']>[0]

/** Finds in what the animated bar drew, or in the plugin's own tree when the bar is still. */
const seek = async (ui: Mounted, query: Query) =>
  (await ui.find({ ...query, in: 'bar' }).catch(() => undefined)) ?? ui.find(query)

const band = (columns: number, hasSurvey = false, isWorking = false) => ({
  hasSurvey,
  isWorking,
  maxRows: 20,
  bodyColumns: columns,
  scroll: { offset: 0, bodyRows: 19 },
  view: {},
})

test('the band shows the bar, the percentage and the tokens, on both surfaces', async ($, on) => {
  const context = { tokens: 34_000, window: 200_000, percent: 17 }
  on('session.start', async (_, e) => ({ cwd: e.cwd }))
  on('session.usage', async () => ({ value: { startedAt: 0, context, rateLimits: [] } }))
  for (const surface of ['terminal', 'desktop'] as const) {
    await $.session.start({ cwd: '/project', surface, isInteractive: true })
    const ui = await $.ui.mount({
      plugin: 'nzt-context',
      surface,
      component: 'AbovePrompt',
      viewport: { columns: 85, rows: 40 },
      props: band(80),
    })
    expect(await seek(ui, { type: 'Text', text: /^contexto $/ })).toBeDefined()
    expect(await seek(ui, { type: 'Text', text: /^ 17% $/ })).toBeDefined()
    expect(await seek(ui, { type: 'Text', text: /34k\/200k/ })).toBeDefined()
    expect(await seek(ui, { type: 'Text', text: /^ *20$/ })).toBeDefined()
    expect(await seek(ui, { type: 'Text', text: /^ *40$/ })).toBeDefined()
    await ui.unmount()
  }
})

test('before any reading the band says so and draws no 0%', async ($, on) => {
  const ui = await mountBand($, on, { window: 200_000 })
  expect(await seek(ui, { type: 'Text', text: /sin lectura todavía/ })).toBeDefined()
  expect(await seek(ui, { type: 'Text', text: /%/ })).toBeUndefined()
  await ui.unmount()
})

test('a fill past 40 draws the percentage on red, with every mark lit', async ($, on) => {
  const ui = await mountBand($, on, { tokens: 84_000, window: 200_000, percent: 42 })
  const percent = await seek(ui, { type: 'Text', text: /^ 42% $/ })
  expect(percent?.props).toMatchObject({ backgroundColor: 'error', bold: true })
  expect((await seek(ui, { type: 'Text', text: /^ *20$/ }))?.props).toMatchObject({ color: 'warning' })
  expect((await seek(ui, { type: 'Text', text: /^ *40$/ }))?.props).toMatchObject({ color: 'error' })
  await ui.unmount()
})

test('a mark not reached stays grey', async ($, on) => {
  const ui = await mountBand($, on, { tokens: 50_000, window: 200_000, percent: 25 })
  expect((await seek(ui, { type: 'Text', text: /^ 25% $/ }))?.props).toMatchObject({ color: 'warning' })
  expect((await seek(ui, { type: 'Text', text: /^ *30$/ }))?.props).toMatchObject({ color: 'inactive' })
  await ui.unmount()
})

test('the rail not yet filled shows the 20–40 zone tinted, and the marks as their glyphs', async ($, on) => {
  const ui = await mountBand($, on, { tokens: 24_000, window: 200_000, percent: 12 })
  expect((await seek(ui, { type: 'Text', text: /^━+$/ }))?.props).toMatchObject({ color: 'inactive' })
  expect((await seek(ui, { type: 'Text', text: /^┄+$/ }))?.props).toMatchObject({ color: 'warning', dimColor: true })
  expect((await seek(ui, { type: 'Text', text: /^─+$/ }))?.props).toMatchObject({ color: 'inactive', dimColor: true })
  expect(await seek(ui, { type: 'Text', text: /┃/ })).toBeUndefined()
  expect(await seek(ui, { type: 'Text', text: /^╂$/ })).toBeDefined()
  await ui.unmount()
})

test('a reached mark is drawn lit in its stretch colour', async ($, on) => {
  const ui = await mountBand($, on, { tokens: 46_000, window: 200_000, percent: 23 })
  expect((await seek(ui, { type: 'Text', text: /^┃$/ }))?.props).toMatchObject({ color: 'warning', bold: true })
  expect((await seek(ui, { type: 'Text', text: /^━+$/ }))?.props).toMatchObject({ color: 'warning' })
  await ui.unmount()
})

test('while a survey holds the band, the mod draws nothing of its own', async ($, on) => {
  on('ui.render', async ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>survey</Text>
  })
  const ui = await mountBand($, on, { tokens: 34_000, window: 200_000, percent: 17 }, 'terminal', {
    hasSurvey: true,
  })
  expect(await seek(ui, { type: 'Text', text: /17%/ })).toBeUndefined()
  expect(await seek(ui, { type: 'Text', text: /^survey$/ })).toBeDefined()
  await ui.unmount()
})

test('with language en the band speaks English', { options: { language: 'en' } }, async ($, on) => {
  const ui = await mountBand($, on, { window: 200_000 })
  expect(await seek(ui, { type: 'Text', text: /no reading yet/ })).toBeDefined()
  await ui.unmount()
})

test('a measurement the engine pushes redraws the band', async ($, on) => {
  on('session.measure', async (_, e) => ({ changed: e.changed }))
  const ui = await mountBand($, on, { tokens: 34_000, window: 200_000, percent: 17 })
  await $.session.measure({
    context: { tokens: 64_000, window: 200_000, percent: 32 },
    rateLimits: [],
    changed: ['context'],
  })
  await ui.advance(500)
  expect(await seek(ui, { type: 'Text', text: /^ 32% $/ })).toBeDefined()
  await ui.unmount()
})

const measure = ($: Parameters<TestBody>[0], percent: number) =>
  $.session.measure({
    context: { tokens: percent * 2_000, window: 200_000, percent },
    rateLimits: [],
    changed: ['context'],
  })

test('a new figure moves the fill from the old one, and lands on it', async ($, on) => {
  on('session.measure', async (_, e) => ({ changed: e.changed }))
  const ui = await mountBand($, on, { tokens: 20_000, window: 200_000, percent: 10 })
  await measure($, 18)
  expect(await seek(ui, { type: 'Text', text: /^ 10% $/ })).toBeDefined()
  await ui.advance(150)
  const between = await seek(ui, { type: 'Text', text: /^ 1\d% $/ })
  expect(between?.text).not.toBe(' 10% ')
  expect(between?.text).not.toBe(' 18% ')
  await ui.advance(400)
  expect(await seek(ui, { type: 'Text', text: /^ 18% $/ })).toBeDefined()
  await ui.unmount()
})

test('a mark crossed upwards blinks, then stays lit', async ($, on) => {
  on('session.measure', async (_, e) => ({ changed: e.changed }))
  const ui = await mountBand($, on, { tokens: 30_000, window: 200_000, percent: 15 })
  await measure($, 22)
  await ui.advance(600)
  expect((await seek(ui, { type: 'Text', text: /^ *20$/ }))?.props).toMatchObject({ color: 'inactive' })
  await ui.advance(450)
  expect((await seek(ui, { type: 'Text', text: /^ *20$/ }))?.props).toMatchObject({ color: 'warning' })
  await ui.unmount()
})

test('while a turn works a bright stretch runs along the fill, and not otherwise', async ($, on) => {
  const working = await mountBand($, on, { tokens: 50_000, window: 200_000, percent: 25 }, 'terminal', {
    isWorking: true,
  })
  await working.advance(200)
  const fills = await working.findAll({ type: 'Text', text: /^━+$/, in: 'bar' })
  expect(fills.some(f => f.props?.color === 'text')).toBe(true)
  await working.unmount()
})

test('an idle band draws no bright stretch', async ($, on) => {
  const idle = await mountBand($, on, { tokens: 50_000, window: 200_000, percent: 25 })
  await idle.advance(200)
  const fills = await idle.findAll({ type: 'Text', text: /^━+$/, in: 'bar' })
  expect(fills.every(f => f.props?.color === 'warning')).toBe(true)
  await idle.unmount()
})

test('past 40 the pill pulses between its red background and none', async ($, on) => {
  const ui = await mountBand($, on, { tokens: 84_000, window: 200_000, percent: 42 })
  expect((await seek(ui, { type: 'Text', text: /^ 42% $/ }))?.props).toMatchObject({ backgroundColor: 'error' })
  await ui.advance(750)
  const off = await seek(ui, { type: 'Text', text: /^ 42% $/ })
  expect(off?.props?.backgroundColor).toBeUndefined()
  expect(off?.props).toMatchObject({ color: 'error' })
  await ui.advance(750)
  expect((await seek(ui, { type: 'Text', text: /^ 42% $/ }))?.props).toMatchObject({ backgroundColor: 'error' })
  await ui.unmount()
})

test('with animations off the band is drawn still, without the animated region', { options: { animations: 'off' } }, async ($, on) => {
  const ui = await mountBand($, on, { tokens: 84_000, window: 200_000, percent: 42 }, 'terminal', { isWorking: true })
  expect(await ui.find({ type: 'Client' })).toBeUndefined()
  expect((await ui.find({ type: 'Text', text: /^ 42% $/ }))?.props).toMatchObject({ backgroundColor: 'error' })
  await ui.unmount()
})

type Fill = { context: { tokens?: number; window: number; percent?: number } }

/** Answers the engine's figures from `fill`, which the test moves; call before the first `$`. */
const reportFill = (on: Parameters<TestBody>[1], fill: Fill) => {
  on('session.start', async (_, e) => ({ cwd: e.cwd }))
  on('session.usage', async () => ({ value: { startedAt: 0, context: fill.context, rateLimits: [] } }))
}

const start = ($: Parameters<TestBody>[0]) =>
  $.session.start({ cwd: '/project', surface: 'terminal', isInteractive: true })

/** A prompt typed at the terminal. */
const typed = (text: string) => ({ text, wait: false, origin: { kind: 'composer' } as const })

test('each prompt carries the context line for the model, after what was typed', async ($, on) => {
  const fill: Fill = { context: { tokens: 46_000, window: 200_000, percent: 23 } }
  const seen: (readonly string[] | undefined)[] = []
  reportFill(on, fill)
  on('prompt.submit', async (_, e) => {
    seen.push(e.context)
    return { text: e.text, context: e.context }
  })
  await start($)
  await $.prompt.submit(typed('seguí'))
  fill.context = { window: 200_000 }
  await $.prompt.submit(typed('otra'))
  expect(seen).toEqual([
    ['[nzt-context] Context used: 23% (46k of 200k tokens), 20%+, recommend clearing.'],
    ['[nzt-context] Context used: no reading yet.'],
  ])
})

test('a mark crossed mid-turn reaches the model once, with the next tool result', async ($, on) => {
  const fill: Fill = { context: { tokens: 30_000, window: 200_000, percent: 15 } }
  reportFill(on, fill)
  on('prompt.submit', async (_, e) => ({ text: e.text, context: e.context }))
  on('tool.call', async () => ({ result: 'ok' }))
  await start($)
  await $.prompt.submit(typed('hacé la tanda'))

  const call = () => $.tool.call({ tool: 'Read', file_path: '/project/a.ts' })
  expect((await call()).context).toBeUndefined()
  fill.context = { tokens: 62_000, window: 200_000, percent: 31 }
  expect((await call()).context).toEqual([
    '[nzt-context] Context crossed a mark: now 31% (62k of 200k tokens), 30%+, say it plainly.',
  ])
  fill.context = { tokens: 66_000, window: 200_000, percent: 33 }
  expect((await call()).context).toBeUndefined()
})
