import { describe, expect, test } from 'claude-code/testing'
import type { TestBody } from 'claude-code/testing'

import { GLOW_STEPS, glowOf, levelOf } from './glow'
import { nextModeOf, parseState, withDelegation } from './parse'
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
    // The unit in progress glows: where its text is drawn is each surface's, in the glow tests.
    expect(await ui.find({ type: 'Text', text: /de 3 unidades hechas/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /^33%$/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /hace 2 h/ })).toBeDefined()

    // The timeline draws the run's own phases only, as state.json marks them.
    expect(await ui.find({ type: 'Text', text: /✓ Análisis/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /● Build/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /○ Verificación/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Arquitectura/ })).toBeUndefined()

    // AHORA: the last done, the one in progress and the next pending, with where it stands.
    expect(await ui.find({ type: 'Text', text: /^AHORA · Build$/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /^Unidad 2 de 3$/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Write the parser/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Write the tests/ })).toBeDefined()

    // The sections of before are gone; the tasks start hidden behind their button.
    expect(await ui.find({ type: 'Text', text: /EN CURSO|PENDIENTES|HECHAS|DESCARTADAS/ })).toBeUndefined()
    expect(await ui.find({ type: 'Text', text: /Old idea/ })).toBeUndefined()
    await ui.press({ key: 'toggle-tasks' })
    expect(await ui.find({ type: 'Text', text: /☰ Ocultar tareas/ })).toBeDefined()

    // Each phase a group; only the one in progress open, a finished one with its check. How
    // its heading lines up is each surface's, in the tests below.
    expect(await ui.find({ type: 'Text', text: /^▾ Build/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /^▸ ✓ Análisis/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /^▸ Verificación/ })).toBeDefined()
    await ui.press({ key: 'toggle-group-analysis' })
    const dropped = await ui.find({ type: 'Text', text: /Old idea/ })
    expect(dropped?.props).toMatchObject({ strikethrough: true })
    await ui.press({ key: 'toggle-group-analysis' })
    await ui.press({ key: 'toggle-tasks' })
    expect(await ui.find({ type: 'Text', text: /Old idea/ })).toBeUndefined()

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
  // The typo counts nowhere: two units count, and unit 3 is the one that follows.
  expect(await ui.find({ type: 'Text', text: /^Unidad 2 de 2$/ })).toBeDefined()
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

test('a phase NZT does not know is drawn as written, with a warning naming the real ones', async ($, on) => {
  const ui = await mountPane($, on, {
    goal: 'A change written as a phase',
    phases: [
      { name: 'build', status: 'done', units: [{ id: 1, do: 'Band', status: 'done' }] },
      { name: 'cambio: modelo y effort en la banda', status: 'doing', units: [{ id: 2, do: 'Model', status: 'doing' }] },
    ],
    approved: true,
  })
  expect(await ui.find({ type: 'Text', text: /cambio: modelo y effort en la banda/ })).toBeDefined()
  expect(
    await ui.find({
      type: 'Text',
      text: '⚠ «cambio: modelo y effort en la banda» no es una fase de NZT: las fases son Análisis, Arquitectura, UX, Build, Verificación, Release',
    }),
  ).toBeDefined()
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
  expect(await ui.find({ type: 'Text', text: /no es una fase de NZT/ })).toBeUndefined()
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
  expect(await ui.find({ type: 'Text', text: /^NOW · Build$/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /^Unit 2 of 3$/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /☰ Show tasks/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /Draw the pane/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /aprobado|AHORA|Análisis|Ver tareas/ })).toBeUndefined()
  await ui.unmount()
})

test('in the tasks, the group of the phase in progress starts open and the others folded', async ($, on) => {
  const ui = await mountPane($, on, {
    goal: 'Groups',
    phases: [
      { name: 'build', status: 'doing', units: [
        { id: 1, do: 'Build now', status: 'doing' },
        { id: 2, do: 'Build next', status: 'todo' },
        { id: 4, do: 'Build last', status: 'todo' },
      ] },
      { name: 'verify', status: 'todo', units: [{ id: 3, do: 'Verify later', status: 'todo' }] },
    ],
    approved: true,
  })
  await ui.press({ key: 'toggle-tasks' })
  expect(await ui.find({ type: 'Text', text: /Build last/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /Verify later/ })).toBeUndefined()
  await ui.press({ key: 'toggle-group-build' })
  expect(await ui.find({ type: 'Text', text: /Build last/ })).toBeUndefined()
  await ui.press({ key: 'toggle-group-verify' })
  expect(await ui.find({ type: 'Text', text: /Verify later/ })).toBeDefined()
  await ui.unmount()
})

test('AHORA shows only the last done, the one in progress and the next pending', async ($, on) => {
  const ui = await mountPane($, on, {
    goal: 'Window',
    phases: [
      { name: 'verify', status: 'doing', units: [
        { id: 295, do: 'Old done', status: 'done' },
        { id: 297, do: 'Last done', status: 'done' },
        { id: 287, do: 'In progress now', status: 'doing', detail: 'a detail long enough to be folded' },
        { id: 298, do: 'Next one', status: 'todo' },
        { id: 299, do: 'Later one', status: 'todo' },
      ] },
    ],
    approved: true,
  })
  expect(await ui.find({ type: 'Text', text: /^AHORA · Verificación$/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /^Unidad 3 de 5$/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /Last done/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /In progress now/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /Next one/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /Old done|Later one/ })).toBeUndefined()

  // The detail sits in one row until the unit is pressed, and goes back to one row.
  const folded = await ui.find({ type: 'Text', text: /a detail long enough/ })
  expect(folded?.props).toMatchObject({ wrap: 'truncate-end' })
  await ui.press({ key: 'detail-287' })
  expect((await ui.find({ type: 'Text', text: /a detail long enough/ }))?.props).toMatchObject({ wrap: 'wrap' })
  await ui.press({ key: 'detail-287' })
  expect((await ui.find({ type: 'Text', text: /a detail long enough/ }))?.props).toMatchObject({ wrap: 'truncate-end' })
  await ui.unmount()
})

test('with no unit in progress, the first pending of the phase in progress is the one that follows', async ($, on) => {
  const ui = await mountPane($, on, {
    goal: 'Between units',
    phases: [
      { name: 'discovery', status: 'done', units: [{ id: 294, do: 'Spec', status: 'done' }] },
      { name: 'ux', status: 'doing', units: [{ id: 295, do: 'Mockup', status: 'todo' }] },
      { name: 'build', status: 'todo', units: [{ id: 296, do: 'Build it', status: 'todo' }] },
    ],
    approved: true,
  })
  expect(await ui.find({ type: 'Text', text: '▷' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: / · sigue$/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /^AHORA · UX$/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /^Unidad 2 de 3$/ })).toBeDefined()
  expect((await ui.findAll({ type: 'Text', text: '▷' })).length).toBe(1)
  // Only one follows: in the tasks the mockup is marked again, and the build unit keeps ○.
  await ui.press({ key: 'toggle-tasks' })
  await ui.press({ key: 'toggle-group-build' })
  expect((await ui.findAll({ type: 'Text', text: '▷' })).length).toBe(2)
  await ui.unmount()
})

const SLICED = {
  version: 2,
  goal: 'Cupones · entrega 1',
  cadence: 'delivery',
  slices: [
    { id: 'S1', name: 'Análisis de la entrega 1', status: 'done', phases: [
      { name: 'analysis', status: 'done', units: [{ id: 1, do: 'Spec F-003', status: 'done' }] },
    ] },
    { id: 'S2', name: 'F-003 Cupones', status: 'doing', phases: [
      { name: 'build', status: 'done', units: [{ id: 2, do: 'Construir US-001', status: 'done' }] },
      { name: 'verify', status: 'doing', units: [{ id: 3, do: 'QA de US-001', status: 'doing' }] },
    ] },
    { id: 'S3', name: 'Release', status: 'todo', phases: [
      { name: 'ship', status: 'todo', units: [{ id: 4, do: 'Publicar', status: 'todo' }] },
    ] },
  ],
  approved: true,
  autonomy: { units: [3, 4] },
}

describe('parseState with slices', () => {
  test('phases and units are the current slice, and the batch sees every unit', async () => {
    const state = parseState(JSON.stringify(SLICED))
    if (state.kind !== 'ok') throw new Error(state.kind)
    expect(state.slices?.map(s => `${s.id}:${s.status}`)).toEqual(['S1:done', 'S2:doing', 'S3:todo'])
    expect(state.current).toBe(1)
    expect(state.phases?.map(p => p.name)).toEqual(['build', 'verify'])
    expect(state.units.map(u => u.id)).toEqual([2, 3])
    expect(state.planUnits.map(u => u.id)).toEqual([1, 2, 3, 4])
  })

  test('with no slice in progress the first to do is current; with neither, the last', async () => {
    const waiting = parseState(JSON.stringify({ ...SLICED, slices: SLICED.slices.map(s => ({ ...s, status: s.id === 'S1' ? 'done' : 'todo' })) }))
    if (waiting.kind !== 'ok') throw new Error(waiting.kind)
    expect(waiting.current).toBe(1)
    const finished = parseState(JSON.stringify({ ...SLICED, slices: SLICED.slices.map(s => ({ ...s, status: 'done' })) }))
    if (finished.kind !== 'ok') throw new Error(finished.kind)
    expect(finished.current).toBe(2)
  })

  test('a plan that is not cut has no slices, and its plan units are its units', async () => {
    const state = parseState(STATE)
    if (state.kind !== 'ok') throw new Error(state.kind)
    expect(state.slices).toBe(null)
    expect(state.planUnits).toEqual(state.units)
  })
})

test('a plan cut into slices shows which slice runs, every slice folded below, and its own phases', async ($, on) => {
  const ui = await mountPane($, on, SLICED)
  expect(await ui.find({ type: 'Text', text: 'Tramo' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: '2 de 3 · F-003 Cupones' })).toBeDefined()
  // The list starts folded: the current slice is named once, in the Tramo row.
  expect(await ui.find({ type: 'Text', text: /^▸ Tramos · 3/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'S2 · F-003 Cupones' })).toBeUndefined()
  await ui.press({ key: 'toggle-slices' })
  for (const row of ['S1 · Análisis de la entrega 1', 'S2 · F-003 Cupones', 'S3 · Release']) {
    expect(await ui.find({ type: 'Text', text: row })).toBeDefined()
  }
  await ui.press({ key: 'toggle-slices' })
  // The timeline is the current slice's: no phase of another slice, none twice.
  expect(await ui.find({ type: 'Text', text: /Verificación/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /^[○✓] Release/ })).toBeUndefined()
  // The batch spans slices: unit 4 lives in S3 and is not reported as missing.
  expect(await ui.find({ type: 'Text', text: /sin unidad/ })).toBeUndefined()
  // Nothing is left in S2 after the unit in progress: what follows is the next slice.
  expect(await ui.find({ type: 'Text', text: /Sigue el tramo S3 · Release/ })).toBeDefined()
  await ui.unmount()
})

test('a plan of one slice names it in the Tramo row and has no list to unfold', async ($, on) => {
  const ui = await mountPane($, on, { ...SLICED, slices: [SLICED.slices[0]] })
  expect(await ui.find({ type: 'Text', text: '1 de 1 · Análisis de la entrega 1' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /Tramos ·/ })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: 'S1 · Análisis de la entrega 1' })).toBeUndefined()
  await ui.unmount()
})

test('with slices, AHORA says the plan is complete only after the last slice', async ($, on) => {
  const ui = await mountPane($, on, {
    ...SLICED,
    slices: [
      { ...SLICED.slices[0], status: 'done' },
      { id: 'S2', name: 'F-003 Cupones', status: 'done', phases: [
        { name: 'verify', status: 'done', units: [{ id: 3, do: 'QA', status: 'done' }] },
      ] },
    ],
    autonomy: {},
  })
  expect(await ui.find({ type: 'Text', text: /Plan completo/ })).toBeDefined()
  await ui.unmount()
})

test('with the plan complete, AHORA says so', async ($, on) => {
  const ui = await mountPane($, on, {
    goal: 'Done',
    phases: [{ name: 'ship', status: 'done', units: [{ id: 1, do: 'Release', status: 'done' }] }],
    approved: true,
  })
  expect(await ui.find({ type: 'Text', text: /Plan completo/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /^AHORA/ })).toBeUndefined()
  await ui.unmount()
})

test('while the run waits on the person, Tu turno sits first, folded to one row, and unfolds', async ($, on) => {
  const ui = await mountPane($, on, {
    ...JSON.parse(STATE),
    waiting_on: 'que mires el mockup y elijas la forma de la espera',
  })
  const texts = (await ui.findAll({ type: 'Text' })).map(found => found.text)
  const turn = texts.findIndex(text => /⏸ {2}Tu turno/.test(text))
  expect(turn).toBeGreaterThan(-1)
  expect(turn).toBeLessThan(texts.findIndex(text => /^Plan$/.test(text)))
  // The pause sign keeps a margin from the word: it draws wide in some terminals.
  expect(await ui.find({ type: 'Text', text: /^▸ ⏸ {2}Tu turno$/ })).toBeDefined()
  expect((await ui.find({ type: 'Text', text: /que mires el mockup/ }))?.props).toMatchObject({ wrap: 'truncate-end' })
  await ui.press({ key: 'toggle-turn' })
  expect(await ui.find({ type: 'Text', text: /^▾ ⏸ {2}Tu turno$/ })).toBeDefined()
  expect((await ui.find({ type: 'Text', text: /que mires el mockup/ }))?.props).toMatchObject({ wrap: 'wrap' })
  await ui.unmount()
})

describe('glow', () => {
  test('rises from dim to full and falls back along a wave, without jumps', async () => {
    expect(levelOf(0)).toBe(0)
    expect(levelOf(GLOW_STEPS / 2)).toBe(1)
    expect(levelOf(GLOW_STEPS)).toBe(0)
    for (let step = 0; step < GLOW_STEPS; step++) {
      expect(Math.abs(levelOf(step + 1) - levelOf(step))).toBeLessThanOrEqual(0.35)
    }
  })

  test('is the color itself at full, and mixed toward gray by its depth at the dimmest', async () => {
    expect(glowOf('#F5C542', GLOW_STEPS / 2, 0.6)).toBe('#f5c542')
    expect(glowOf('#F5C542', 0, 0.6)).toBe('#af9c67')
    expect(glowOf('#F5C542', 0, 0)).toBe('#f5c542')
  })
})

test('Tu turno and the unit in progress are drawn in their glow, not in a fixed tone', async ($, on) => {
  const ui = await mountPane($, on, { ...JSON.parse(STATE), waiting_on: 'que lo mires' })
  // The glow has not stepped yet: both sit at the dim end of the wave.
  const turn = await ui.find({ type: 'Text', text: /^▸ ⏸ {2}Tu turno$/ })
  expect(turn?.props?.color).toBe(glowOf('#F5C542', 0, 0.6))
  const doing = await ui.find({ type: 'Text', text: /^Draw the pane$/ })
  expect(doing?.props?.color).toBe(glowOf(PHASES.find(p => p.id === 'build')!.color, 0, 0.35))
  await ui.unmount()
})

test('a run that waits on nobody draws no Tu turno', async ($, on) => {
  const ui = await mountPane($, on, JSON.parse(STATE))
  expect(await ui.find({ type: 'Text', text: /Tu turno/ })).toBeUndefined()
  expect(await ui.find({ key: 'toggle-turn' })).toBeUndefined()
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

/** Every string the tree draws, in the order written. */
const stringsOf = (node: unknown): string[] => {
  if (typeof node === 'string') return [node]
  if (node === null || typeof node !== 'object') return []
  return ((node as Drawn).children ?? []).flatMap(stringsOf)
}

/** Every Box in the tree, in the order written. */
const boxesOf = (node: unknown): Drawn[] => {
  if (node === null || typeof node !== 'object') return []
  const el = node as Drawn
  return [...(el.type === 'Box' ? [el] : []), ...(el.children ?? []).flatMap(boxesOf)]
}

/** The state with its tasks and notes unfolded, so every row the pane can pad is drawn. */
const unfold = async (ui: Awaited<ReturnType<typeof mountPane>>) => {
  await ui.press({ key: 'toggle-tasks' })
  await ui.press({ key: 'toggle-notes' })
}

test('the terminal pads each heading to the edge and draws the progress as a rule', async ($, on) => {
  const ui = await mountPane($, on, JSON.parse(STATE))
  await unfold(ui)

  const drawn = stringsOf(await ui.drawn())

  expect(await ui.find({ type: 'Text', text: /^▾ Build +0 de 1$/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /^▸ ✓ Análisis +1 de 1$/ })).toBeDefined()
  expect(drawn.some(text => text.startsWith('━'))).toBe(true)
  await ui.unmount()
})

test('the desktop lays the pane out as boxes: no padding, no rule of glyphs, a bar for progress', async ($, on) => {
  const ui = await mountPane($, on, JSON.parse(STATE), 'desktop')
  await unfold(ui)

  const tree = await ui.drawn()

  // A run of spaces collapses in a proportional font: nothing lines up by padding.
  expect(stringsOf(tree).filter(text => / {2}/.test(text))).toEqual([])
  expect(stringsOf(tree).filter(text => text.includes('━'))).toEqual([])
  // The heading's name and count are two texts, the count at the end of the row.
  expect(await ui.find({ type: 'Text', text: /^▾ Build$/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /^▸ ✓ Análisis$/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /^1 de 1$/ })).toBeDefined()
  // One unit of three done: the bar's fill is a third of its track.
  const progress = boxesOf(tree).find(box => box.props?.key === 'progress')
  expect(progress?.children?.[0]).toMatchObject({ type: 'Box', props: { width: '33%' } })
  await ui.unmount()
})

const WAITING = { ...JSON.parse(STATE), waiting_on: 'Approve the plan' }

test('on the terminal the glow is drawn by the pane: Tu turno and the unit in progress in its tone', async ($, on) => {
  const ui = await mountPane($, on, WAITING)

  const turn = await ui.find({ type: 'Text', text: /Tu turno/ })
  const unit = await ui.find({ type: 'Text', text: /Draw the pane/ })

  expect(turn?.props?.color).toMatch(/^#[0-9a-f]{6}$/)
  expect(unit?.props?.color).toMatch(/^#[0-9a-f]{6}$/)
  expect(await ui.find({ type: 'Client' })).toBeUndefined()
  await ui.unmount()
})

test('on the desktop the glow runs on its own clock, so the pane is not drawn again each step', async ($, on) => {
  const ui = await mountPane($, on, WAITING, 'desktop')
  const pane = JSON.stringify(await ui.drawn())
  const before = await ui.find({ type: 'Text', text: /Tu turno/, in: 'glow-turn' })

  await ui.advance(220 * 3)

  const after = await ui.find({ type: 'Text', text: /Tu turno/, in: 'glow-turn' })
  expect(after?.props?.color).not.toBe(before?.props?.color)
  expect(JSON.stringify(await ui.drawn())).toBe(pane)
  expect(await ui.find({ type: 'Text', text: /Draw the pane/, in: 'glow-text-now-2' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /^▶$/, in: 'glow-mark-now-2' })).toBeDefined()
  await ui.unmount()
})

test('on the desktop Tu turno is no Button, which the app would draw in its own color, but a glowing text', async ($, on) => {
  const ui = await mountPane($, on, WAITING, 'desktop')

  const turn = await ui.drawn({ in: 'glow-turn' })

  expect(turn).toMatchObject({
    type: 'Box',
    children: [{ type: 'Text', props: { color: expect.stringMatching(/^#[0-9a-f]{6}$/) }, children: [expect.stringMatching(/^▸ .*Tu turno$/)] }],
  })
  expect(await ui.find({ type: 'Button', in: 'glow-turn' })).toBeUndefined()
  await ui.unmount()
})

test('on the desktop a click released on Tu turno unfolds it, and one released off it does not', async ($, on) => {
  const ui = await mountPane($, on, WAITING, 'desktop')
  await ui.resize({ columns: 14, rows: 1, in: 'glow-turn' })

  await ui.pointer({ type: 'down', x: 3, y: 0, button: 'left', in: 'glow-turn' })
  await ui.pointer({ type: 'up', x: 30, y: 0, button: 'left', in: 'glow-turn' })
  expect(await ui.find({ type: 'Text', text: /^▸ .*Tu turno$/, in: 'glow-turn' })).toBeDefined()

  await ui.pointer({ type: 'down', x: 3, y: 0, button: 'left', in: 'glow-turn' })
  await ui.pointer({ type: 'up', x: 3, y: 0, button: 'left', in: 'glow-turn' })
  expect(await ui.find({ type: 'Text', text: /^▾ .*Tu turno$/, in: 'glow-turn' })).toBeDefined()
  await ui.unmount()
})

test('on the desktop Enter on Tu turno unfolds it, and the detail unfolds the unit in progress', async ($, on) => {
  const ui = await mountPane($, on, WAITING, 'desktop')

  await ui.key({ key: 'return', in: 'glow-turn' })
  await ui.press({ key: 'detail-now-2' })

  expect(await ui.find({ type: 'Text', text: /^▾ .*Tu turno$/, in: 'glow-turn' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /header drawn/ })).toMatchObject({ props: { wrap: 'wrap' } })
  await ui.unmount()
})

test('a project with Plan/state.json opens the pane when the session starts', async ($, on) => {
  expect(await startSession($, on, true)).toEqual(['nzt-state'])
})

test('the state is read from the folder the session started in, wherever the agent moves', async ($, on) => {
  const asked: string[] = []
  on('session.start', async (_, e) => ({ cwd: e.cwd }))
  on('command.register', async (_, e) => ({ value: { command: e.name } }))
  on('clock.every', async () => ({ value: undefined }))
  on('fs.stat', async (_, e) => {
    asked.push(e.path)
    return { value: { kind: 'file', size: STATE.length, mtimeMs: 5, isLink: false } }
  })
  on('fs.read', async () => ({ value: STATE }))
  on('ui.open', async () => ({ value: { isPlaced: true } }))
  await $.session.start({ cwd: 'C:\\project\\', surface: 'terminal', isInteractive: true })
  // The engine hands the path on in the platform's separators.
  expect(asked[0]?.replace(/\\/g, '/')).toBe('C:/project/Plan/state.json')
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
  // Units with no phase of their own: AHORA without one, and the tasks as one list with no groups.
  expect(await ui.find({ type: 'Text', text: /^AHORA$/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /^Unidad 3 de 4$/ })).toBeDefined()
  await ui.press({ key: 'toggle-tasks' })
  expect(await ui.find({ type: 'Text', text: /^A$/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /^[▾▸] / })).toBeUndefined()
  await ui.unmount()
})

/** A session with the state file, a pane that seats, and nzt-questions counting `pending`, or not installed. */
const questionsSession = (on: Parameters<TestBody>[1], pending?: number) => {
  on('fs.stat', async () => ({
    value: { kind: 'file', size: STATE.length, mtimeMs: 1, isLink: false },
  }))
  on('fs.read', async () => ({ value: STATE }))
  on('ui.open', async () => ({ value: { isPlaced: true } }))
  on('clock.now', async () => ({ value: Date.parse('2026-10-13T12:00:00Z') }))
  if (pending !== undefined) {
    on('state.get', { plugin: 'nzt-questions', key: 'pending' }, async () => ({ value: { value: pending, version: 1 } }) as never)
  }
  const ran: string[] = []
  on('command.run', { command: 'nzt-questions' }, async () => {
    ran.push('nzt-questions')
    return { text: 'Panel de preguntas abierto.' }
  })
  return ran
}

const mountState = async ($: Parameters<TestBody>[0]) => {
  await $.command.run({
    command: 'nzt-state',
    args: '',
    origin: { kind: 'composer' },
    presentation: { isFullscreen: false, columns: 120 },
  })
  return $.ui.mount({
    plugin: 'nzt-state',
    surface: 'terminal',
    component: 'Pane',
    requestId: 'nzt-state',
    viewport: { columns: 80, rows: 40 },
    props: {
      title: 'Estado',
      isFocused: false,
      bodyColumns: 76,
      placement: 'dock',
      scroll: { offset: 0, bodyRows: 36 },
      view: {},
    },
  })
}

test('with questions pending in nzt-questions, the pane says how many and Contestar opens it', async ($, on) => {
  const ran = questionsSession(on, 3)
  const ui = await mountState($)
  // Folded, Tu turno says how many; unfolded, the notice and Contestar.
  expect(await ui.find({ type: 'Text', text: /⏸ {2}Tu turno/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: '3 preguntas para contestar' })).toBeDefined()
  expect(await ui.find({ key: 'answer-questions' })).toBeUndefined()
  await ui.press({ key: 'toggle-turn' })
  expect(await ui.find({ type: 'Text', text: '? 3 preguntas para contestar' })).toBeDefined()
  await ui.press({ key: 'answer-questions' })
  expect(ran).toEqual(['nzt-questions'])
})

test('without nzt-questions, or with nothing pending, the pane says nothing about questions', async ($, on) => {
  questionsSession(on)
  const ui = await mountState($)
  expect(await ui.find({ type: 'Text', text: /para contestar|Tu turno/ })).toBeUndefined()
  expect(await ui.find({ key: 'answer-questions' })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: /Draw the pane/ })).toBeDefined()
})

describe('delegation', () => {
  test('absent is ask by default, a mode is kept, anything else is ask with a warning', async () => {
    const of = (value?: unknown) => {
      const parsed = parseState(JSON.stringify(value === undefined ? {} : { delegation: value }))
      if (parsed.kind !== 'ok') throw new Error(parsed.kind)
      return parsed.delegation
    }
    expect(of()).toEqual({ mode: 'ask', isSet: false })
    expect(of('auto')).toEqual({ mode: 'auto', isSet: true })
    expect(of('always')).toEqual({ mode: 'ask', isSet: false, invalid: '"always"' })
  })

  test('a press steps auto, ask, off and back to auto', async () => {
    expect([nextModeOf('auto'), nextModeOf('ask'), nextModeOf('off')]).toEqual(['ask', 'off', 'auto'])
  })

  test('the mode is written in place and every other byte is kept', async () => {
    const raw = '{\n  "goal": "G",\n  "approved": true,\n  "delegation": "auto",\n  "notes": []\n}\n'
    expect(withDelegation(raw, 'ask')).toBe(raw.replace('"auto"', '"ask"'))
  })

  test('a new mode goes beside approved, as the kernel writes it', async () => {
    const raw = '{\n  "goal": "G",\n  "approved": true,\n  "notes": []\n}\n'
    expect(withDelegation(raw, 'off')).toBe(
      '{\n  "goal": "G",\n  "approved": true, "delegation": "off",\n  "notes": []\n}\n',
    )
  })

  test('without approved it opens the object; a text that is not an object is not written', async () => {
    const raw = '{\n  "goal": "G"\n}\n'
    expect(withDelegation(raw, 'auto')).toBe('{\n  "delegation": "auto",\n  "goal": "G"\n}\n')
    expect(withDelegation('[1]', 'auto')).toBeUndefined()
    expect(withDelegation('{ nope', 'auto')).toBeUndefined()
  })
})

test('the pane shows the mode under Plan and Modo, and a press writes the next one', async ($, on) => {
  const written: string[] = []
  on('fs.write', async (_, e) => {
    written.push(e.text)
    return { value: undefined }
  })
  const ui = await mountPane($, on, { goal: 'Delegate', phases: [], approved: true })
  expect(await ui.find({ type: 'Text', text: /^Delegar/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /pregunta antes \(por defecto\)/ })).toBeDefined()
  await ui.press({ key: 'cycle-delegation' })
  expect(written.length).toBe(1)
  expect(JSON.parse(written[0] ?? '{}')).toEqual({
    goal: 'Delegate',
    phases: [],
    approved: true,
    delegation: 'off',
  })
  await ui.unmount()
})

test('a write that fails is said in the pane, and the file is left as it was', async ($, on) => {
  on('fs.write', async () => ({ deny: 'EACCES' }))
  const ui = await mountPane($, on, { goal: 'Locked', phases: [], approved: true, delegation: 'auto' })
  expect(await ui.find({ type: 'Text', text: /explora sin preguntar/ })).toBeDefined()
  await ui.press({ key: 'cycle-delegation' })
  expect(await ui.find({ type: 'Text', text: /No se pudo cambiar el modo/ })).toBeDefined()
  await ui.unmount()
})
