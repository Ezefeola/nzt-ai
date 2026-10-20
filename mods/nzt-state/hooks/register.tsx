import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Answering, Expanded, Snapshot, Unit } from '../types'
import { parseState } from './parse'
import { langOf, TEXTS } from './i18n'
import type { Texts } from './i18n'
import { GLOW_STEPS, glowOf } from './glow'
import { colorOf, idOf, knownPhasesOf, labelOf, timelineOf, unknownPhasesOf } from './phases'
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
// Tu turno's yellow, and how far toward gray the glow takes it and the unit in progress.
const TURN_COLOR = '#F5C542'
const TURN_DEPTH = 0.6
const DOING_DEPTH = 0.35
// The unit in progress of a state whose units carry no phase: the theme's own accent.
const DOING_COLOR = '#D77757'
const CHARACTER = 'character'
// CSS pixels per sprite pixel on the surfaces that draw SVG.
const CHARACTER_SCALE = 5
const MINI_SCALE = 4
const LABEL = 6
// Columns a phase group's units sit in from the list's edge.
const GROUP_INDENT = 4
// Usable columns from which Plan and Mode sit to the left of the character instead of below it.
const SIDE_BY_SIDE_MIN = 40
const SIDE_BY_SIDE_GAP = 2

const snapshot = atom({ plugin: 'nzt-state', key: 'snapshot' } as const, {
  kind: 'missing',
} as Snapshot)
const expanded = atom({ plugin: 'nzt-state', key: 'expanded' } as const, {
  turn: false,
  detail: false,
  tasks: false,
  notes: false,
} as Expanded)
const answering = atom({ plugin: 'nzt-state', key: 'answering' } as const, { kind: 'idle' } as Answering)
const glow = atom({ plugin: 'nzt-state', key: 'glow' } as const, 0)
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
// The folder the session started in. A relative path follows the agent's `cd` into a subfolder,
// where the state is not; until the session starts, the working directory.
let root = ''
const fileOf = () => (root === '' ? FILE : `${root.replace(/[\\/]+$/, '')}/${FILE}`)
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
  const stat = await $.fs.stat(fileOf()).catch(() => undefined)
  if (stat === undefined) {
    if (lastMtime !== -2 || force) {
      lastMtime = -2
      await update($, snapshot, () => ({ kind: 'missing' }))
    }
    return
  }
  if (!force && stat.mtimeMs === lastMtime) return
  lastMtime = stat.mtimeMs
  const raw = await $.fs.read(fileOf()).catch((error: Error) => error)
  const next: Snapshot =
    typeof raw === 'string' ? parseState(raw) : { kind: 'error', message: raw.message }
  await update($, snapshot, () => next)
}

/** How many questions nzt-questions has pending; a value that is not a count, or a reading refused, is none. */
const questionsOf = async ($: EngineInterface) => {
  const counted = await $.state
    .get(QUESTIONS_PENDING)
    .then(got => got.value)
    .catch(() => undefined)
  return typeof counted === 'number' ? counted : 0
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

/** What a press folds or unfolds, apart from the phase groups. */
type Folded = Exclude<keyof Expanded, 'groups'>

/** The units split by phase, in the order the phases appear in the plan; within one, the file's. */
const groupsOf = (units: Unit[]) =>
  [...new Set(units.map(unit => unit.phase))].map(phase => ({
    phase,
    units: units.filter(unit => unit.phase === phase),
  }))

/**
 * The unit the pane is on while none is in progress: the first pending of the phase in
 * progress, the one the agent is doing or about to do. A state whose units carry no phase
 * takes its first pending.
 */
const nextOf = (units: Unit[], currentPhase: string | undefined) =>
  units.some(unit => unit.status === 'doing')
    ? undefined
    : units.find(
        unit => unit.status === 'todo' && (unit.phase === undefined || (currentPhase !== undefined && unit.phase === currentPhase)),
      )

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
    root = e.cwd
    await $.command.register({
      name: 'nzt-state',
      description: t.commandDescription,
    })
    await refresh($, true)
    $.clock.every(POLL_MS, () => refresh($))
    // Repaints the character alone; a pane that is closed or on another surface refuses it.
    $.clock.every(FRAME_MS, async () => {
      tick++
      const state = await read($, snapshot)
      const isLit =
        state.kind === 'ok' &&
        (state.waitingOn !== null ||
          state.units.some(unit => unit.status === 'doing') ||
          (await questionsOf($)) > 0)
      // Only while something glows: a run with nothing in progress and nobody waited on is
      // never drawn again for this.
      if (isLit) await update($, glow, step => (step + 1) % GLOW_STEPS)
      const phase = characterPhaseOf(state)
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
    const step = await read($, glow)
    const asked = await questionsOf($)
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
    // AHORA's border and padding take four columns off its rows.
    const boxed = inner - 4
    const idWidth = Math.max(2, ...state.units.map(u => String(u.id).length)) + 1
    const toggle = (key: Folded) => () =>
      update($, expanded, now => ({ ...now, [key]: now[key] !== true }))

    // A section the person folds and unfolds with a click, or Enter under the focus.
    // The terminal inverts each Text of a Button under the pointer in its own color
    // and offers no transition, so the label is one Text padded to the full row:
    // the highlight is one even band instead of a patch the length of the word.
    const folding = (label: string, count: number, key: Folded) => (
      <Box marginTop={1}>
        <Button key={`toggle-${key}`} plain onPress={toggle(key)}>
          <Text bold color="claude">
            {`${open[key] === true ? '▾' : '▸'} ${label} · ${count}`.padEnd(inner)}
          </Text>
        </Button>
      </Box>
    )

    // The kernel allows one; more is shown, not hidden, so the broken state can be seen.
    const doing = state.units.filter(u => u.status === 'doing')
    const done = state.units.filter(u => u.status === 'done')
    // A status the kernel does not define counts nowhere: it is shown apart, to be fixed.
    const invalid = state.units.filter(u => u.status === 'invalid').sort(byId)
    const todo = state.units.filter(u => u.status === 'todo')
    const counted = state.units.filter(u => u.status !== 'dropped' && u.status !== 'invalid')
    const currentPhase = state.phases?.find(p => p.status === 'doing')?.name ?? doing[0]?.phase
    const following = nextOf(state.units, currentPhase)
    const ratio = counted.length === 0 ? 0 : done.length / counted.length
    const isComplete = doing.length === 0 && todo.length === 0 && invalid.length === 0

    // A unit as the checklist marks it; the one in progress carries its detail, folded to a
    // row until the person presses it.
    const row = (unit: Unit, columns: number, indent = 0) => {
      const isNext = unit.id === following?.id
      // The unit in progress glows softly in its phase's color, mark and text alike.
      const lit =
        unit.status === 'doing'
          ? glowOf(unit.phase === undefined ? DOING_COLOR : colorOf(unit.phase), step, DOING_DEPTH)
          : undefined
      const mark = isNext
        ? { glyph: '▷', color: colorOf(unit.phase ?? '') }
        : lit !== undefined
          ? { glyph: MARK.doing.glyph, color: lit }
          : MARK[unit.status]
      const textWidth = Math.max(8, columns - indent - 2 - idWidth)
      const hasDetail = unit.status === 'doing' && unit.detail !== undefined && unit.detail !== ''
      const text = (
        <Text
          wrap="wrap"
          bold={unit.status === 'doing'}
          dimColor={unit.status === 'todo' && !isNext}
          strikethrough={unit.status === 'dropped'}
          color={unit.status === 'dropped' ? 'subtle' : lit}
        >
          {unit.do}
          {isNext && <Text dimColor bold={false}> · {t.next}</Text>}
          {unit.status === 'invalid' && <Text color="warning"> · status {unit.rawStatus || '—'}</Text>}
        </Text>
      )
      return (
        <Box flexDirection="column" marginLeft={indent}>
          <Box flexDirection="row">
            <Box width={2}>
              <Text color={mark.color} bold={unit.status === 'doing'}>{mark.glyph}</Text>
            </Box>
            <Box width={idWidth}>
              <Text dimColor>{unit.id}</Text>
            </Box>
            <Box width={textWidth}>
              {/* A Button holds text only: the unit's text is what a press unfolds the detail from. */}
              {hasDetail ? (
                <Button key={`detail-${unit.id}`} plain onPress={toggle('detail')}>{text}</Button>
              ) : (
                text
              )}
            </Box>
          </Box>
          {hasDetail && (
            <Box marginLeft={2 + idWidth} width={textWidth}>
              <Text dimColor wrap={open.detail ? 'wrap' : 'truncate-end'}>{unit.detail}</Text>
            </Box>
          )}
        </Box>
      )
    }

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
    const unknownPhases = unknownPhasesOf(state.phases)
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

    // Tu turno: what the run waits on from the person, folded to one row whose title glows.
    const isYourTurn = state.waitingOn !== null || asked > 0
    const yourTurn = isYourTurn && (
      <Box key="your-turn" marginTop={1} flexDirection="column">
        {/* A Button holds text only: the title and the folded text are each one, pressing alike. */}
        <Box flexDirection="row" gap={1} width={inner}>
          <Box flexShrink={0}>
            <Button key="toggle-turn" plain onPress={toggle('turn')}>
              <Text color={glowOf(TURN_COLOR, step, TURN_DEPTH)} bold>
                {`${open.turn ? '▾' : '▸'} ${t.yourTurn}`}
              </Text>
            </Button>
          </Box>
          {!open.turn && (
            <Box flexGrow={1} flexShrink={1} overflow="hidden">
              <Button key="toggle-turn-text" plain onPress={toggle('turn')}>
                <Text wrap="truncate-end">{state.waitingOn ?? t.questionsShort(asked)}</Text>
              </Button>
            </Box>
          )}
          {!open.turn && state.waitingOn !== null && asked > 0 && (
            <Box flexShrink={0}>
              <Text color={QUESTIONS_COLOR} bold>? {asked}</Text>
            </Box>
          )}
        </Box>
        {open.turn && (
          <Box flexDirection="column" marginLeft={2}>
            {state.waitingOn !== null && <Text wrap="wrap">{state.waitingOn}</Text>}
            {asked > 0 && (
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
            )}
            {pressed.kind === 'failed' && (
              <Text color="error" wrap="wrap">{t.answerFailed(pressed.message)}</Text>
            )}
          </Box>
        )}
      </Box>
    )

    // AHORA: the last unit done, the one in progress (or next) and the next pending, live.
    const focus = doing[0] ?? following
    const at = focus === undefined ? -1 : state.units.indexOf(focus)
    const before = at < 0 ? [] : state.units.slice(0, at)
    const after = at < 0 ? state.units : state.units.slice(at + 1)
    const previous = [...(at < 0 ? done : before)].reverse().find(u => u.status === 'done')
    const upcoming = after.find(u => u.status === 'todo')
    const nowPhase = focus?.phase ?? upcoming?.phase
    const nowColor = nowPhase === undefined ? 'claude' : colorOf(nowPhase)
    const position = focus === undefined ? done.length : counted.indexOf(focus) + 1
    const now = (
      <Box key="now" marginTop={1} flexDirection="column" borderStyle="round" borderColor={isComplete ? 'success' : nowColor} paddingX={1}>
        {isComplete ? (
          <Text color="success" bold wrap="wrap">{t.complete}</Text>
        ) : (
          <Box flexDirection="column">
            <Box flexDirection="row" justifyContent="space-between" gap={1}>
              <Text color={nowColor} bold wrap="truncate-end">
                {nowPhase === undefined ? t.now : `${t.now} · ${labelOf(nowPhase, lang)}`}
              </Text>
              <Text dimColor>{t.unitOf(position, counted.length)}</Text>
            </Box>
            {previous !== undefined && row(previous, boxed)}
            {(doing.length > 0 ? doing : focus === undefined ? [] : [focus]).map(unit => row(unit, boxed))}
            {upcoming !== undefined && upcoming !== focus && row(upcoming, boxed)}
            {doing.length > 1 && (
              <Text color="warning" wrap="wrap">{t.severalInProgress(doing.length)}</Text>
            )}
          </Box>
        )}
      </Box>
    )

    // The tasks: every unit of the plan once, in its place, under its phase. A group the person
    // never toggled is open only for the phase in progress; a state with no phases has none.
    const isGroupOpen = (phase: string) => open.groups?.[phase] ?? phase === currentPhase
    const tasks = groupsOf(state.units).map(group => {
      if (group.phase === undefined) {
        return <Box flexDirection="column" marginTop={1}>{group.units.map(unit => row(unit, inner))}</Box>
      }
      const phase = group.phase
      const live = group.units.filter(u => u.status !== 'dropped' && u.status !== 'invalid')
      const finished = live.filter(u => u.status === 'done').length
      const isGroupDone = live.length > 0 && finished === live.length
      const label = `${isGroupOpen(phase) ? '▾' : '▸'} ${isGroupDone ? '✓ ' : ''}${labelOf(phase, lang)}`
      const count = t.phaseCount(finished, live.length)
      return (
        <Box flexDirection="column" marginTop={1}>
          <Box flexDirection="row">
            <Box width={2} />
            {mini(phase, `mini-tasks-${phase}`)}
            <Button
              key={`toggle-group-${phase}`}
              plain
              onPress={() =>
                update($, expanded, now => ({
                  ...now,
                  groups: { ...now.groups, [phase]: !(now.groups?.[phase] ?? phase === currentPhase) },
                }))
              }
            >
              <Text bold color={colorOf(phase)}>
                {`${label}${' '.repeat(Math.max(1, inner - 2 - MINI_WIDTH - 1 - label.length - count.length))}${count}`}
              </Text>
            </Button>
          </Box>
          {isGroupOpen(phase) && group.units.map(unit => row(unit, inner, GROUP_INDENT))}
        </Box>
      )
    })

    return (
      <Box flexDirection="column" paddingX={1}>
        {/* A blank row keeps the heading off the pane's tabs. */}
        <Box key="heading" marginTop={1}>
          <Text>
            <Text backgroundColor="claude" color="inverseText" bold> NZT </Text>{' '}
            <Text bold color="claude">{t.title}</Text>
          </Text>
        </Box>

        {yourTurn}

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
        {unknownPhases.length > 0 && (
          <Text color="warning" wrap="wrap">{t.unknownPhases(unknownPhases, knownPhasesOf(lang))}</Text>
        )}

        <Box marginTop={1} flexDirection="row" justifyContent="space-between">
          <Text>
            <Text bold>{done.length}</Text>
            <Text dimColor>{t.unitsDone(counted.length)}</Text>
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

        {invalid.length > 0 && (
          <Box marginTop={1} flexDirection="column" borderStyle="round" borderColor="warning" paddingX={1}>
            <Text color="warning" wrap="wrap">
              {t.invalid(invalid.length)}
            </Text>
            {invalid.map(unit => row(unit, boxed))}
          </Box>
        )}

        {now}

        {state.units.length > 0 && (
          <Box marginTop={1}>
            <Button key="toggle-tasks" plain onPress={toggle('tasks')}>
              <Text bold color="claude">
                {`☰ ${open.tasks ? t.hideTasks : t.showTasks}`}
                <Text dimColor bold={false}>{` · ${state.units.length}`.padEnd(inner - 2 - (open.tasks ? t.hideTasks : t.showTasks).length)}</Text>
              </Text>
            </Button>
          </Box>
        )}
        {open.tasks && tasks}

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
