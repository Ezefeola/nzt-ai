import { expect, test } from 'claude-code/testing'

import { colorize, diffLinesOf, shellModelOf } from './shell'
import { paletteOf } from './prefs'
import { start, world } from './world.test-kit'
import type { Engine } from './world.test-kit'

const palette = paletteOf('nzt', [], 'dark')

test('a failed command reads its exit code from the text the agent got', async () => {
  expect(shellModelOf({ command: 'pnpm test' }, 'Exit code 2\nFAIL limits', true)).toEqual({
    command: 'pnpm test',
    stdout: [],
    stderr: ['FAIL limits'],
    exit: 2,
  })
})

test('a command in the background or an image stays as Claude Code draws it', async () => {
  expect(shellModelOf({ command: 'npm run dev' }, { stdout: '', stderr: '', backgroundTaskId: 'b1' }, false)).toBeNull()
})

test('output is colored: errors, warnings, successes, paths and numbers', async () => {
  const runs = colorize('FAIL src/hub.test.ts:12 after 340ms, 1 warning', palette)
  const colorOf = (text: string) => runs.find(run => run.text === text)?.color
  expect(colorOf('FAIL')).toBe(palette.err)
  expect(colorOf('src/hub.test.ts:12')).toBe(palette.read)
  expect(colorOf('340ms')).toBe(palette.user)
  expect(colorOf('warning')).toBe(palette.warn)
})

test("an edit's patch numbered on both sides", async () => {
  const lines = diffLinesOf({ structuredPatch: [{ oldStart: 10, newStart: 10, lines: [' a', '-b', '+c'] }] })
  expect(lines).toEqual([
    { kind: 'same', text: 'a', oldNo: 10, newNo: 10 },
    { kind: 'del', text: 'b', oldNo: 11, newNo: null },
    { kind: 'add', text: 'c', oldNo: null, newNo: 11 },
  ])
})

/** A session whose shell answers each call with the result given for it. */
const shellWorld = (on: Parameters<typeof world>[0], results: Record<string, unknown>) => {
  world(on)
  on('tool.call', async (_, e) => ({ result: results[(e as { tool_use_id: string }).tool_use_id] }) as never)
}

const callShell = ($: Engine, id: string) => $.tool.call({ tool: 'Bash', tool_use_id: id, command: 'pnpm test --filter hub' } as never)

const mountResult = ($: Engine, surface: 'terminal' | 'desktop', id: string, tool: string, output: unknown, isErrored = false) =>
  $.ui.mount({
    plugin: 'nzt-look',
    surface,
    component: 'ToolResult',
    requestId: id,
    viewport: { columns: 100, rows: 40 },
    props: { tool_use_id: id, tool, output, isErrored },
  } as never)

test('a command that ran shows its card: the command, ✓ and the output, on both surfaces', async ($, on) => {
  const output = { stdout: 'PASS hub\n12 tests', stderr: '', interrupted: false }
  shellWorld(on, { s1: output })
  await start($)
  await callShell($, 's1')
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await mountResult($, surface, 's1', 'Bash', output)
    expect(await ui.find({ type: 'Text', text: 'pnpm test --filter hub' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: '✓' })).toBeDefined()
    await ui.unmount()
  }
})

test('long output folds to 8 + 4 lines, and ▾ unfolds it', async ($, on) => {
  const output = { stdout: Array.from({ length: 30 }, (_, i) => `line ${i + 1}`).join('\n'), stderr: '', interrupted: false }
  shellWorld(on, { s2: output })
  await start($)
  await callShell($, 's2')
  const ui = await mountResult($, 'terminal', 's2', 'Bash', output)
  expect(await ui.find({ key: 'shell:s2:out:more' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'line 15' })).toBeUndefined()
  await ui.press({ key: 'shell:s2:out:more' })
  expect(await ui.find({ type: 'Text', text: 'line 15' })).toBeDefined()
})

test('a failed command shows ✗ with its code and the whole error', async ($, on) => {
  const output = `Exit code 1\n${Array.from({ length: 20 }, (_, i) => `err ${i + 1}`).join('\n')}`
  shellWorld(on, { s3: output })
  await start($)
  await callShell($, 's3')
  const ui = await mountResult($, 'terminal', 's3', 'Bash', output, true)
  expect(await ui.find({ type: 'Text', text: '✗ exit 1' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'err 15' })).toBeDefined()
})

test('a command with no output says so', async ($, on) => {
  const output = { stdout: '', stderr: '', interrupted: false }
  shellWorld(on, { s4: output })
  await start($)
  await callShell($, 's4')
  const ui = await mountResult($, 'terminal', 's4', 'Bash', output)
  expect(await ui.find({ type: 'Text', text: 'sin salida' })).toBeDefined()
})

test('an edit is a numbered diff card, highlighted as its language, on both surfaces', async ($, on) => {
  world(on)
  await start($)
  const output = { filePath: '/repo/apps/hub/server.ts', structuredPatch: [{ oldStart: 1, newStart: 1, lines: ['-a', "+const limit = 'x'", '+c'] }] }
  for (const surface of ['desktop', 'terminal'] as const) {
    const ui = await mountResult($, surface, `d-${surface}`, 'Edit', output)
    expect(await ui.find({ type: 'Text', text: 'apps/hub/server.ts' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: '+2' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: '1 ' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: 'const' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: "'x'" })).toBeDefined()
    await ui.unmount()
  }
})

test('an edit in a language the highlighter does not know keeps the diff colors, unhighlighted', async ($, on) => {
  world(on)
  await start($)
  const output = { filePath: '/repo/build.zig', structuredPatch: [{ oldStart: 1, newStart: 1, lines: ['+const a = 1;'] }] }
  const ui = await mountResult($, 'terminal', 'z1', 'Edit', output)
  expect(await ui.find({ type: 'Text', text: 'const a = 1;' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: '+ ' })).toBeDefined()
})

test('with diffs switched off, an edit is Claude Code’s own', async ($, on) => {
  world(on, { prefs: { parts: { diffs: false } } })
  await start($)
  const output = { filePath: '/repo/a.ts', structuredPatch: [{ oldStart: 1, newStart: 1, lines: ['+b'] }] }
  const ui = await mountResult($, 'terminal', 'o1', 'Edit', output)
  expect(await ui.find({ type: 'Text', text: 'claude-code' })).toBeDefined()
})
