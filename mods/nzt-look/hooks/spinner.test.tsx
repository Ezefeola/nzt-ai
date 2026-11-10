import { expect, test } from 'claude-code/testing'

import { segmentsOf } from './markdown'
import { durationOf, figuresOf, pick, tokensOf } from './spinner'
import { start, world } from './world.test-kit'
import type { Engine } from './world.test-kit'

test('the word is one of the theme’s and stays the same for the same turn', async () => {
  const words = ['Pensando', 'Trabajando', 'Armando']
  expect(words).toContain(pick(words, '1000'))
  expect(pick(words, '1000')).toBe(pick(words, '1000'))
  expect(durationOf(41_000)).toBe('41s')
  expect(durationOf(64_000)).toBe('1m 4s')
})

test('the figures after the word are the time, the tokens and the effort, each once known', async () => {
  expect(figuresOf({ elapsedMs: 12_000, tokens: 300, effort: 'high' })).toBe(' (12s, 300 tokens, high effort)')
  expect(figuresOf({ elapsedMs: 3_000, tokens: 0, effort: null })).toBe(' (3s)')
  expect(figuresOf({ elapsedMs: null, tokens: 0, effort: null })).toBe('')
  expect(tokensOf(1_234)).toBe('1.2k')
  expect(tokensOf(48_400)).toBe('48k')
})

test("a command's `key: value` lines are pairs; three are needed", async () => {
  expect(segmentsOf('Total cost: $1.84\nAPI duration: 41s\nCode changes: 18 lines', { pairs: true }).map(s => s.kind)).toEqual(['pairs'])
  expect(segmentsOf('Nota: dos líneas\nOtra: así', { pairs: true }).map(s => s.kind)).toEqual(['prose'])
  expect(segmentsOf('Total cost: $1.84\nAPI duration: 41s\nCode changes: 18 lines').map(s => s.kind)).toEqual(['prose'])
})

const mount = ($: Engine, surface: 'terminal' | 'desktop', component: string, props: Record<string, unknown>, id = 'x1') =>
  $.ui.mount({ plugin: 'nzt-look', surface, component, requestId: id, viewport: { columns: 100, rows: 30 }, props } as never)

test('with the mod’s words chosen, the spinner says a word of the theme and moves on the terminal', async ($, on) => {
  world(on, { prefs: { words: 'theme' } })
  await start($)
  const ui = await mount($, 'terminal', 'Spinner', { word: 'Sauteing', message: null, suffix: '…', mode: 'thinking' })
  expect(await ui.find({ type: 'Text', text: 'Sauteing' })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: '…', in: 'spinner' } as never)).toBeDefined()
})

test('in calm mode the spinner is still, with the theme’s word', async ($, on) => {
  world(on, { prefs: { calm: true, words: 'theme' } })
  await start($)
  const ui = await mount($, 'terminal', 'Spinner', { word: 'Sauteing', message: null, suffix: '…', mode: 'thinking' })
  expect(await ui.find({ type: 'Text', text: '◇ ' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /^(Pensando|Trabajando|Armando|Midiendo|Ajustando)$/ })).toBeDefined()
})

test('by default the spinner says Claude Code’s word', async ($, on) => {
  world(on, { prefs: { calm: true } })
  await start($)
  const ui = await mount($, 'terminal', 'Spinner', { word: 'Sauteing', message: null, suffix: '…', mode: 'thinking' })
  expect(await ui.find({ type: 'Text', text: 'Sauteing' })).toBeDefined()
})

test('the desktop spinner shows the phase’s icon', async ($, on) => {
  world(on)
  await start($)
  const ui = await mount($, 'desktop', 'Spinner', { word: 'Working', message: null, suffix: '…', mode: 'tool-use' })
  expect(await ui.find({ type: 'Text', text: '▶ ' })).toBeDefined()
})

test('the footer is Claude Code’s own line, with the tools and the lines after it', async ($, on) => {
  world(on)
  on('tool.call', async () => ({ result: { type: 'update', structuredPatch: [{ lines: ['-a', '+b', '+c'] }] } }) as never)
  await start($)
  await $.tool.call({ tool: 'Edit', tool_use_id: 'e1', file_path: '/repo/a.ts', old_string: 'a', new_string: 'b\nc' } as never)
  const ui = await mount($, 'terminal', 'TurnDuration', { word: 'Baked', durationMs: 41_000 })
  expect(await ui.find({ type: 'Text', text: 'claude-code' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: ' · 1 herramienta · +2 −1' })).toBeDefined()
})

test('a turn that used no tools leaves Claude Code’s footer alone', async ($, on) => {
  world(on)
  await start($)
  const ui = await mount($, 'terminal', 'TurnDuration', { word: 'Baked', durationMs: 41_000 })
  expect(await ui.find({ type: 'Text', text: 'claude-code' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: / · / })).toBeUndefined()
})

test('the still spinner carries the turn’s time, tokens and effort after Claude Code’s word', async ($, on) => {
  const seen = world(on, { prefs: { calm: true } })
  on('turn.start', async (_, e) => ({ turnId: e.turnId }) as never)
  on('turn.step', async function* (_, e) {
    return { turnId: e.turnId, index: e.index, answer: '', toolUses: [], usage: { output_tokens: 300 } } as never
  })
  await start($)
  await $.turn.start({ text: 'hola', turnId: 't1' } as never)
  const stream = $.turn.step({ turnId: 't1', index: 0, model: 'claude-opus-5-5', effort: 'high', messageCount: 1 } as never)
  for await (const _ of stream) {
    // drained: only the step's usage matters here
  }
  await seen.clock.advance(12_000)
  const ui = await mount($, 'terminal', 'Spinner', { word: 'Sauteing', message: null, suffix: '…', mode: 'thinking' })
  expect(await ui.find({ type: 'Text', text: 'Sauteing' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: '… (12s, 300 tokens, high effort)' })).toBeDefined()
})

test('the person’s prompt is outlined on the terminal; a teammate’s message stays as it is', async ($, on) => {
  world(on)
  await start($)
  const mine = await mount($, 'terminal', 'UserMessage', { text: 'sumá límite', origin: { kind: 'composer' }, isExpanded: false }, 'u1')
  expect(await mine.find({ type: 'Text', text: 'sumá límite' })).toBeDefined()
  const theirs = await mount($, 'terminal', 'UserMessage', { text: 'hola', origin: { kind: 'peer' }, isExpanded: false }, 'u2')
  expect(await theirs.find({ type: 'Text', text: 'claude-code' })).toBeDefined()
})

test("a command's figures are a card of pairs", async ($, on) => {
  world(on)
  await start($)
  const ui = await mount($, 'terminal', 'CommandOutput', {
    command: 'cost',
    args: '',
    text: 'Total cost: $1.84\nAPI duration: 41s\nCode changes: 18 lines',
    isErrored: false,
  })
  expect(await ui.find({ type: 'Text', text: /Total cost/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: '$1.84 ' })).toBeDefined()
})
