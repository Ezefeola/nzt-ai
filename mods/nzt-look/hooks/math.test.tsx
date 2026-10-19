import { expect, test } from 'claude-code/testing'

import { displayOf, inlineOf, withInlineMath } from './math'
import { start, world } from './world.test-kit'
import type { Engine } from './world.test-kit'

test('inline: Greek, operators, scripts in Unicode, a fraction on one row', async () => {
  expect(inlineOf('\\alpha \\leq \\beta^2')).toBe('α ≤ β²')
  expect(inlineOf('x_i + y_{n}')).toBe('xᵢ + yₙ')
  expect(inlineOf('\\frac{a+b}{2}')).toBe('(a + b)/2')
  expect(inlineOf('\\sum_{i=1}^{n} i')).toBe('∑ᵢ₌₁ⁿ i')
})

test('display: a fraction stacked, centred over its line', async () => {
  expect(displayOf('\\frac{a}{b+c}')?.lines).toEqual(['   a', '───────', ' b + c'])
})

test('display: a sum with its limits above and below the sign', async () => {
  const block = displayOf('\\sum_{i=1}^{n} x_i')!
  expect(block.lines).toEqual(['  n', '  ∑   xᵢ', 'i = 1'])
})

test('a formula it cannot read is left as written', async () => {
  expect(displayOf('\\frac{a}{b')).toBeNull()
  expect(inlineOf('\\unknowncommand x')).toBeNull()
  expect(withInlineMath('cuesta $\\weird{x}$ hoy')).toBe('cuesta $\\weird{x}$ hoy')
})

test('prices and code spans are not formulas', async () => {
  expect(withInlineMath('Cuesta $1.84 y $3 más')).toBe('Cuesta $1.84 y $3 más')
  expect(withInlineMath('usá `$x^2$` así, o $x^2$')).toBe('usá `$x^2$` así, o x²')
})

const mountReply = ($: Engine, text: string, id: string) =>
  $.ui.mount({
    plugin: 'nzt-look',
    surface: 'terminal',
    component: 'AssistantMessage',
    requestId: id,
    viewport: { columns: 100, rows: 40 },
    props: { text, isFirstOfReply: true },
  } as never)

test('a display formula is a card; inline ones reach the prose in Unicode', async ($, on) => {
  world(on)
  await start($)
  const ui = await mountReply($, 'La media es $\\bar{x}$... no, es $\\mu^2$:\n\n$$\n\\frac{a}{b}\n$$', 'f1')
  expect(await ui.find({ type: 'Text', text: '───' })).toBeDefined()
  expect(await ui.find({ type: 'Markdown', text: /es μ²/ })).toBeDefined()
})
