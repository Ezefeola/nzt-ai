import { expect, test } from 'claude-code/testing'

import { highlight } from './highlight'
import { start, world } from './world.test-kit'
import type { Engine } from './world.test-kit'

const kindsOf = (code: string, language: string) =>
  highlight(code, language)?.flat().filter(token => token.kind !== 'plain').map(token => `${token.kind}:${token.text.trim()}`)

test('TypeScript: keywords, strings, numbers, comments, functions and types', async () => {
  expect(kindsOf('const limit: Limit = load("hub", 60) // per minute', 'ts')).toEqual([
    'keyword:const',
    'type:Limit',
    'function:load',
    'string:"hub"',
    'number:60',
    'comment:// per minute',
  ])
})

test('Python, the shell and JSON have their own rules', async () => {
  expect(kindsOf('def run(x):  # go\n    return "ok"', 'python')).toEqual(['keyword:def', 'function:run', 'comment:# go', 'keyword:return', 'string:"ok"'])
  expect(kindsOf('echo $HOME --verbose', 'bash')).toEqual(['keyword:echo', 'variable:$HOME', 'property:--verbose'])
  expect(kindsOf('{"limit": 60, "on": true}', 'json')).toEqual(['property:"limit"', 'number:60', 'property:"on"', 'keyword:true'])
})

test('a language it does not know is null, and Claude Code keeps drawing it', async () => {
  expect(highlight('x', 'brainfuck')).toBeNull()
})

const mountReply = ($: Engine, surface: 'terminal' | 'desktop', text: string, id: string) =>
  $.ui.mount({
    plugin: 'nzt-look',
    surface,
    component: 'AssistantMessage',
    requestId: id,
    viewport: { columns: 100, rows: 80 },
    props: { text, isFirstOfReply: true },
  } as never)

test('a code block is framed with its language, highlighted, and numbered on the desktop', async ($, on) => {
  world(on)
  await start($)
  const text = 'Así:\n\n```ts\nconst a = 1\n```'
  const term = await mountReply($, 'terminal', text, 'c1')
  expect(await term.find({ type: 'Text', text: 'ts' })).toBeDefined()
  expect(await term.find({ type: 'Text', text: 'const' })).toBeDefined()
  const desk = await mountReply($, 'desktop', text, 'c2')
  expect(await desk.find({ type: 'Text', text: '1  ' })).toBeDefined()
})

test('code past 24 lines folds with how many are left', async ($, on) => {
  world(on)
  await start($)
  const body = Array.from({ length: 30 }, (_, i) => `let v${i} = ${i}`).join('\n')
  const ui = await mountReply($, 'terminal', `\`\`\`js\n${body}\n\`\`\``, 'c3')
  expect(await ui.find({ key: 'block:c3:0:more' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'v28' })).toBeUndefined()
})

test('a shell block on the desktop keeps Claude Code’s own, with its Run button', async ($, on) => {
  world(on)
  await start($)
  const ui = await mountReply($, 'desktop', '```bash\nnpm test\n```', 'c4')
  expect(await ui.find({ type: 'Text', text: 'claude-code' })).toBeDefined()
})

// A query by text also matches the line that holds the token, so the token's color is among those found.
const colorsOf = async (ui: { findAll: (query: { type: string; text: string }) => Promise<{ props: Record<string, unknown> }[]> }, text: string) =>
  (await ui.findAll({ type: 'Text', text })).map(found => found.props.color)

test('nzt paints each part of the code its own color on the block’s background; another theme uses its keys', async ($, on) => {
  world(on, { prefs: { variant: 'dark' } })
  await start($)
  const text = '```ts\nconst limiter = rateLimit({ max: 60 })\n```'
  const nzt = await mountReply($, 'terminal', text, 'n1')
  expect(await colorsOf(nzt, 'const')).toContain('#62c4a8')
  expect(await colorsOf(nzt, 'rateLimit')).toContain('#9fd4e0')
  expect(await colorsOf(nzt, '60')).toContain('#e0a08f')
  expect((await nzt.findAll({ type: 'Box' })).some(box => box.props.backgroundColor === '#0a1514')).toBe(true)
  await nzt.unmount()
})

test('a theme with no code colors highlights with its palette keys', async ($, on) => {
  world(on, { prefs: { theme: 'dracula', variant: 'dark' } })
  await start($)
  const ui = await mountReply($, 'terminal', '```ts\nconst a = 1\n```', 'n2')
  expect(await colorsOf(ui, 'const')).toContain('#bd93f9')
  expect((await ui.findAll({ type: 'Box' })).some(box => box.props.backgroundColor === '#0a1514')).toBe(false)
})
