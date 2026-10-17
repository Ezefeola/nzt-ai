export type UnitStatus = 'todo' | 'doing' | 'done' | 'dropped'

/** A status the kernel defines, or `invalid` for any other value the file carries. */
export type Status = UnitStatus | 'invalid'

/**
 * `phase` is the name of the phase the unit sits in; absent in a state from before D62.
 * `rawStatus` is the value the file wrote, kept when `status` is `invalid`.
 */
export type Unit = {
  id: number
  do: string
  status: Status
  rawStatus?: string
  detail?: string
  phase?: string
}

export type Phase = { name: string; status: Status; rawStatus?: string }

export type Snapshot =
  | { kind: 'missing' }
  | { kind: 'error'; message: string }
  | {
      kind: 'ok'
      goal: string
      /** The run's phases in order with their status; null in a state written before them. */
      phases: Phase[] | null
      /** The single current phase an older state.json carries instead of `phases`. */
      legacyPhase: string | null
      approved: boolean
      updated: string
      units: Unit[]
      /** The batch the user authorised to run without stopping; both empty is accompanied. */
      autonomy: { units: number[]; keepStops: number[] }
      waitingOn: string | null
      notes: string[]
    }

/**
 * Which folded sections of the pane the person opened. `groups` holds the phase groups the
 * person toggled, keyed `<section>:<phase>`; one never toggled follows the phase in progress.
 */
export type Expanded = {
  todo: boolean
  done: boolean
  dropped: boolean
  notes: boolean
  groups?: Record<string, boolean>
}

/**
 * What a press on Contestar left: nzt-questions opening once Claude's turn ends, or the
 * opening failed and why; nothing pending is `idle`.
 */
export type Answering = { kind: 'idle' } | { kind: 'waiting' } | { kind: 'failed'; message: string }

declare module 'claude-code' {
  interface PluginState {
    'nzt-state': { snapshot: Snapshot; expanded: Expanded; answering: Answering }
    /**
     * The one value read of nzt-questions, as its own contract declares it. Not a dependency,
     * so the pane works without it installed, and its contract is not laid here.
     */
    'nzt-questions': { pending: number }
  }
}
