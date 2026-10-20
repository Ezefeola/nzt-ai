import { expect, test } from 'claude-code/testing'

import { DEFAULT_PREFS, namesOf, parseCustom, parseFolders, parsePrefs, themeFor } from './prefs'

const NAMES = namesOf([])

test('a store with nothing in it reads as the defaults: nzt, every part on', async () => {
  expect(parsePrefs(undefined, NAMES)).toEqual(DEFAULT_PREFS)
  expect(DEFAULT_PREFS.theme).toBe('nzt')
})

test('a broken store keeps what it can read and defaults the rest', async () => {
  const prefs = parsePrefs({ theme: 'dracula', variant: 'purple', band: { cost: false, clear: 'yes' }, calm: 1 }, NAMES)
  expect(prefs.theme).toBe('dracula')
  expect(prefs.variant).toBe('auto')
  expect(prefs.band).toEqual({ context: true, fiveHour: true, week: true, cost: false, model: true, clear: true })
  expect(prefs.calm).toBe(false)
})

test('a theme the mod no longer has falls back to nzt', async () => {
  expect(parsePrefs({ theme: 'mi-borrado' }, NAMES).theme).toBe('nzt')
})

test('a folder pinned to a theme uses it there and the usual one elsewhere', async () => {
  const folders = parseFolders({ '/repo/a': 'nord', '/repo/b': 'no-such-theme' }, NAMES)
  expect(folders).toEqual({ '/repo/a': 'nord' })
  const prefs = { ...DEFAULT_PREFS, theme: 'ayu' }
  expect(themeFor(prefs, folders, '/repo/a')).toBe('nord')
  expect(themeFor(prefs, folders, '/repo/c')).toBe('ayu')
})

test('a custom theme missing a color is dropped, one complete is kept', async () => {
  const palette = Object.fromEntries(
    ['read', 'write', 'run', 'search', 'web', 'mcp', 'other', 'user', 'fg', 'muted', 'surface', 'zebra', 'ok', 'err', 'warn'].map(key => [key, '#123456']),
  )
  const custom = parseCustom([
    { name: 'mi-nzt', dark: palette, light: palette },
    { name: 'roto', dark: { ...palette, fg: 'rojo' }, light: palette },
  ])
  expect(custom.map(theme => theme.name)).toEqual(['mi-nzt'])
})
