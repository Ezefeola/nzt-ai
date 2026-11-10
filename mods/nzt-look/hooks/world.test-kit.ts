import { mock } from 'claude-code/testing'
import type { TestBody } from 'claude-code/testing'

export type Engine = Parameters<TestBody>[0]
export type On = Parameters<TestBody>[1]

/**
 * What a session answers beneath the mod: a store and a clock in memory, a pane that places, a
 * clipboard that takes, the command registry, the debug log and the session's figures. A test
 * that answers the store itself passes `null`. The store holds `nzt` unless the test names a
 * theme, because under `default` the mod redraws nothing.
 */
export const world = (on: On, store: Record<string, unknown> | null = {}, now = Date.parse('2026-10-18T12:00:00Z')) => {
  const seen = { opens: 0, copies: [] as string[], toasts: [] as string[], clock: mock.clock(on, { now }) }
  if (store !== null) mock.store(on, { ...store, prefs: { theme: 'nzt', ...(store.prefs as object | undefined) } })
  on('command.register', async (_, e) => ({ value: { command: (e as { name: string }).name } }) as never)
  on('ui.log', async () => ({ value: undefined }) as never)
  on('ui.open', async () => {
    seen.opens++
    return { value: { isPlaced: true } } as never
  })
  on('ui.close', async () => ({ value: undefined }) as never)
  on('ui.copy', async (_, e) => {
    seen.copies.push((e as { text: string }).text)
    return { value: { isCopied: true } } as never
  })
  on('ui.toast', async (_, e) => {
    seen.toasts.push((e as { text: string }).text)
    return { value: undefined } as never
  })
  on('session.measure', async (_, e) => ({ changed: (e as { changed: unknown[] }).changed }) as never)
  on('session.cwd', async () => ({ value: '/repo' }) as never)
  // What Claude Code draws where the mod passes: one Text that says so.
  on('ui.render', async ($, e) => ($.ui.resolve(e) as { Text: (props: { children: string }) => never }).Text({ children: 'claude-code' }))
  return seen
}

export const start = ($: Engine) => $.session.start({ cwd: '/repo' } as never).catch(() => undefined)
