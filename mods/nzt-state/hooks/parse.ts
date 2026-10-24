import type { Delegation, DelegationMode, Snapshot, Status, Unit, UnitStatus } from '../types'

const STATUSES: UnitStatus[] = ['todo', 'doing', 'done', 'dropped']

/** In the order a press on Delegar steps through them. */
export const DELEGATION_MODES: DelegationMode[] = ['auto', 'ask', 'off']

const isMode = (value: unknown): value is DelegationMode =>
  DELEGATION_MODES.includes(value as DelegationMode)

/** Absent or not a mode is `ask`, as `nzt-plan` says; a value that is not one is kept to show. */
const delegationOf = (value: unknown): Delegation =>
  isMode(value)
    ? { mode: value, isSet: true }
    : value === undefined
      ? { mode: 'ask', isSet: false }
      : { mode: 'ask', isSet: false, invalid: JSON.stringify(value) }

/** The mode a press on Delegar moves to: auto → ask → off → auto. */
export const nextModeOf = (mode: DelegationMode): DelegationMode =>
  DELEGATION_MODES[(DELEGATION_MODES.indexOf(mode) + 1) % DELEGATION_MODES.length] ?? 'ask'

/**
 * The text of Plan/state.json with `delegation` set to `mode` and every other byte as it was,
 * so a press does not reformat the agent's file. A new key goes beside `approved`, as the
 * schema in `nzt-plan` writes it. Undefined when the text is not a JSON object: nothing is written.
 */
export const withDelegation = (raw: string, mode: DelegationMode): string | undefined => {
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return undefined
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return undefined
  const state = data as Record<string, unknown>
  if (state.delegation === mode) return raw

  const isSet = 'delegation' in state
  const value = `"delegation": "${mode}"`
  const candidates = isSet
    ? [raw.replace(/"delegation"\s*:\s*("(?:[^"\\]|\\.)*"|true|false|null|-?[\d.eE+-]+)/, value)]
    : [
        raw.replace(/("approved"\s*:\s*(?:true|false))(\s*,)/, `$1, ${value}$2`),
        raw.replace(/^(\s*\{)(\s*)/, `$1$2${value},$2`),
      ]
  // A text edit is kept only if it changed that key and nothing else.
  const isRight = (text: string) => {
    try {
      const parsed = JSON.parse(text) as Record<string, unknown>
      return (
        parsed.delegation === mode &&
        Object.keys(parsed).length === Object.keys(state).length + (isSet ? 0 : 1)
      )
    } catch {
      return false
    }
  }
  return candidates.find(isRight) ?? `${JSON.stringify({ ...state, delegation: mode }, null, 2)}\n`
}

/** A value outside the four of `nzt-plan` is kept as written, so the pane can show it. */
const statusOf = (value: unknown): { status: Status; rawStatus?: string } =>
  STATUSES.includes(value as UnitStatus)
    ? { status: value as UnitStatus }
    : { status: 'invalid', rawStatus: value === undefined ? '' : JSON.stringify(value) }

const text = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback

/** Turns the text of Plan/state.json into what the pane draws. */
export const parseState = (raw: string): Snapshot => {
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch (error) {
    return { kind: 'error', message: `invalid JSON: ${(error as Error).message}` }
  }
  if (typeof data !== 'object' || data === null) {
    return { kind: 'error', message: 'the file is not a JSON object' }
  }
  const state = data as Record<string, unknown>

  const unitsOf = (value: unknown, phase?: string): Unit[] =>
    Array.isArray(value)
      ? value.flatMap(item => {
          if (typeof item !== 'object' || item === null) return []
          const unit = item as Record<string, unknown>
          return [
            {
              id: typeof unit.id === 'number' ? unit.id : 0,
              do: text(unit.do),
              ...statusOf(unit.status),
              detail: typeof unit.detail === 'string' ? unit.detail : undefined,
              phase,
            },
          ]
        })
      : []

  const phasesOf = (value: unknown) =>
    Array.isArray(value)
      ? value.flatMap(item => {
          if (typeof item !== 'object' || item === null) return []
          const phase = item as Record<string, unknown>
          if (typeof phase.name !== 'string') return []
          return [{ name: phase.name, ...statusOf(phase.status), units: phase.units }]
        })
      : null

  const sliced = Array.isArray(state.slices)
    ? state.slices.flatMap((item, index) => {
        if (typeof item !== 'object' || item === null) return []
        const slice = item as Record<string, unknown>
        const id = text(slice.id, `#${index + 1}`)
        return [{ id, name: text(slice.name, id), ...statusOf(slice.status), phases: phasesOf(slice.phases) ?? [] }]
      })
    : null

  // The slice in progress; with none, the first still to do; with neither, the last one.
  const current =
    sliced === null
      ? -1
      : [sliced.findIndex(one => one.status === 'doing'), sliced.findIndex(one => one.status === 'todo'), sliced.length - 1]
          .find(index => index >= 0) ?? -1

  const phases = sliced === null ? phasesOf(state.phases) : (sliced[current]?.phases ?? [])

  // Units live in their phase (D62); a state written before that keeps them at the top.
  const units = [
    ...(phases ?? []).flatMap(phase => unitsOf(phase.units, phase.name)),
    ...(sliced === null ? unitsOf(state.units) : []),
  ]
  const planUnits =
    sliced === null
      ? units
      : sliced.flatMap(slice => slice.phases.flatMap(phase => unitsOf(phase.units, phase.name)))

  const autonomy = state.autonomy as Record<string, unknown> | undefined
  const ids = (value: unknown) =>
    Array.isArray(value) ? value.filter((id): id is number => typeof id === 'number') : []

  return {
    kind: 'ok',
    goal: text(state.goal, '(no goal)'),
    slices: sliced === null ? null : sliced.map(({ phases: _, ...slice }) => slice),
    current,
    planUnits,
    phases: phases === null ? null : phases.map(({ units: _, ...phase }) => phase),
    legacyPhase: typeof state.phase === 'string' ? state.phase : null,
    approved: state.approved === true,
    updated: text(state.updated),
    units,
    autonomy: { units: ids(autonomy?.units), keepStops: ids(autonomy?.keep_stops) },
    delegation: delegationOf(state.delegation),
    waitingOn: typeof state.waiting_on === 'string' ? state.waiting_on : null,
    notes: Array.isArray(state.notes)
      ? state.notes.filter((note): note is string => typeof note === 'string')
      : [],
  }
}
