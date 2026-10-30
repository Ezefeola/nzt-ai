import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Expanded, Snapshot, Unit } from '../types'
import { nextModeOf, parseState, withDelegation } from './parse'
import { langOf, TEXTS } from './i18n'
import type { Texts } from './i18n'
import { GLOW_STEPS, glowOf } from './glow'
import type { GlowPress, GlowProps } from './glow-live'
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
// Wide enough for Delegar and Delegate, and a space.
const LABEL = 9
// Columns a phase group's units sit in from the list's edge.
const GROUP_INDENT = 4
// Usable columns from which Plan and Mode sit to the left of the character instead of below it.
const SIDE_BY_SIDE_MIN = 40
// The same off the terminal, where the character's pixels take more than its cells.
const SIDE_BY_SIDE_MIN_FLOW = 72
const SIDE_BY_SIDE_GAP = 2

const snapshot = atom({ plugin: 'nzt-state', key: 'snapshot' } as const, {
  kind: 'missing',
} as Snapshot)
const expanded = atom({ plugin: 'nzt-state', key: 'expanded' } as const, {
  turn: false,
  detail: false,
  tasks: false,
  notes: false,
  slices: false,
} as Expanded)
const glow = atom({ plugin: 'nzt-state', key: 'glow' } as const, 0)
const delegating = atom({ plugin: 'nzt-state', key: 'delegating' } as const, null as string | null)

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

/**
 * Steps the project's delegation mode on, writing that key and no other. It reads the file
 * again instead of the snapshot, so a write the agent made since the last poll is kept.
 */
const cycleDelegation = async ($: EngineInterface) => {
  try {
    const raw = await $.fs.read(fileOf())
    const current = parseState(raw)
    if (current.kind !== 'ok') throw new Error(current.kind === 'error' ? current.message : 'no state')
    const next = withDelegation(raw, nextModeOf(current.delegation.mode))
    if (next === undefined) throw new Error('the file is not a JSON object')
    if (next !== raw) await $.fs.write(fileOf(), next)
    await update($, delegating, () => null)
    await refresh($, true)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    await update($, delegating, () => message)
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
        (state.waitingOn !== null || state.units.some(unit => unit.status === 'doing'))
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

  // A click or Enter on the glowing Tu turno folds or unfolds it, as its Button does on the terminal.
  on('ui.message', { requestId: PANE }, async ($, e) => {
    const press = (e.data as Partial<GlowPress> | null)?.press
    if (press === 'turn') await update($, expanded, now => ({ ...now, turn: !now.turn }))
    return {}
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const elements = $.ui.resolve(e)
    const { Box, Text, Button } = elements
    // The terminal is a grid of cells, where columns counted and rows padded with spaces line
    // up. The other surfaces lay boxes out as flex in a proportional font, where spaces in a
    // row collapse and a width counted in cells is a guess: there a column takes what is left.
    const isGrid = e.surface === 'terminal'
    // On the terminal the glow is a value the pane reads, so each step draws it again. Elsewhere
    // a redraw of the pane restarts the hover of its buttons: a Client glows on its own clock,
    // and a surface with none draws the glow at its full tone.
    const Client = !isGrid && 'Client' in elements ? elements.Client : undefined
    const state = await read($, snapshot)
    const open = await read($, expanded)
    const step = isGrid ? await read($, glow) : GLOW_STEPS / 2
    const failedDelegation = await read($, delegating)
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

    const fill = (columns: number) => (isGrid ? { width: columns } : { flexGrow: 1, flexShrink: 1, minWidth: 0 })
    const across = (columns: number) => (isGrid ? { width: columns } : {})
    const padded = (text: string, columns: number) => (isGrid ? text.padEnd(columns) : text)

    // A section the person folds and unfolds with a click, or Enter under the focus.
    // The terminal inverts each Text of a Button under the pointer in its own color
    // and offers no transition, so the label is one Text padded to the full row:
    // the highlight is one even band instead of a patch the length of the word.
    const folding = (label: string, count: number, key: Folded) => (
      <Box marginTop={1}>
        <Button key={`toggle-${key}`} plain onPress={toggle(key)}>
          <Text bold color="claude">
            {padded(`${open[key] === true ? '▾' : '▸'} ${label} · ${count}`, inner)}
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
    // With slices, the counts above are the current slice's; the plan ends with its last one.
    const laterSlice = state.slices
      ?.slice(state.current + 1)
      .find(slice => slice.status === 'todo' || slice.status === 'doing')
    const isPlanComplete = isComplete && laterSlice === undefined

    // A unit as the checklist marks it; the one in progress carries its detail, folded to a
    // row until the person presses it.
    // `place` tells apart the same unit drawn in AHORA and in the tasks, each glow its own.
    const row = (unit: Unit, columns: number, indent: number, place: 'now' | 'tasks' | 'invalid') => {
      const isNext = unit.id === following?.id
      // The unit in progress glows softly in its phase's color, mark and text alike.
      const doingColor = unit.phase === undefined ? DOING_COLOR : colorOf(unit.phase)
      const lit = unit.status === 'doing' ? glowOf(doingColor, step, DOING_DEPTH) : undefined
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
      const glows = Client !== undefined && unit.status === 'doing'
      const glowing = (part: string, props: Omit<GlowProps, 'color' | 'depth' | 'press'>) =>
        Client !== undefined && (
          <Client
            key={`glow-${part}-${place}-${unit.id}`}
            module="./glow-live.tsx"
            props={{ ...props, color: doingColor, depth: DOING_DEPTH, press: null }}
          />
        )
      return (
        <Box flexDirection="column" marginLeft={indent}>
          {/* Mark and id keep their columns and sit on the first line: on the desktop a row
              shrinks its fixed boxes and centres them against the text's lines. */}
          <Box flexDirection="row" alignItems="flex-start">
            <Box width={2} flexShrink={0}>
              {glows ? (
                glowing('mark', { text: mark.glyph, isBold: true, wrap: 'truncate-end' })
              ) : (
                <Text color={mark.color} bold={unit.status === 'doing'}>{mark.glyph}</Text>
              )}
            </Box>
            <Box width={idWidth} flexShrink={0}>
              <Text dimColor>{unit.id}</Text>
            </Box>
            <Box {...fill(textWidth)}>
              {/* A Button holds text only: the unit's text is what a press unfolds the detail from. */}
              {glows ? (
                glowing('text', { text: unit.do, isBold: true, wrap: 'wrap' })
              ) : hasDetail ? (
                <Button key={`detail-${unit.id}`} plain onPress={toggle('detail')}>{text}</Button>
              ) : (
                text
              )}
            </Box>
          </Box>
          {hasDetail && (
            <Box marginLeft={2 + idWidth} {...across(textWidth)}>
              {/* Where the unit's text glows outside a Button, the detail is what a press unfolds. */}
              {glows ? (
                <Button key={`detail-${place}-${unit.id}`} plain onPress={toggle('detail')}>
                  <Text dimColor wrap={open.detail ? 'wrap' : 'truncate-end'}>{unit.detail}</Text>
                </Button>
              ) : (
                <Text dimColor wrap={open.detail ? 'wrap' : 'truncate-end'}>{unit.detail}</Text>
              )}
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
    const batch = state.planUnits.filter(u => state.autonomy.units.includes(u.id))
    const unknownIds = state.autonomy.units.filter(id => !state.planUnits.some(u => u.id === id))
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

    // Its box: a width in cells on the terminal; elsewhere its own size beside Plan, or the
    // whole row when it stands above them.
    const character = (box: object) =>
      characterPhase !== undefined && (
          <Box flexDirection="column" alignItems="center" {...box}>
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
      <Box flexDirection="column" {...fill(columns)}>
        <Box flexDirection="row" alignItems="flex-start">
          <Box width={LABEL} flexShrink={0}>
            <Text dimColor>{t.plan}</Text>
          </Box>
          {state.approved ? (
            <Text color="success">{t.approved}</Text>
          ) : (
            <Text color="warning">{t.notApproved}</Text>
          )}
        </Box>
        <Box flexDirection="row" alignItems="flex-start">
          <Box width={LABEL} flexShrink={0}>
            <Text dimColor>{t.mode}</Text>
          </Box>
          <Box {...fill(columns - LABEL)}>
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
        {/* The one thing the pane writes: a press steps the mode, auto → ask → off. */}
        <Box flexDirection="row" alignItems="flex-start">
          <Box width={LABEL} flexShrink={0}>
            <Text dimColor>{t.delegate}</Text>
          </Box>
          <Box {...fill(columns - LABEL)}>
            <Button key="cycle-delegation" plain onPress={() => cycleDelegation($)}>
              <Text wrap="wrap">
                <Text color={state.delegation.mode === 'off' ? 'inactive' : 'claude'} bold>
                  {state.delegation.mode}
                </Text>
                <Text dimColor>
                  {t.delegation[state.delegation.mode]}
                  {state.delegation.isSet ? '' : t.delegationDefault}
                </Text>
                {state.delegation.invalid !== undefined && (
                  <Text color="warning">{t.delegationInvalid(state.delegation.invalid)}</Text>
                )}
              </Text>
            </Button>
          </Box>
        </Box>
        {failedDelegation !== null && (
          <Text color="error" wrap="wrap">{t.delegationFailed(failedDelegation)}</Text>
        )}
        <Box marginTop={1} {...across(columns)}>
          <Text wrap="wrap">
            <Text dimColor>{t.goal} </Text>
            <Text bold>{state.goal}</Text>
          </Text>
        </Box>
      </Box>
    )

    // Narrower than this, the column beside the character is too thin to read: stack them.
    // Off the terminal the character is drawn in pixels wider than its cells, so it needs more.
    const isSideBySide =
      characterPhase !== undefined && inner >= (isGrid ? SIDE_BY_SIDE_MIN : SIDE_BY_SIDE_MIN_FLOW)

    // Tu turno: what the run waits on from the person, folded to one row whose title glows.
    const isYourTurn = state.waitingOn !== null
    const yourTurn = isYourTurn && (
      <Box key="your-turn" marginTop={1} flexDirection="column">
        {/* A Button holds text only: the title and the folded text are each one, pressing alike. */}
        <Box flexDirection="row" gap={1} {...across(inner)}>
          <Box flexShrink={0}>
            {Client !== undefined ? (
              <Client
                key="glow-turn"
                module="./glow-live.tsx"
                props={{
                  text: `${open.turn ? '▾' : '▸'} ${t.yourTurn}`,
                  color: TURN_COLOR,
                  depth: TURN_DEPTH,
                  isBold: true,
                  wrap: 'truncate-end',
                  press: 'turn',
                } satisfies GlowProps}
              />
            ) : (
              <Button key="toggle-turn" plain onPress={toggle('turn')}>
                <Text color={glowOf(TURN_COLOR, step, TURN_DEPTH)} bold>
                  {`${open.turn ? '▾' : '▸'} ${t.yourTurn}`}
                </Text>
              </Button>
            )}
          </Box>
          {!open.turn && (
            <Box flexGrow={1} flexShrink={1} overflow="hidden">
              <Button key="toggle-turn-text" plain onPress={toggle('turn')}>
                <Text wrap="truncate-end">{state.waitingOn}</Text>
              </Button>
            </Box>
          )}
        </Box>
        {open.turn && (
          <Box flexDirection="column" marginLeft={2}>
            <Text wrap="wrap">{state.waitingOn}</Text>
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
      <Box key="now" marginTop={1} flexDirection="column" borderStyle="round" borderColor={isPlanComplete ? 'success' : nowColor} paddingX={1}>
        {isPlanComplete ? (
          <Text color="success" bold wrap="wrap">{t.complete}</Text>
        ) : (
          <Box flexDirection="column">
            <Box flexDirection="row" justifyContent="space-between" gap={1}>
              <Text color={nowColor} bold wrap="truncate-end">
                {nowPhase === undefined ? t.now : `${t.now} · ${labelOf(nowPhase, lang)}`}
              </Text>
              <Text dimColor>{t.unitOf(position, counted.length)}</Text>
            </Box>
            {previous !== undefined && row(previous, boxed, 0, "now")}
            {(doing.length > 0 ? doing : focus === undefined ? [] : [focus]).map(unit => row(unit, boxed, 0, "now"))}
            {upcoming !== undefined && upcoming !== focus && row(upcoming, boxed, 0, "now")}
            {(upcoming === undefined || upcoming === focus) && laterSlice !== undefined && (
              <Text dimColor wrap="truncate-end">{`▷ ${t.nextSlice(`${laterSlice.id} · ${laterSlice.name}`)}`}</Text>
            )}
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
        return <Box flexDirection="column" marginTop={1}>{group.units.map(unit => row(unit, inner, 0, "tasks"))}</Box>
      }
      const phase = group.phase
      const live = group.units.filter(u => u.status !== 'dropped' && u.status !== 'invalid')
      const finished = live.filter(u => u.status === 'done').length
      const isGroupDone = live.length > 0 && finished === live.length
      const label = `${isGroupOpen(phase) ? '▾' : '▸'} ${isGroupDone ? '✓ ' : ''}${labelOf(phase, lang)}`
      const count = t.phaseCount(finished, live.length)
      const toggleGroup = () =>
        update($, expanded, now => ({
          ...now,
          groups: { ...now.groups, [phase]: !(now.groups?.[phase] ?? phase === currentPhase) },
        }))
      return (
        <Box flexDirection="column" marginTop={1}>
          {isGrid ? (
            <Box flexDirection="row">
              <Box width={2} />
              {mini(phase, `mini-tasks-${phase}`)}
              <Button key={`toggle-group-${phase}`} plain onPress={toggleGroup}>
                <Text bold color={colorOf(phase)}>
                  {`${label}${' '.repeat(Math.max(1, inner - 2 - MINI_WIDTH - 1 - label.length - count.length))}${count}`}
                </Text>
              </Button>
            </Box>
          ) : (
            <Box flexDirection="row" alignItems="center" gap={1}>
              {mini(phase, `mini-tasks-${phase}`)}
              <Box flexGrow={1} flexShrink={1} minWidth={0}>
                <Button key={`toggle-group-${phase}`} plain onPress={toggleGroup}>
                  <Text bold color={colorOf(phase)}>{label}</Text>
                </Button>
              </Box>
              <Text dimColor>{count}</Text>
            </Box>
          )}
          {isGroupOpen(phase) && group.units.map(unit => row(unit, inner, GROUP_INDENT, "tasks"))}
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
            {character(isGrid ? { width: WIDTH } : { flexShrink: 0 })}
          </Box>
        ) : (
          <Box flexDirection="column">
            {characterPhase !== undefined && <Box marginTop={1}>{character(fill(inner))}</Box>}
            <Box marginTop={1}>{summary(inner)}</Box>
          </Box>
        )}

        {/* A plan cut into slices: which one runs, and every slice folded below it, since a
            long plan would push the phases off the pane. One slice needs no list. */}
        {state.slices !== null && state.slices.length > 0 && (
          <Box key="slices" marginTop={1} flexDirection="column">
            <Box flexDirection="row" alignItems="flex-start">
              <Box width={LABEL} flexShrink={0}>
                <Text dimColor>{t.slice}</Text>
              </Box>
              <Box {...fill(inner - LABEL)}>
                <Text bold wrap="truncate-end">
                  {t.sliceOf(state.current + 1, state.slices.length, state.slices[state.current]?.name ?? '')}
                </Text>
              </Box>
            </Box>
            {state.slices.length > 1 && folding(t.slices, state.slices.length, 'slices')}
            {state.slices.length > 1 && open.slices === true && state.slices.map((slice, index) => (
              <Box flexDirection="row">
                <Box width={2}>
                  <Text color={MARK[slice.status].color}>{MARK[slice.status].glyph}</Text>
                </Box>
                <Box {...fill(inner - 2)}>
                  <Text
                    wrap="truncate-end"
                    bold={index === state.current}
                    dimColor={index !== state.current}
                    strikethrough={slice.status === 'dropped'}
                  >
                    {`${slice.id} · ${slice.name}`}
                  </Text>
                </Box>
              </Box>
            ))}
            {state.slices.filter(slice => slice.status === 'doing').length > 1 && (
              <Text color="warning" wrap="wrap">
                {t.severalSlicesInProgress(state.slices.filter(slice => slice.status === 'doing').length)}
              </Text>
            )}
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
        {isGrid ? (
          <Text>
            <Text color={isComplete ? 'success' : 'claude'}>{'━'.repeat(filled)}</Text>
            <Text color="inactive">{'━'.repeat(inner - filled)}</Text>
          </Text>
        ) : (
          <Box key="progress" flexDirection="row" height={1} backgroundColor="inactive">
            <Box width={`${Math.round(ratio * 100)}%`} backgroundColor={isComplete ? 'success' : 'claude'} />
          </Box>
        )}
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
            {invalid.map(unit => row(unit, boxed, 0, "invalid"))}
          </Box>
        )}

        {now}

        {state.units.length > 0 && (
          <Box marginTop={1}>
            <Button key="toggle-tasks" plain onPress={toggle('tasks')}>
              <Text bold color="claude">
                {`☰ ${open.tasks ? t.hideTasks : t.showTasks}`}
                <Text dimColor bold={false}>{padded(` · ${state.units.length}`, inner - 2 - (open.tasks ? t.hideTasks : t.showTasks).length)}</Text>
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
                <Box {...fill(inner - 2)}>
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
