/** One NZT mod as the pane found it: whether this session has it, and its installed version if known. */
export type Found = { id: string; isInstalled: boolean; version?: string }

/** What the pane knows about the mods: still looking, or each one of the catalog. */
export type Mods = { kind: 'loading' } | { kind: 'ok'; mods: Found[] }

/**
 * What a press on a mod's button left: its pane opening once Claude's turn ends, its install
 * command copied, the copy refused by the terminal, or the opening failed and why.
 */
export type Action =
  | { kind: 'waiting' }
  | { kind: 'copied' }
  | { kind: 'copyFailed' }
  | { kind: 'failed'; message: string }

declare module 'claude-code' {
  interface PluginState {
    'nzt-hub': {
      mods: Mods
      /** By the mod's id; a mod with nothing pending has no entry. */
      actions: Record<string, Action>
    }
  }
}
