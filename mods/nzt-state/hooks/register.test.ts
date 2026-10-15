import { describe, expect, test } from 'claude-code/testing'
import type { TestBody } from 'claude-code/testing'

import { parseState } from './parse'
import { idOf, PHASES, timelineOf } from './phases'
import {
  animatedSvgOf,
  cellsOf,
  FRAMES,
  frameOf,
  HEIGHT,
  MINI_WIDTH,
  miniOf,
  PALETTE,
  WIDTH,
} from './sprites'

describe('timelineOf', () => {
  test('with phases in the state it draws them as written, in that order', async () => {
    const steps = timelineOf(
      [
        { name: 'architecture', status: 'done' },
        { name: 'build', status: 'doing' },
        { name: 'ux', status: 'dropped' },
        { name: 'verify', status: 'todo' },
      ],
      null,
      false,
    )
    expect(steps.map(s => `${s.label}=${s.status}`)).toEqual([
      'Arquitectura=done',
      'Build=doing',
      'UX=dropped',
      'Verificación=todo',
    ])
  })

  test('an older state with only phase gets all six, the earlier ones done', async () => {
    const steps = timelineOf(null, 'architecture', false)
    expect(steps.map(s => s.status)).toEqual(['done', 'doing', 'todo', 'todo', 'todo', 'todo'])
  })

  test('an older state whose plan is complete closes every phase', async () => {
    expect(timelineOf(null, 'architecture', true).every(s => s.status === 'done')).toBe(true)
  })
})

const STATE = JSON.stringify({
  version: 1,
  updated: '2026-10-13T10:00:00Z',
  goal: 'Ship the pane',
  phases: [
    { name: 'analysis', status: 'done', units: [
      { id: 1, do: 'Write the parser', status: 'done' },
      { id: 4, do: 'Old idea', status: 'dropped' },
    ] },
    { name: 'build', status: 'doing', units: [
      { id: 2, do: 'Draw the pane', status: 'doing', detail: 'header drawn' },
    ] },
    { name: 'verify', status: 'todo', units: [
      { id: 3, do: 'Write the tests', status: 'todo' },
    ] },
  ],
  approved: true,
  waiting_on: null,
  notes: ['keep it small'],
})

describe('parseState', () => {
  test('reads the plan and its units', async () => {
    const state = parseState(STATE)
    expect(state.kind).toBe('ok')
    if (state.kind !== 'ok') return
    expect(state.phases?.map(p => p.status)).toEqual(['done', 'doing', 'todo'])
    expect(state.legacyPhase).toBe(null)
    expect(state.approved).toBe(true)
    expect(state.units.map(u => `${u.id}:${u.phase}`)).toEqual([
      '1:analysis',
      '4:analysis',
      '2:build',
      '3:verify',
    ])
    expect(state.autonomy).toEqual({ units: [], keepStops: [] })
  })

  test('a state from before D62 keeps its units at the top, with no phase', async () => {
    const state = parseState(
      JSON.stringify({
        phases: [{ name: 'build', status: 'doing' }],
        units: [{ id: 9, do: 'Old shape', status: 'todo' }],
      }),
    )
    if (state.kind !== 'ok') throw new Error(state.kind)
    expect(state.units).toEqual([
      { id: 9, do: 'Old shape', status: 'todo', detail: undefined, phase: undefined },
    ])
  })

  test('reports broken JSON instead of throwing', async () => {
    expect(parseState('{ nope').kind).toBe('error')
  })
})

test('the pane draws the unit in progress and what comes next', async ($, on) => {
  on('fs.stat', async () => ({
    value: { kind: 'file', size: STATE.length, mtimeMs: 1, isLink: false },
  }))
  on('fs.read', async () => ({ value: STATE }))
  on('ui.open', async () => ({ value: { isPlaced: true } }))
  on('clock.now', async () => ({ value: Date.parse('2026-10-13T12:00:00Z') }))

  await $.command.run({
    command: 'nzt-state',
    args: '',
    origin: { kind: 'composer' },
    presentation: { isFullscreen: false, columns: 120 },
  })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({
      plugin: 'nzt-state',
      surface,
      component: 'Pane',
      requestId: 'nzt-state',
      viewport: { columns: 80, rows: 40 },
      props: {
        title: 'NZT state',
        isFocused: false,
        bodyColumns: 76,
        placement: 'dock',
        scroll: { offset: 0, bodyRows: 36 },
        view: {},
      },
    })
    expect(await ui.find({ type: 'Text', text: /Draw the pane/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /de 3 unidades hechas/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /^33%$/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /hace 2 h/ })).toBeDefined()

    // The timeline draws the run's own phases only, as state.json marks them.
    expect(await ui.find({ type: 'Text', text: /✓ Análisis/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /● Build/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /○ Verificación/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Arquitectura/ })).toBeUndefined()

    // Done and dropped units stay folded until pressed, and inside the section each phase
    // that is not in progress is folded too.
    expect(await ui.find({ type: 'Text', text: /Write the parser/ })).toBeUndefined()
    await ui.press({ key: 'toggle-done' })
    expect(await ui.find({ type: 'Text', text: /▸ Análisis · 1/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Write the parser/ })).toBeUndefined()
    await ui.press({ key: 'toggle-done-analysis' })
    expect(await ui.find({ type: 'Text', text: /Write the parser/ })).toBeDefined()
    await ui.press({ key: 'toggle-done-analysis' })
    await ui.press({ key: 'toggle-done' })
    expect(await ui.find({ type: 'Text', text: /DESCARTADAS/ })).toBeDefined()

    // Pending is grouped under its phase, folded while that phase is not in progress.
    expect(await ui.find({ type: 'Text', text: /▸ Verificación · 1/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Write the tests/ })).toBeUndefined()
    await ui.press({ key: 'toggle-todo-verify' })
    expect(await ui.find({ type: 'Text', text: /Write the tests/ })).toBeDefined()

    // The section folds as a whole too.
    await ui.press({ key: 'toggle-todo' })
    expect(await ui.find({ type: 'Text', text: /Write the tests/ })).toBeUndefined()
    await ui.press({ key: 'toggle-todo' })
    expect(await ui.find({ type: 'Text', text: /Write the tests/ })).toBeDefined()
    await ui.press({ key: 'toggle-todo-verify' })

    // No batch selected reads as accompanied, labelled.
    expect(await ui.find({ type: 'Text', text: /frena en cada unidad/ })).toBeDefined()

    // Notes stay folded too.
    expect(await ui.find({ type: 'Text', text: /keep it small/ })).toBeUndefined()
    await ui.press({ key: 'toggle-notes' })
    expect(await ui.find({ type: 'Text', text: /keep it small/ })).toBeDefined()
    await ui.press({ key: 'toggle-notes' })
    await ui.unmount()
  }
})

/** Starts a session in a project with or without Plan/state.json; answers the panes it opened. */
const startSession = async (
  $: Parameters<TestBody>[0],
  on: Parameters<TestBody>[1],
  hasState: boolean,
) => {
  const opened: string[] = []
  on('session.start', async (_, e) => ({ cwd: e.cwd }))
  on('command.register', async (_, e) => ({ value: { command: e.name } }))
  on('clock.every', async () => ({ value: undefined }))
  on('fs.stat', async () =>
    hasState
      ? { value: { kind: 'file', size: STATE.length, mtimeMs: 3, isLink: false } }
      : { deny: 'ENOENT' },
  )
  on('fs.read', async () => ({ value: STATE }))
  on('ui.open', async (_, e) => {
    opened.push(e.id)
    return { value: { isPlaced: true } }
  })
  await $.session.start({ cwd: '/project', surface: 'terminal', isInteractive: true })
  return opened
}

/** Mounts the pane on a surface, the terminal unless named, over a state.json with these contents. */
const mountPane = async (
  $: Parameters<TestBody>[0],
  on: Parameters<TestBody>[1],
  state: object,
  surface: 'terminal' | 'desktop' = 'terminal',
  bodyColumns = 76,
) => {
  const raw = JSON.stringify(state)
  on('fs.stat', async () => ({ value: { kind: 'file', size: raw.length, mtimeMs: 4, isLink: false } }))
  on('fs.read', async () => ({ value: raw }))
  on('ui.open', async () => ({ value: { isPlaced: true } }))
  on('clock.now', async () => ({ value: Date.parse('2026-10-13T12:00:00Z') }))
  await $.command.run({
    command: 'nzt-state',
    args: '',
    origin: { kind: 'composer' },
    presentation: { isFullscreen: false, columns: 120 },
  })
  return $.ui.mount({
    plugin: 'nzt-state',
    surface,
    component: 'Pane',
    requestId: 'nzt-state',
    viewport: { columns: 80, rows: 60 },
    props: {
      title: 'NZT',
      isFocused: false,
      bodyColumns,
      placement: 'dock',
      scroll: { offset: 0, bodyRows: 56 },
      view: {},
    },
  })
}

test('a status the kernel does not define is shown as invalid and counts nowhere', async ($, on) => {
  const parsed = parseState(
    JSON.stringify({
      phases: [{ name: 'build', status: 'running', units: [{ id: 2, do: 'B', status: 'in-progress' }] }],
    }),
  )
  if (parsed.kind !== 'ok') throw new Error(parsed.kind)
  expect(parsed.phases).toEqual([{ name: 'build', status: 'invalid', rawStatus: '"running"' }])
  expect(parsed.units[0]?.status).toBe('invalid')

  const ui = await mountPane($, on, {
    goal: 'Invalid',
    phases: [
      { name: 'build', status: 'doing', units: [
        { id: 1, do: 'Done one', status: 'done' },
        { id: 2, do: 'Typo one', status: 'in-progress' },
        { id: 3, do: 'Pending one', status: 'todo' },
      ] },
    ],
    approved: true,
  })
  expect(await ui.find({ type: 'Text', text: /1 con status inválido/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /status "in-progress"/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /^50%$/ })).toBeDefined()
  // The typo is not pending: the only pending row is unit 3.
  expect(await ui.find({ type: 'Text', text: /PENDIENTES · 1/ })).toBeDefined()
  await ui.unmount()
})

test('every unit in progress is shown, with a warning when there is more than one', async ($, on) => {
  const ui = await mountPane($, on, {
    goal: 'Two at once',
    phases: [
      { name: 'build', status: 'doing', units: [
        { id: 5, do: 'First in progress', status: 'doing' },
        { id: 6, do: 'Second in progress', status: 'doing' },
      ] },
    ],
    approved: true,
  })
  expect(await ui.find({ type: 'Text', text: /First in progress/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /Second in progress/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /2 unidades en curso/ })).toBeDefined()
  await ui.unmount()
})

test('every phase in progress is lit, with a warning when there is more than one', async ($, on) => {
  const ui = await mountPane($, on, {
    goal: 'Phases left open',
    phases: [
      { name: 'ux', status: 'doing', units: [{ id: 1, do: 'Mockup', status: 'done' }] },
      { name: 'verify', status: 'doing', units: [{ id: 2, do: 'Check it', status: 'doing' }] },
    ],
    approved: true,
  })
  expect(await ui.find({ type: 'Text', text: /^ ● UX $/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /^ ● Verificación $/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /2 fases en curso: el kernel permite una sola/ })).toBeDefined()
  await ui.unmount()
})

test('a single phase in progress draws no phase warning', async ($, on) => {
  const ui = await mountPane($, on, {
    goal: 'One phase',
    phases: [
      { name: 'ux', status: 'done', units: [{ id: 1, do: 'Mockup', status: 'done' }] },
      { name: 'verify', status: 'doing', units: [{ id: 2, do: 'Check it', status: 'doing' }] },
    ],
    approved: true,
  })
  expect(await ui.find({ type: 'Text', text: /fases en curso/ })).toBeUndefined()
  await ui.unmount()
})

test('a batch naming units that do not exist still finishes, and says which', async ($, on) => {
  const ui = await mountPane($, on, {
    goal: 'Ghost ids',
    phases: [
      { name: 'build', status: 'done', units: [
        { id: 4, do: 'A', status: 'done' },
        { id: 5, do: 'B', status: 'done' },
      ] },
    ],
    approved: true,
    autonomy: { units: [4, 5, 98, 99], keep_stops: [] },
  })
  expect(await ui.find({ type: 'Text', text: /tanda terminada/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /sin unidad: 98–99/ })).toBeDefined()
  await ui.unmount()
})

test('with language en the pane speaks English and keeps the state as written', { options: { language: 'en' } }, async ($, on) => {
  const ui = await mountPane($, on, JSON.parse(STATE))
  expect(await ui.find({ type: 'Text', text: /● approved/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /stops at every unit/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /of 3 units done/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /2 h ago/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /✓ Analysis/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /IN PROGRESS/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /▸ Verify · 1/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /Draw the pane/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /aprobado|EN CURSO|Análisis/ })).toBeUndefined()
  await ui.unmount()
})

test('the pending group of the phase in progress starts open, the others folded', async ($, on) => {
  const ui = await mountPane($, on, {
    goal: 'Groups',
    phases: [
      { name: 'build', status: 'doing', units: [
        { id: 1, do: 'Build now', status: 'doing' },
        { id: 2, do: 'Build next', status: 'todo' },
      ] },
      { name: 'verify', status: 'todo', units: [{ id: 3, do: 'Verify later', status: 'todo' }] },
    ],
    approved: true,
  })
  expect(await ui.find({ type: 'Text', text: /▾ Build · 1/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /Build next/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /▸ Verificación · 1/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /Verify later/ })).toBeUndefined()
  await ui.press({ key: 'toggle-todo-build' })
  expect(await ui.find({ type: 'Text', text: /Build next/ })).toBeUndefined()
  await ui.unmount()
})

describe('sprites', () => {
  test('every frame of every phase is the full grid, in letters the palette knows', async () => {
    for (const phase of [...PHASES.map(p => p.id), undefined]) {
      for (let tick = 0; tick < FRAMES; tick++) {
        const rows = frameOf(phase, tick)
        expect(rows.length).toBe(HEIGHT)
        for (const row of rows) {
          expect(row.length).toBe(WIDTH)
          for (const letter of row) expect(letter === '.' || PALETTE[letter] !== undefined).toBe(true)
        }
      }
    }
  })

  test('each phase wears a different hat', async () => {
    const hats = PHASES.map(p => frameOf(p.id, 0).slice(0, 4).join('\n'))
    expect(new Set(hats).size).toBe(PHASES.length)
  })

  test('build keeps the wrench on its helmet and raises a hammer that never touches it', async () => {
    for (let tick = 0; tick < FRAMES; tick++) {
      const rows = frameOf('build', tick)
      expect(rows.slice(0, 5).some(row => row.includes('ggg'))).toBe(true)
      // The hand ends where the handle starts; the head stands above it.
      expect(rows[7]!.slice(16, 19)).toBe('ooW')
      expect(rows[8]![18]).toBe('W')
      expect(rows[6]!.slice(17)).toBe('MMM')
      // Nothing of the helmet in the row above the head, nor beside it.
      expect(rows[5]!.slice(15).replace(/\./g, '')).toBe('')
    }
  })

  test('cells are base64 of three u32 per cell, half-block over the two pixels', async () => {
    const cells = cellsOf(['o.', 'k.'])
    const bytes = Uint8Array.from(atob(cells), c => c.charCodeAt(0))
    const words = new Uint32Array(bytes.buffer)
    expect(Array.from(words)).toEqual([0x2580, 0xd77757, 0x1a1a1a, 0x20, 0x01000000, 0x01000000])
  })
})

test('every phase has a mini hat of one terminal row; an unknown phase has none', async () => {
  for (const phase of PHASES) {
    const rows = miniOf(phase.id)
    expect(rows?.length).toBe(2)
    for (const row of rows ?? []) expect(row.length).toBe(MINI_WIDTH)
  }
  expect(miniOf(idOf('cleanup'))).toBeUndefined()
})

test('the desktop pane draws the same character and hats as SVG, within the size it takes', async ($, on) => {
  for (const phase of [...PHASES.map(p => p.id), undefined]) {
    expect(animatedSvgOf(phase, 5, 220).length).toBeLessThan(131072)
  }
  const ui = await mountPane($, on, JSON.parse(STATE), 'desktop')
  // Svg takes no key: found by type, and the terminal's cells are not there.
  expect(await ui.find({ type: 'Svg' })).toBeDefined()
  expect(await ui.find({ type: 'Raster' })).toBeUndefined()
  await ui.unmount()
})

test('the terminal pane draws the character of the phase in progress', async ($, on) => {
  const ui = await mountPane($, on, JSON.parse(STATE))
  expect(await ui.find({ type: 'Raster', key: 'character' })).toBeDefined()
  // One mini hat per step of the timeline: analysis, build, verify.
  expect(await ui.find({ type: 'Raster', key: 'mini-timeline-0' })).toBeDefined()
  expect(await ui.find({ type: 'Raster', key: 'mini-timeline-1' })).toBeDefined()
  expect(await ui.find({ type: 'Raster', key: 'mini-timeline-2' })).toBeDefined()
  expect(await ui.find({ type: 'Raster', key: 'mini-timeline-3' })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: /^Build$/ })).toBeDefined()
  await ui.unmount()
})

type Drawn = { type?: string; key?: string; props?: Record<string, unknown>; children?: unknown[] }

/** The innermost row that holds both the character and the Plan label, if one does. */
const rowWithCharacterAndPlan = (node: unknown): Drawn | undefined => {
  if (node === null || typeof node !== 'object') return undefined
  const el = node as Drawn
  for (const child of el.children ?? []) {
    const inner = rowWithCharacterAndPlan(child)
    if (inner !== undefined) return inner
  }
  const text = JSON.stringify(el)
  const holdsBoth = /"Plan"/.test(text) && /"character"|"type":"Svg"/.test(text)
  return el.type === 'Box' && el.props?.flexDirection === 'row' && holdsBoth ? el : undefined
}

test('the tab says what the pane is, and the heading keeps a blank row under it', async ($, on) => {
  const titles: string[] = []
  const raw = STATE
  on('fs.stat', async () => ({ value: { kind: 'file', size: raw.length, mtimeMs: 4, isLink: false } }))
  on('fs.read', async () => ({ value: raw }))
  on('ui.open', async (_, e) => {
    titles.push(e.title ?? '')
    return { value: { isPlaced: true } }
  })
  on('clock.now', async () => ({ value: Date.parse('2026-10-13T12:00:00Z') }))
  await $.command.run({
    command: 'nzt-state',
    args: '',
    origin: { kind: 'composer' },
    presentation: { isFullscreen: false, columns: 120 },
  })
  expect(titles).toEqual(['Estado'])

  const ui = await $.ui.mount({
    plugin: 'nzt-state',
    surface: 'terminal',
    component: 'Pane',
    requestId: 'nzt-state',
    viewport: { columns: 80, rows: 60 },
    props: { title: 'Estado', isFocused: false, bodyColumns: 76, placement: 'dock', scroll: { offset: 0, bodyRows: 56 }, view: {} },
  })
  const heading = await ui.find({ key: 'heading' })
  expect(heading?.props?.marginTop).toBe(1)
  expect(heading?.text).toBe(' NZT  Estado')
  await ui.unmount()
})

test('the notes section says they are there to resume the run', async ($, on) => {
  const ui = await mountPane($, on, JSON.parse(STATE))
  expect(await ui.find({ type: 'Text', text: /NOTAS PARA RETOMAR · 1/ })).toBeDefined()
  await ui.unmount()
})

test('the goal carries its label and sits above the phases', async ($, on) => {
  const ui = await mountPane($, on, JSON.parse(STATE))
  const texts = (await ui.findAll({ type: 'Text' })).map(found => found.text)
  const goal = texts.findIndex(text => /^Objetivo /.test(text))
  const phases = texts.findIndex(text => /✓ Análisis/.test(text))
  expect(goal).toBeGreaterThan(-1)
  expect(phases).toBeGreaterThan(goal)
  // Drawn like the units count: bold, in the terminal's own color.
  const goalText: string = JSON.parse(STATE).goal
  const text = (await ui.findAll({ type: 'Text' })).find(found => found.text === goalText)
  expect(text?.props).toMatchObject({ bold: true })
  expect(text?.props?.color).toBeUndefined()
  await ui.unmount()
})

test('a wide pane puts Plan and Mode to the left of the character', async ($, on) => {
  const ui = await mountPane($, on, JSON.parse(STATE), 'terminal', 43)
  const row = rowWithCharacterAndPlan(await ui.drawn())
  // The column starts right under the title, and the goal shares it with Plan and Mode.
  expect(row?.props?.alignItems).toBeUndefined()
  expect(JSON.stringify(row)).toContain('Objetivo')
  await ui.unmount()
})

test('a narrow pane stacks the character above Plan and Mode', async ($, on) => {
  const ui = await mountPane($, on, JSON.parse(STATE), 'terminal', 42)
  expect(rowWithCharacterAndPlan(await ui.drawn())).toBeUndefined()
  expect(await ui.find({ type: 'Raster', key: 'character' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /^Plan$/ })).toBeDefined()
  await ui.unmount()
})

test('the desktop pane puts Plan and Mode beside the character too', async ($, on) => {
  const ui = await mountPane($, on, JSON.parse(STATE), 'desktop', 60)
  expect(rowWithCharacterAndPlan(await ui.drawn())).toBeDefined()
  await ui.unmount()
})

test('a project with Plan/state.json opens the pane when the session starts', async ($, on) => {
  expect(await startSession($, on, true)).toEqual(['nzt-state'])
})

test('a project without Plan/state.json starts with the pane closed', async ($, on) => {
  expect(await startSession($, on, false)).toEqual([])
})

test('an autonomous batch reads as a range with its progress and kept stops', async ($, on) => {
  const batch = JSON.stringify({
    goal: 'Batch',
    phases: [{ name: 'build', status: 'doing' }],
    approved: true,
    units: [
      { id: 69, do: 'A', status: 'done' },
      { id: 70, do: 'B', status: 'done' },
      { id: 71, do: 'C', status: 'doing' },
      { id: 72, do: 'D', status: 'todo' },
    ],
    autonomy: { units: [69, 70, 71, 72], keep_stops: [71] },
    waiting_on: null,
    notes: [],
  })
  on('fs.stat', async () => ({
    value: { kind: 'file', size: batch.length, mtimeMs: 2, isLink: false },
  }))
  on('fs.read', async () => ({ value: batch }))
  on('ui.open', async () => ({ value: { isPlaced: true } }))
  on('clock.now', async () => ({ value: Date.parse('2026-10-13T12:00:00Z') }))

  await $.command.run({
    command: 'nzt-state',
    args: '',
    origin: { kind: 'composer' },
    presentation: { isFullscreen: false, columns: 120 },
  })

  const ui = await $.ui.mount({
    plugin: 'nzt-state',
    surface: 'terminal',
    component: 'Pane',
    requestId: 'nzt-state',
    viewport: { columns: 80, rows: 40 },
    props: {
      title: 'NZT',
      isFocused: false,
      bodyColumns: 76,
      placement: 'dock',
      scroll: { offset: 0, bodyRows: 36 },
      view: {},
    },
  })
  expect(await ui.find({ type: 'Text', text: /⚡ autónomo/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /69–72 sin frenar · 2 de 4 hechas · frena en 71/ })).toBeDefined()
  await ui.unmount()
})
