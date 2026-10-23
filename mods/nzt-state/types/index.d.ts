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

/** A slice of a plan cut into slices (D73 of specs/nzt-core.md), without its phases. */
export type Slice = { id: string; name: string; status: Status; rawStatus?: string }

/** How the agent hands readings to a subagent (D71 of specs/nzt-core.md). */
export type DelegationMode = 'auto' | 'ask' | 'off'

/**
 * The mode in force: `ask` when the file does not set it or sets something else. `isSet` says
 * the file wrote a valid one; `invalid` keeps a value that is not a mode, as written.
 */
export type Delegation = { mode: DelegationMode; isSet: boolean; invalid?: string }

export type Snapshot =
  | { kind: 'missing' }
  | { kind: 'error'; message: string }
  | {
      kind: 'ok'
      goal: string
      /**
       * The plan's slices in order, null in a plan that is not cut. With slices, `phases` and
       * `units` are the current slice's, and `current` is its index.
       */
      slices: Slice[] | null
      current: number
      /** Every unit of the plan, across slices: what a batch is counted against. */
      planUnits: Unit[]
      /** The run's phases in order with their status; null in a state written before them. */
      phases: Phase[] | null
      /** The single current phase an older state.json carries instead of `phases`. */
      legacyPhase: string | null
      approved: boolean
      updated: string
      units: Unit[]
      /** The batch the user authorised to run without stopping; both empty is accompanied. */
      autonomy: { units: number[]; keepStops: number[] }
      delegation: Delegation
      waitingOn: string | null
      notes: string[]
    }

/**
 * What the person unfolded in the pane: Tu turno, the detail of the unit in progress, the
 * tasks and the notes. `groups` holds the phase groups the person toggled, keyed by phase;
 * one never toggled follows the phase in progress.
 */
export type Expanded = {
  turn: boolean
  detail: boolean
  tasks: boolean
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
    /**
     * `glow` is the step of the soft glow of Tu turno and the unit in progress, while either shows.
     * `delegating` is why the last press on Delegar could not write the mode, or null.
     */
    'nzt-state': {
      snapshot: Snapshot
      expanded: Expanded
      answering: Answering
      glow: number
      delegating: string | null
    }
    /**
     * The one value read of nzt-questions, as its own contract declares it. Not a dependency,
     * so the pane works without it installed, and its contract is not laid here.
     */
    'nzt-questions': { pending: number }
  }
}
