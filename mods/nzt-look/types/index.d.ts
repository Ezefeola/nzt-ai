/** The fifteen colors a theme paints with: one per kind of tool, the person's prompt, text and states. */
export type PaletteKey =
  | 'read'
  | 'write'
  | 'run'
  | 'search'
  | 'web'
  | 'mcp'
  | 'other'
  | 'user'
  | 'fg'
  | 'muted'
  | 'surface'
  | 'zebra'
  | 'ok'
  | 'err'
  | 'warn'

export type Palette = Record<PaletteKey, string>

/**
 * A theme's own colors for code, part by part, and the block's background. Only a theme whose
 * palette keys share one color needs them; the rest highlight with their keys.
 */
export type CodeColors = {
  surface: string
  plain: string
  keyword: string
  string: string
  number: string
  comment: string
  type: string
  function: string
  property: string
}

export type Variant = 'dark' | 'light'

/** The variant the person asked for: following Claude Code's theme, or one of the two. */
export type VariantPref = 'auto' | Variant

/** The parts of the usage band, each switched on or off by itself. */
export type BandPart = 'context' | 'fiveHour' | 'week' | 'cost' | 'model' | 'clear'

/**
 * The model the main conversation runs on and its effort. The effort arrives only with a model
 * request, so it is null until the first one, and for a model without effort.
 */
export type Running = { model: string | null; effort: string | null }

/** The parts of the conversation the mod redraws, each switched on or off by itself. */
export type Part =
  | 'tools'
  | 'diffs'
  | 'shell'
  | 'tables'
  | 'code'
  | 'diagrams'
  | 'math'
  | 'callouts'
  | 'commands'
  | 'spinner'
  | 'links'
  | 'prompt'
  | 'fold'
  | 'copy'

export type Prefs = {
  theme: string
  variant: VariantPref
  /** False after `/nzt-look off`: every part draws as Claude Code does; the band and the agent line stay. */
  isDrawing: boolean
  band: Record<BandPart, boolean>
  agentLine: boolean
  parts: Record<Part, boolean>
  calm: boolean
  words: 'theme' | 'claude'
  /** Reads and searches folded to one row, their output hidden. */
  quietReads: boolean
  /** Reads and searches shown one row each instead of grouped. */
  expandReads: boolean
}

/** A theme of the person's own: a repainted one (`mi-<tema>`) or one the agent designed. */
export type CustomTheme = { name: string; label: string; dark: Palette; light: Palette }

/** Which stretch of the kernel's scale the context is in: under 20, from 20, from 30, from 40. */
export type Level = 'low' | 'warn' | 'high' | 'critical'

/** The session's context fill, or none while the engine has not reported one. */
export type Reading = { kind: 'none' } | { kind: 'ok'; percent: number; tokens: number; window: number }

/** One of the plan's windows, as the last response reported it. */
export type Limit = { kind: 'fiveHour' | 'week'; percent: number; resetsAt: number | null }

export type Usage = { reading: Reading; limits: Limit[]; costUsd: number | null }

/** What the last action in the panel left to say. */
export type PanelNotice =
  | { kind: 'saved'; name: string; base: string }
  | { kind: 'invalid'; value: string }
  | { kind: 'pinned' }
  | { kind: 'unpinned' }

/** The panel's open repaint: which color is being changed. */
export type Repaint = { key: PaletteKey } | null

export type Timing = { start: number; end: number | null }

/** What the last turn did, for the footer. */
export type TurnStats = { tools: number; added: number; removed: number }

/** The props the animated band's surface module receives. */
export type LiveBand = {
  /** The still band's model, drawn by the module frame by frame. */
  model: unknown
  percent: number
  isWorking: boolean
}

declare module 'claude-code' {
  interface PluginState {
    'nzt-look': {
      prefs: Prefs
      custom: CustomTheme[]
      folders: Record<string, string>
      /** The session's folder, read once at the start. */
      folder: string | null
      /** Claude Code's `theme` option as last read (`dark`, `light`, `auto`, `custom:…`). */
      themeSetting: string | null
      /** With `auto`, whether the terminal or the system is light; null while unknown. */
      systemLight: boolean | null
      usage: Usage
      running: Running
      /** The highest level the agent has been told this session; null before the first. */
      told: Level | null
      /** When the clear button was first pressed; null while it is not asking to confirm. */
      confirmAt: number | null
      /** True from the confirmed press until the session is cleared. */
      isClearing: boolean
      /** Set once the animated band failed on a surface: drawn still from then on. */
      liveFailed: boolean
      notice: PanelNotice | null
      repaint: Repaint
      /** Rows the person opened or closed with ▸, by tool_use_id; null while untouched. */
      isOpen: StateFamily<boolean | null>
      /** Folded blocks the person unfolded, by the message id and the block's place in it. */
      isUnfolded: StateFamily<boolean>
      turn: TurnStats
      /** Files the agent created or edited this turn, for coloring their paths. */
      touched: Record<string, 'created' | 'edited'>
      /** The minute the countdowns were last drawn at, so the band redraws once a minute. */
      minute: number
      /** When each tool call started and ended, by tool_use_id, for the time on its row. */
      timing: StateFamily<Timing | null>
      /** A shell call's input, by tool_use_id: its result row does not carry the command. */
      input: StateFamily<unknown>
      /** When the turn began: the spinner's time, and the seed that keeps its word for the turn. */
      turnStart: number | null
      /** Tokens the main thread's responses generated this turn, for the spinner. */
      turnTokens: number
      /** True from a main-thread turn's start to its end: only then does the spinner's clock tick. */
      isTurning: boolean
      /** Counts the seconds of a running turn, so the spinner's time redraws. */
      second: number
    }
  }
}
