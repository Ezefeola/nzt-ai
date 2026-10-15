/** Which stretch of the kernel's scale the fill is in: under 20, from 20, from 30, from 40. */
export type Level = 'low' | 'warn' | 'high' | 'critical'

/** The session's context fill, or none while the engine has not reported one. */
export type Reading =
  | { kind: 'none' }
  | { kind: 'ok'; percent: number; tokens: number; window: number }

/** What the hooks hand the animated band: the figure to reach and whether a turn is working. */
export type LiveProps = {
  label: string | null
  percent: number
  tokens: string | null
  width: number
  working: boolean
}

declare module 'claude-code' {
  interface PluginState {
    'nzt-context': {
      reading: Reading
      /** The highest level the model has been told this session; null before the first. */
      told: Level | null
      /** Set once the animated band failed on a surface; the band is drawn still from then on. */
      liveFailed: boolean
    }
  }
}
