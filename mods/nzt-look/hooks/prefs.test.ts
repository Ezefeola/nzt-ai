import { expect, test } from 'claude-code/testing'

import { slugOf } from './design'
import { DEFAULT_PREFS, namesOf, ownNameOf, paletteOf, parseCustom, parseFolders, parsePrefs, redraws, themeFor } from './prefs'

const NAMES = namesOf([])

test('a store with nothing in it reads as the defaults: default, every part on', async () => {
  expect(parsePrefs(undefined, NAMES)).toEqual(DEFAULT_PREFS)
  expect(DEFAULT_PREFS.theme).toBe('default')
})

test('a store that chose nzt keeps it', async () => {
  expect(parsePrefs({ theme: 'nzt' }, NAMES).theme).toBe('nzt')
})

test('default comes first and leaves the conversation to Claude Code; any other theme redraws it', async () => {
  expect(NAMES[0]).toBe('default')
  expect(redraws(DEFAULT_PREFS, 'default')).toBe(false)
  expect(redraws(DEFAULT_PREFS, 'nzt')).toBe(true)
  expect(redraws({ ...DEFAULT_PREFS, isDrawing: false }, 'nzt')).toBe(false)
})

test('default paints what the mod still draws with mono, and a repaint of it is mi-mono', async () => {
  for (const variant of ['dark', 'light'] as const) expect(paletteOf('default', [], variant)).toEqual(paletteOf('mono', [], variant))
  expect(ownNameOf('default')).toBe('mi-mono')
})

test('a theme of the person own is never kept as default', async () => {
  expect(slugOf('Default')).toBe('mi-default')
})

test('a folder can be pinned to default', async () => {
  expect(parseFolders({ '/repo/a': 'default' }, NAMES)).toEqual({ '/repo/a': 'default' })
})

test('a broken store keeps what it can read and defaults the rest', async () => {
  const prefs = parsePrefs({ theme: 'dracula', variant: 'purple', band: { cost: false, clear: 'yes' }, calm: 1 }, NAMES)
  expect(prefs.theme).toBe('dracula')
  expect(prefs.variant).toBe('auto')
  expect(prefs.band).toEqual({ context: true, fiveHour: true, week: true, cost: false, model: true })
  expect(prefs.calm).toBe(false)
})

test('a theme the mod no longer has falls back to default', async () => {
  expect(parsePrefs({ theme: 'mi-borrado' }, NAMES).theme).toBe('default')
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
