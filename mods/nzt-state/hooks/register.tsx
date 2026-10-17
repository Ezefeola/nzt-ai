import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Answering, Expanded, Snapshot, Unit } from '../types'
import { parseState } from './parse'
import { langOf, TEXTS } from './i18n'
import type { Texts } from './i18n'
import { colorOf, idOf, labelOf, timelineOf } from './phases'
import {
  animatedSvgOf,
  cellsOf,
  CELL_ROWS,
  frameOf,
  MINI_WIDTH,
  miniOf,
  svgOf,
  WIDTH,
} from './sprites'

const PANE = 'nzt-state'
const FILE = 'Plan/state.json'
const POLL_MS = 2000
const FRAME_MS = 220
const CHARACTER = 'character'
// CSS pixels per sprite pixel on the surfaces that draw SVG.
const CHARACTER_SCALE = 5
const MINI_SCALE = 4
const LABEL = 6
// Columns a phase group's units sit in from the section's edge.
const GROUP_INDENT = 4
// Usable columns from which Plan and Mode sit to the left of the character instead of below it.
const SIDE_BY_SIDE_MIN = 40
const SIDE_BY_SIDE_GAP = 2

const snapshot = atom({ plugin: 'nzt-state', key: 'snapshot' } as const, {
  kind: 'missing',
} as Snapshot)
const expanded = atom({ plugin: 'nzt-state', key: 'expanded' } as const, {
  todo: true,
  done: false,
  dropped: false,
  notes: false,
} as Expanded)
const answering = atom({ plugin: 'nzt-state', key: 'answering' } as const, { kind: 'idle' } as Answering)
// What nzt-questions publishes: how many of its questions are not sent. Undefined while it is
// not installed or has never counted, which the pane takes as none.
const QUESTIONS_PENDING = { plugin: 'nzt-questions', key: 'pending' } as const
const QUESTIONS = 'nzt-questions'
// The color of Preguntas in nzt-hub and nzt-questions.
const QUESTIONS_COLOR = '#f48fb1'
// A press on Contestar that has not opened nzt-questions by then is waiting for Claude's turn to end.
const WAIT_MS = 400

// The mtime last read; a reload starts over and reads the file again.
let lastMtime = -1
// The character's animation frame; it only has to advance, so it may start over.
let tick = 0

/**
 * The phase whose character the pane shows: the one in progress, else the first not
 * finished, else the run's last; an older state its single phase; no phases, none.
 */
const characterPhaseOf = (state: Snapshot): string | undefined => {
  if (state.kind !== 'ok') return undefined
  if (state.phases === null) return state.legacyPhase ?? undefined
  const phases = state.phases
  return (
    phases.find(p => p.status === 'doing')?.name ??
    phases.find(p => p.status === 'todo')?.name ??
    phases[phases.length - 1]?.name
  )
}

const refresh = async ($: EngineInterface, force = false) => {
  const stat = await $.fs.stat(FILE).catch(() => undefined)
  if (stat === undefined) {
    if (lastMtime !== -2 || force) {
      lastMtime = -2
      await update($, snapshot, () => ({ kind: 'missing' }))
    }
    return
  }
  if (!force && stat.mtimeMs === lastMtime) return
  lastMtime = stat.mtimeMs
  const raw = await $.fs.read(FILE).catch((error: Error) => error)
  const next: Snapshot =
    typeof raw === 'string' ? parseState(raw) : { kind: 'error', message: raw.message }
  await update($, snapshot, () => next)
}

const since = (iso: string, now: number, t: Texts) => {
  const at = Date.parse(iso)
  if (Number.isNaN(at)) return undefined
  const minutes = Math.max(0, Math.round((now - at) / 60000))
  if (minutes < 1) return t.justNow
  if (minutes < 60) return t.minutesAgo(minutes)
  const hours = Math.round(minutes / 60)
  if (hours < 24) return t.hoursAgo(hours)
  return t.daysAgo(Math.round(hours / 24))
}

/** Runs nzt-questions' command as if typed; while Claude's turn runs, the notice says it waits. */
const openQuestions = async ($: EngineInterface) => {
  let isDone = false
  const ran = $.command.run({ command: QUESTIONS }).finally(() => {
    isDone = true
  })
  void $.clock
    .sleep(WAIT_MS)
    .then(() => (isDone ? undefined : update($, answering, (): Answering => ({ kind: 'waiting' }))))
    .catch(() => undefined)
  try {
    await ran
    await update($, answering, (): Answering => ({ kind: 'idle' }))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    await update($, answering, (): Answering => ({ kind: 'failed', message }))
  }
}

const MARK = {
  todo: { glyph: '○', color: 'subtle' },
  doing: { glyph: '▶', color: 'claude' },
  done: { glyph: '✓', color: 'success' },
  dropped: { glyph: '✗', color: 'inactive' },
  invalid: { glyph: '?', color: 'warning' },
} as const

const byId = (a: Unit, b: Unit) => a.id - b.id

/** The sections whose units are grouped by phase. */
type Section = 'todo' | 'done' | 'dropped'

/**
 * `units` split by phase, the groups in the order the phases appear in `all` (the plan's)
 * and each group's units in the order `units` gives them.
 */
const groupsOf = (all: Unit[], units: Unit[]) => {
  const order = [...new Set(all.map(unit => unit.phase))]
  return order
    .map(phase => ({ phase, units: units.filter(unit => unit.phase === phase) }))
    .filter(group => group.units.length > 0)
}

// A session's stored value from before `todo` existed lacks it: pending starts open.
const isOpen = (value: Partial<Expanded>, key: keyof Expanded) =>
  key === 'todo' ? value.todo !== false : value[key] === true

/** `[69, 70, 71, 72, 75]` as `69–72, 75`. */
const ranges = (ids: number[]) =>
  [...ids]
    .sort((a, b) => a - b)
    .reduce<[number, number][]>((runs, id) => {
      const last = runs[runs.length - 1]
      if (last !== undefined && id === last[1] + 1) last[1] = id
      else runs.push([id, id])
      return runs
    }, [])
    .map(([from, to]) => (from === to ? `${from}` : `${from}–${to}`))
    .join(', ')

export const register: Register = (on, options) => {
  const lang = langOf(options.language)
  const t = TEXTS[lang]

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'nzt-state',
      description: t.commandDescription,
    })
    await refresh($, true)
    $.clock.every(POLL_MS, () => refresh($))
    // Repaints the character alone; a pane that is closed or on another surface refuses it.
    $.clock.every(FRAME_MS, async () => {
      tick++
      const phase = characterPhaseOf(await read($, snapshot))
      if (phase === undefined) return
      await $.ui
        .blit({ requestId: PANE, key: CHARACTER, cells: cellsOf(frameOf(idOf(phase), tick)) })
        .catch(() => undefined)
    })
    // Installed for every project, so a project that does not use NZT starts without it.
    if ((await read($, snapshot)).kind !== 'missing') void $.ui.open({ id: PANE, title: t.title })

    return next(e)
  })

  on('command.run', { command: 'nzt-state' }, async $ => {
    await refresh($, true)
    const opened = await $.ui.open({ id: PANE, title: t.title })

    return {
      text: opened.isPlaced
        ? t.paneOpened
        : t.paneWaiting(opened.reason),
    }
  })

  // A write by the model shows at once instead of on the next poll.
  on('tool.call', async ($, e, next) => {
    const ran = await next(e)
    if (e.tool === 'Write' || e.tool === 'Edit') {
      if (e.file_path.replace(/\\/g, '/').endsWith(FILE)) {
        await refresh($, true).catch(() => undefined)
      }
    }

    return ran
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const state = await read($, snapshot)
    const open = await read($, expanded)
    const pressed = await read($, answering)
    // A value that is not a count, or a reading refused, is no questions: nothing shows.
    const counted = await $.state
      .get(QUESTIONS_PENDING)
      .then(got => got.value)
      .catch(() => undefined)
    const asked = typeof counted === 'number' ? counted : 0
    const width = Math.max(24, e.props.bodyColumns - 1)

    if (state.kind === 'missing') {
      return (
        <Box flexDirection="column" paddingX={1}>
          <Text dimColor>{t.missing(FILE)}</Text>
          <Text dimColor>{t.missingHint}</Text>
        </Box>
      )
    }
    if (state.kind === 'error') {
      return (
        <Box flexDirection="column" paddingX={1}>
          <Text color="error" bold>{t.unreadable(FILE)}</Text>
          <Text dimColor wrap="wrap">{state.message}</Text>
        </Box>
      )
    }

    const inner = width - 2
    const idWidth = Math.max(2, ...state.units.map(u => String(u.id).length)) + 1
    const textWidth = Math.max(8, inner - 2 - idWidth)

    const section = (label: string, count?: number) => (
      <Box marginTop={1}>
        <Text bold color="claude">{label}</Text>
        {count !== undefined && <Text dimColor>  {count}</Text>}
      </Box>
    )

    // A section the person folds and unfolds with a click, or Enter under the focus.
    // The terminal inverts each Text of a Button under the pointer in its own color
    // and offers no transition, so the label is one Text padded to the full row:
    // the highlight is one even band instead of a patch the length of the word.
    const folding = (label: string, count: number, key: keyof Expanded) => (
      <Box marginTop={1}>
        <Button
          key={`toggle-${key}`}
          plain
          onPress={() => update($, expanded, now => ({ ...now, [key]: !isOpen(now, key) }))}
        >
          <Text bold color="claude">
            {`${isOpen(open, key) ? '▾' : '▸'} ${label} · ${count}`.padEnd(inner)}
          </Text>
        </Button>
      </Box>
    )

    // `indent` sets a phase group's units in under its heading, so they read as the phase's.
    const row = (unit: Unit, dim = false, indent = 0) => (
      <Box flexDirection="row" marginLeft={indent}>
        <Box width={2}>
          <Text color={MARK[unit.status].color}>{MARK[unit.status].glyph}</Text>
        </Box>
        <Box width={idWidth}>
          <Text dimColor>{unit.id}</Text>
        </Box>
        <Box width={textWidth - indent}>
          <Text dimColor={dim} wrap="wrap">
            {unit.do}
            {unit.status === 'invalid' && <Text color="warning"> · status {unit.rawStatus || '—'}</Text>}
          </Text>
        </Box>
      </Box>
    )

    const done = state.units.filter(u => u.status === 'done').sort(byId)
    const dropped = state.units.filter(u => u.status === 'dropped').sort(byId)
    // The kernel allows one; more is shown, not hidden, so the broken state can be seen.
    const doing = state.units.filter(u => u.status === 'doing')
    // Pending units keep the file's order: it is the order the plan runs them in.
    const todo = state.units.filter(u => u.status === 'todo')
    const currentPhase = state.phases?.find(p => p.status === 'doing')?.name ?? doing[0]?.phase

    // A group the person never toggled is open only for the phase in progress.
    const isGroupOpen = (value: Partial<Expanded>, key: Section, phase: string) =>
      value.groups?.[`${key}:${phase}`] ?? phase === currentPhase

    // Each section's units under their phase, in the plan's order; a state from before D62
    // has no phases and keeps the flat list. A blank line before each group keeps it off the
    // section's heading and one phase from running into the next.
    const grouped = (key: Section, units: Unit[], dim = false) =>
      groupsOf(state.units, units).map(group =>
        group.phase === undefined ? (
          <Box flexDirection="column" marginTop={1}>{group.units.map(unit => row(unit, dim))}</Box>
        ) : (
          <Box flexDirection="column" marginTop={1}>
            <Box flexDirection="row">
              <Box width={2} />
              {mini(group.phase, `mini-${key}-${group.phase}`)}
              <Button
                key={`toggle-${key}-${group.phase}`}
                plain
                onPress={() =>
                  update($, expanded, now => ({
                    ...now,
                    groups: { ...now.groups, [`${key}:${group.phase}`]: !isGroupOpen(now, key, group.phase!) },
                  }))
                }
              >
                <Text bold color={colorOf(group.phase)}>
                  {`${isGroupOpen(open, key, group.phase) ? '▾' : '▸'} ${labelOf(group.phase, lang)} · ${group.units.length}`.padEnd(inner - 2 - MINI_WIDTH - 1)}
                </Text>
              </Button>
            </Box>
            {isGroupOpen(open, key, group.phase) && group.units.map(unit => row(unit, dim, GROUP_INDENT))}
          </Box>
        ),
      )
    // A status the kernel does not define counts nowhere: it is shown apart, to be fixed.
    const invalid = state.units.filter(u => u.status === 'invalid').sort(byId)
    const live = state.units.length - dropped.length - invalid.length
    const ratio = live === 0 ? 0 : done.length / live
    const isComplete = doing.length === 0 && todo.length === 0 && invalid.length === 0

    const filled = Math.round(ratio * inner)
    const updated = state.updated
      ? since(state.updated, await $.clock.now().catch(() => Date.now()), t)
      : undefined

    // An id with no unit behind it is reported, not waited on: it would never finish.
    const batch = state.units.filter(u => state.autonomy.units.includes(u.id))
    const unknownIds = state.autonomy.units.filter(id => !state.units.some(u => u.id === id))
    const batchDone = batch.filter(u => u.status === 'done' || u.status === 'dropped').length

    const characterPhase = characterPhaseOf(state)
    // Cells are the terminal's; the other surfaces draw the same pixels as SVG.
    const Raster = e.surface === 'terminal' ? $.ui.resolve(e).Raster : undefined
    const Svg = e.surface !== 'terminal' ? $.ui.resolve(e).Svg : undefined

    const steps = timelineOf(state.phases, state.legacyPhase, isComplete, lang)
    const phasesInProgress = steps.filter(step => step.status === 'doing').length
    // A phase's hat in miniature, before its name: in the timeline and in each group heading.
    const mini = (phase: string, key: string) => {
      const rows = miniOf(idOf(phase))
      if (rows === undefined) return null
      return (
        <Box marginRight={1}>
          {Raster !== undefined && <Raster key={key} columns={MINI_WIDTH} rows={1} cells={cellsOf(rows)} />}
          {Svg !== undefined && <Svg source={svgOf(rows, MINI_SCALE)} alt={labelOf(phase, lang)} />}
        </Box>
      )
    }

    // The name in the phase's color; the mark and the emphasis still say its status.
    const timeline = steps.map(({ phase, label, status, rawStatus }, index) => {
      const color = colorOf(phase)
      const step =
        status === 'done' ? (
          <Text color={color}>✓ {label}</Text>
        ) : status === 'doing' ? (
          <Text backgroundColor={color} color="inverseText" bold> ● {label} </Text>
        ) : status === 'dropped' ? (
          <Text dimColor strikethrough>✗ {label}</Text>
        ) : status === 'invalid' ? (
          <Text color="warning">? {label} ({rawStatus || '—'})</Text>
        ) : (
          <Text color={color} dimColor>○ {label}</Text>
        )
      return (
        <Box flexDirection="row">
          {mini(phase, `mini-timeline-${index}`)}
          <Text>
            {step}
            {index < steps.length - 1 && <Text dimColor> → </Text>}
          </Text>
        </Box>
      )
    })

    const character = (columns: number) =>
      characterPhase !== undefined && (
          <Box flexDirection="column" alignItems="center" width={columns}>
            {Raster !== undefined && (
              <Raster
                key={CHARACTER}
                columns={WIDTH}
                rows={CELL_ROWS}
                cells={cellsOf(frameOf(idOf(characterPhase), tick))}
              />
            )}
            {Svg !== undefined && (
              <Svg
                source={animatedSvgOf(idOf(characterPhase), CHARACTER_SCALE, FRAME_MS)}
                alt={labelOf(characterPhase, lang)}
                isInteractive
              />
            )}
            <Text bold color={colorOf(characterPhase)}>{labelOf(characterPhase, lang)}</Text>
          </Box>
        )

    // Plan, mode and goal: the column beside the character, or under it when they are stacked.
    const summary = (columns: number) => (
      <Box flexDirection="column" width={columns}>
        <Box flexDirection="row">
          <Box width={LABEL}>
            <Text dimColor>{t.plan}</Text>
          </Box>
          {state.approved ? (
            <Text color="success">{t.approved}</Text>
          ) : (
            <Text color="warning">{t.notApproved}</Text>
          )}
        </Box>
        <Box flexDirection="row">
          <Box width={LABEL}>
            <Text dimColor>{t.mode}</Text>
          </Box>
          <Box width={columns - LABEL}>
            {state.autonomy.units.length === 0 ? (
              <Text wrap="wrap">
                {t.accompanied}<Text dimColor>{t.stopsEachUnit}</Text>
              </Text>
            ) : (
              <Text wrap="wrap">
                <Text color="autoAccept" bold>{t.autonomous}</Text>
                <Text dimColor>
                  {batchDone === batch.length
                    ? t.batchDone
                    : t.batchProgress(ranges(batch.map(u => u.id)), batchDone, batch.length)}
                  {batchDone < batch.length && state.autonomy.keepStops.length > 0
                    ? t.keptStops(ranges(state.autonomy.keepStops))
                    : ''}
                </Text>
                {unknownIds.length > 0 && (
                  <Text color="warning">{t.unknownIds(ranges(unknownIds))}</Text>
                )}
              </Text>
            )}
          </Box>
        </Box>
        <Box marginTop={1} width={columns}>
          <Text wrap="wrap">
            <Text dimColor>{t.goal} </Text>
            <Text bold>{state.goal}</Text>
          </Text>
        </Box>
      </Box>
    )

    // Narrower than this, the column beside the character is too thin to read: stack them.
    const isSideBySide = characterPhase !== undefined && inner >= SIDE_BY_SIDE_MIN

    return (
      <Box flexDirection="column" paddingX={1}>
        {/* A blank row keeps the heading off the pane's tabs. */}
        <Box key="heading" marginTop={1}>
          <Text>
            <Text backgroundColor="claude" color="inverseText" bold> NZT </Text>{' '}
            <Text bold color="claude">{t.title}</Text>
          </Text>
        </Box>

        {isSideBySide ? (
          <Box marginTop={1} flexDirection="row">
            {summary(inner - WIDTH - SIDE_BY_SIDE_GAP)}
            <Box width={SIDE_BY_SIDE_GAP} />
            {character(WIDTH)}
          </Box>
        ) : (
          <Box flexDirection="column">
            {characterPhase !== undefined && <Box marginTop={1}>{character(inner)}</Box>}
            <Box marginTop={1}>{summary(inner)}</Box>
          </Box>
        )}

        {/* When the phases wrap, a blank row between lines keeps one line off the next. */}
        <Box marginTop={1} flexDirection="row" flexWrap="wrap" rowGap={1}>
          {timeline}
        </Box>
        {steps.length === 0 && <Text dimColor>{t.noPhases}</Text>}
        {phasesInProgress > 1 && (
          <Text color="warning" wrap="wrap">{t.severalPhasesInProgress(phasesInProgress)}</Text>
        )}

        <Box marginTop={1} flexDirection="row" justifyContent="space-between">
          <Text>
            <Text bold>{done.length}</Text>
            <Text dimColor>{t.unitsDone(live)}</Text>
          </Text>
          <Text bold color={isComplete ? 'success' : 'claude'}>
            {Math.round(ratio * 100)}%
          </Text>
        </Box>
        <Text>
          <Text color={isComplete ? 'success' : 'claude'}>{'━'.repeat(filled)}</Text>
          <Text color="inactive">{'━'.repeat(inner - filled)}</Text>
        </Text>
        {updated && (
          <Box flexDirection="row" justifyContent="flex-end">
            <Text dimColor>{t.updated(updated)}</Text>
          </Box>
        )}

        {state.waitingOn !== null && (
          <Box marginTop={1} borderStyle="round" borderColor="warning" paddingX={1}>
            <Text color="warning" wrap="wrap">{t.waitingOn(state.waitingOn)}</Text>
          </Box>
        )}

        {asked > 0 && (
          <Box marginTop={1} flexDirection="column">
            <Box flexDirection="row" justifyContent="space-between" gap={1}>
              <Box flexShrink={1} overflow="hidden">
                <Text color={QUESTIONS_COLOR} bold wrap="truncate-end">{t.questions(asked)}</Text>
              </Box>
              {pressed.kind === 'waiting' ? (
                <Text color="warning" wrap="truncate-end">{t.answerWaiting}</Text>
              ) : (
                <Button key="answer-questions" plain onPress={() => openQuestions($)}>
                  <Text backgroundColor={QUESTIONS_COLOR} color="inverseText" bold>{` ${t.answer} `}</Text>
                </Button>
              )}
            </Box>
            {pressed.kind === 'failed' && (
              <Text color="error" wrap="wrap">{t.answerFailed(pressed.message)}</Text>
            )}
          </Box>
        )}

        {invalid.length > 0 && (
          <Box marginTop={1} flexDirection="column" borderStyle="round" borderColor="warning" paddingX={1}>
            <Text color="warning" wrap="wrap">
              {t.invalid(invalid.length)}
            </Text>
            {invalid.map(unit => row(unit))}
          </Box>
        )}

        {isComplete ? (
          <Box marginTop={1}>
            <Text color="success" bold wrap="wrap">
              {t.complete}
            </Text>
          </Box>
        ) : (
          <Box flexDirection="column">
            {section(t.inProgress)}
            {doing.length === 0 && <Text dimColor>{t.noneInProgress}</Text>}
            {doing.length > 1 && (
              <Text color="warning" wrap="wrap">
                {t.severalInProgress(doing.length)}
              </Text>
            )}
            {doing.map(unit => (
              <Box flexDirection="column">
                {row(unit)}
                {unit.detail && (
                  <Box marginLeft={2 + idWidth} width={textWidth}>
                    <Text dimColor wrap="wrap">{unit.detail}</Text>
                  </Box>
                )}
              </Box>
            ))}

            {todo.length === 0 ? (
              section(t.pending, 0)
            ) : (
              folding(t.pending, todo.length, 'todo')
            )}
            {todo.length === 0 && <Text dimColor>{t.nothingPending}</Text>}
            {isOpen(open, 'todo') && grouped('todo', todo)}
          </Box>
        )}

        {done.length > 0 && folding(t.done, done.length, 'done')}
        {open.done && grouped('done', done, true)}

        {dropped.length > 0 && folding(t.dropped, dropped.length, 'dropped')}
        {open.dropped && grouped('dropped', dropped, true)}

        {state.notes.length > 0 && folding(t.notes, state.notes.length, 'notes')}
        {open.notes && (
          <Box flexDirection="column">
            {state.notes.map(note => (
              <Box flexDirection="row">
                <Box width={2}>
                  <Text dimColor>•</Text>
                </Box>
                <Box width={inner - 2}>
                  <Text dimColor wrap="wrap">{note}</Text>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    )
  })
}
