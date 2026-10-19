import { expect, test } from 'claude-code/testing'

import { paletteOf } from './prefs'
import { diffstatOf, outputTextOf, shortPath, targetOf, timeOf } from './tools'
import { start, world } from './world.test-kit'
import type { Engine } from './world.test-kit'

test('a row says what the call was about in one line', async () => {
  expect(targetOf('Bash', { command: 'pnpm test --filter hub\necho done' }, null)).toBe('pnpm test --filter hub')
  expect(targetOf('Edit', { file_path: 'C:\\repo\\apps\\hub\\src\\server.ts' }, 'C:\\repo')).toBe('apps/hub/src/server.ts')
  expect(targetOf('Grep', { pattern: 'limit', path: '/repo/src' }, '/repo')).toBe('limit · src')
  expect(targetOf('mcp__github__create_issue', {}, null)).toBe('')
  expect(shortPath('/elsewhere/a.ts', '/repo')).toBe('/elsewhere/a.ts')
})

test('lines added and removed come from the patch the edit reported', async () => {
  const output = { structuredPatch: [{ lines: [' a', '-b', '+c', '+d'] }] }
  expect(diffstatOf('Edit', {}, output)).toEqual({ added: 2, removed: 1 })
  expect(diffstatOf('Write', { content: 'x\ny\nz' }, undefined)).toEqual({ added: 3, removed: 0 })
  expect(diffstatOf('Read', {}, {})).toBeNull()
})

test('what an opened row shows is the text, not the record', async () => {
  expect(outputTextOf('Read', { type: 'text', file: { content: 'line 1\nline 2' } })).toBe('line 1\nline 2')
  expect(outputTextOf('Bash', { stdout: 'ok', stderr: '' })).toBe('ok')
  expect(timeOf(400)).toBe('0.4s')
  expect(timeOf(41_000)).toBe('41s')
  expect(timeOf(64_000)).toBe('1m 4s')
})

const mountRow = ($: Engine, surface: 'terminal' | 'desktop', props: Record<string, unknown>) =>
  $.ui.mount({
    plugin: 'nzt-look',
    surface,
    component: 'ToolUse',
    requestId: String(props.tool_use_id),
    viewport: { columns: 100, rows: 30 },
    props: { isRunning: false, isErrored: false, isInterrupted: false, ...props },
  } as never)

test('a finished edit shows its node, its name, its path and its lines, on both surfaces', async ($, on) => {
  world(on, { prefs: { variant: 'dark' } })
  await start($)
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await mountRow($, surface, {
      tool_use_id: 'e1',
      tool: 'Edit',
      input: { file_path: '/repo/apps/hub/src/server.ts', old_string: 'a', new_string: 'b\nc' },
      output: { structuredPatch: [{ lines: ['-a', '+b', '+c'] }] },
    })
    expect(await ui.find({ type: 'Text', text: ' Edit' })).toBeDefined()
    const targets = await ui.findAll({ type: 'Text', text: ' apps/hub/src/server.ts' })
    expect(targets.map(found => found.props.color)).toContain(paletteOf('nzt', [], 'dark').muted)
    expect(await ui.find({ type: 'Text', text: ' apps/hub/src/server.ts' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: '+2' })).toBeDefined()
    await ui.unmount()
  }
})

test('a call Claude Code cut says Interrupted, in Claude Code’s words', async ($, on) => {
  world(on)
  await start($)
  const ui = await mountRow($, 'terminal', { tool_use_id: 'c1', tool: 'Bash', input: { command: 'pnpm test' }, isInterrupted: true })
  expect(await ui.find({ type: 'Text', text: '◌' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: ' · Interrupted' })).toBeDefined()
})

test('a skill row names the tool once and the skill after it, on both surfaces', async ($, on) => {
  world(on)
  await start($)
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await mountRow($, surface, {
      tool_use_id: `s-${surface}`,
      tool: 'Skill',
      input: { skill: 'nzt-build', args: 'unidad 258' },
      output: { success: true, commandName: 'nzt-build' },
    })
    const row = await ui.find({ type: 'Text', text: /Skill/ })
    expect(row?.text).toMatch(/^(┃ )?\S+ Skill nzt-build$/)
    await ui.unmount()
  }
})

test('pressing the row itself opens and closes it, as ▸ does', async ($, on) => {
  world(on)
  await start($)
  const ui = await mountRow($, 'terminal', {
    tool_use_id: 'b1',
    tool: 'Bash',
    input: { command: 'pnpm test' },
    output: { stdout: 'todo bien', stderr: '' },
  })
  await ui.press({ key: 'row:b1' })
  expect(await ui.find({ type: 'Text', text: /todo bien/ })).toBeDefined()
  await ui.press({ key: 'row:b1' })
  expect(await ui.find({ type: 'Text', text: /todo bien/ })).toBeUndefined()
})

test('a target that would only repeat the tool name is left out', async () => {
  expect(targetOf('Skill', { skill: 'Skill' }, null)).toBe('')
  expect(targetOf('Skill', { command: 'nzt' }, null)).toBe('nzt')
})

test('▸ opens the input and the answer, and closes them again', async ($, on) => {
  world(on)
  await start($)
  const ui = await mountRow($, 'terminal', {
    tool_use_id: 'r1',
    tool: 'Read',
    input: { file_path: '/repo/README.md' },
    output: { type: 'text', file: { content: '# nzt\nhola' } },
  })
  expect(await ui.find({ type: 'Text', text: /hola/ })).toBeUndefined()
  await ui.press({ key: 'open:r1' })
  expect(await ui.find({ type: 'Text', text: /hola/ })).toBeDefined()
  await ui.press({ key: 'open:r1' })
  expect(await ui.find({ type: 'Text', text: /hola/ })).toBeUndefined()
})

test('a failed call opens by itself and shows its error whole', async ($, on) => {
  world(on)
  await start($)
  const ui = await mountRow($, 'terminal', {
    tool_use_id: 'b1',
    tool: 'Bash',
    input: { command: 'pnpm test' },
    isErrored: true,
    output: 'Exit code 1\nFAIL hub › limits',
  })
  expect(await ui.find({ type: 'Text', text: '✕' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /FAIL hub › limits/ })).toBeDefined()
})

test('the subagents and the tasks stay as Claude Code draws them', async ($, on) => {
  world(on)
  await start($)
  const ui = await mountRow($, 'terminal', { tool_use_id: 'a1', tool: 'Agent', input: { description: 'x' } })
  expect(await ui.find({ type: 'Text', text: 'claude-code' })).toBeDefined()
})

test('with the drawing off, a row is Claude Code’s own', async ($, on) => {
  world(on, { prefs: { isDrawing: false } })
  await start($)
  const ui = await mountRow($, 'terminal', { tool_use_id: 'r2', tool: 'Read', input: { file_path: '/repo/a' }, output: {} })
  expect(await ui.find({ type: 'Text', text: 'claude-code' })).toBeDefined()
})

test('reads in a run are one row that counts them, and ▸ unfolds them', async ($, on) => {
  world(on)
  await start($)
  const ui = await $.ui.mount({
    plugin: 'nzt-look',
    surface: 'terminal',
    component: 'ToolGroup',
    requestId: 'g1',
    props: {
      isActive: false,
      isExpanded: false,
      calls: [
        { tool: 'Read', input: {}, isRunning: false, isErrored: false, isInterrupted: false },
        { tool: 'Read', input: {}, isRunning: false, isErrored: false, isInterrupted: false },
        { tool: 'Grep', input: {}, isRunning: false, isErrored: false, isInterrupted: false },
      ],
    },
  } as never)
  expect(await ui.find({ type: 'Text', text: ' Read 2 · Grep 1' })).toBeDefined()
  await ui.press({ key: 'group:g1' })
  expect(await ui.find({ type: 'Text', text: 'claude-code' })).toBeDefined()
})

test('pressing the grouped row itself unfolds it, as ▸ does', async ($, on) => {
  world(on)
  await start($)
  const ui = await $.ui.mount({
    plugin: 'nzt-look',
    surface: 'terminal',
    component: 'ToolGroup',
    requestId: 'g2',
    props: { isActive: false, isExpanded: false, calls: [{ tool: 'Read', input: {}, isRunning: false, isErrored: false, isInterrupted: false }] },
  } as never)
  await ui.press({ key: 'row:group:g2' })
  expect(await ui.find({ type: 'Text', text: 'claude-code' })).toBeDefined()
})
