import type { Snapshot, Status, Unit, UnitStatus } from '../types'

const STATUSES: UnitStatus[] = ['todo', 'doing', 'done', 'dropped']

/** A value outside the kernel's four is kept as written, so the pane can show it. */
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

  const phases = Array.isArray(state.phases)
    ? state.phases.flatMap(item => {
        if (typeof item !== 'object' || item === null) return []
        const phase = item as Record<string, unknown>
        if (typeof phase.name !== 'string') return []
        return [{ name: phase.name, ...statusOf(phase.status), units: phase.units }]
      })
    : null

  // Units live in their phase (D62); a state written before that keeps them at the top.
  const units = [
    ...(phases ?? []).flatMap(phase => unitsOf(phase.units, phase.name)),
    ...unitsOf(state.units),
  ]

  const autonomy = state.autonomy as Record<string, unknown> | undefined
  const ids = (value: unknown) =>
    Array.isArray(value) ? value.filter((id): id is number => typeof id === 'number') : []

  return {
    kind: 'ok',
    goal: text(state.goal, '(no goal)'),
    phases: phases === null ? null : phases.map(({ units: _, ...phase }) => phase),
    legacyPhase: typeof state.phase === 'string' ? state.phase : null,
    approved: state.approved === true,
    updated: text(state.updated),
    units,
    autonomy: { units: ids(autonomy?.units), keepStops: ids(autonomy?.keep_stops) },
    waitingOn: typeof state.waiting_on === 'string' ? state.waiting_on : null,
    notes: Array.isArray(state.notes)
      ? state.notes.filter((note): note is string => typeof note === 'string')
      : [],
  }
}
