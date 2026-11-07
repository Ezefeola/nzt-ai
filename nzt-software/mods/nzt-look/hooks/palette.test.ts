import { describe, expect, test } from 'claude-code/testing'

import type { Variant } from '../types'
import { contrastOf, legible, MIN_CONTRAST } from './contrast'
import { variantOf } from './light'
import { KEYS, missingOf, paletteFrom, TEXT_KEYS, THEMES } from './palette'
import { paletteOf, rawPaletteOf } from './prefs'
import { bandOf } from './reply'

const VARIANTS: readonly Variant[] = ['dark', 'light']

describe('every theme, in both variants, writes text that reads on its surfaces', () => {
  for (const theme of THEMES) {
    for (const variant of VARIANTS) {
      test(`${theme.name} ${variant}`, async () => {
        const palette = paletteOf(theme.name, [], variant)
        const below = TEXT_KEYS.flatMap(key =>
          [palette.surface, palette.zebra]
            .map(back => ({ key, back, ratio: contrastOf(palette[key], back) }))
            .filter(pair => pair.ratio < MIN_CONTRAST),
        )
        expect(below).toEqual([])
      })
    }
  }
})

describe('every theme, in both variants, writes the desktop table header on its band', () => {
  for (const theme of THEMES) {
    for (const variant of VARIANTS) {
      test(`${theme.name} ${variant}`, async () => {
        const palette = paletteOf(theme.name, [], variant)
        expect(contrastOf(palette.fg, bandOf(palette))).toBeGreaterThanOrEqual(MIN_CONTRAST)
      })
    }
  }
})

// Material's dark theme guidance: high-emphasis text is 87% white on #121212, and saturated
// colors vibrate against a dark background. Above either, a long session tires the eye.
const HIGH_EMPHASIS = contrastOf('#e0e0e0', '#121212')
const VIVID_CHROMA = 0.6
const chromaOf = (hex: string) => {
  const channels = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
  return Math.max(...channels) - Math.min(...channels)
}

describe('every dark palette, as written, stays easy on the eye', () => {
  for (const theme of THEMES) {
    test(theme.name, async () => {
      const glaring = TEXT_KEYS.filter(key => contrastOf(theme.dark[key], theme.dark.surface) > HIGH_EMPHASIS || chromaOf(theme.dark[key]) >= VIVID_CHROMA)
      expect(glaring.map(key => `${key} ${theme.dark[key]}`)).toEqual([])
    })
  }
})

test('there are sixteen themes, nzt first, each with every color', async () => {
  expect(THEMES.length).toBe(16)
  expect(THEMES[0]!.name).toBe('nzt')
  for (const theme of THEMES) expect(Object.keys(theme.dark)).toEqual([...KEYS])
})

test('nzt reads already, so the adjustment leaves the brand colors as they are', async () => {
  for (const variant of VARIANTS) expect(paletteOf('nzt', [], variant)).toEqual(rawPaletteOf('nzt', [], variant))
})

test("a color that does not read is lightened on a dark surface and keeps the rest of its theme", async () => {
  const raw = rawPaletteOf('one-dark', [], 'dark')
  const adjusted = paletteOf('one-dark', [], 'dark')
  expect(contrastOf(raw.muted, raw.surface)).toBeLessThan(MIN_CONTRAST)
  expect(adjusted.muted).not.toBe(raw.muted)
  expect(adjusted.fg).toBe(raw.fg)
  expect(adjusted.surface).toBe(raw.surface)
})

test('a color is darkened on a light surface until it reads', async () => {
  const fixed = legible('#f2ae49', ['#f3f4f5'], 'light')
  expect(contrastOf(fixed, '#f3f4f5')).toBeGreaterThanOrEqual(MIN_CONTRAST)
})

test('a theme with no light palette of its own gets one derived on white', async () => {
  const light = rawPaletteOf('dracula', [], 'light')
  expect(light.surface).toBe('#ffffff')
  expect(contrastOf(light.fg, light.surface)).toBeGreaterThan(10)
})

test("the variant: forced first, then Claude Code's theme, then the system, then dark", async () => {
  expect(variantOf('light', 'dark', false)).toBe('light')
  expect(variantOf('auto', 'custom:nzt-look:nzt-light', null)).toBe('light')
  expect(variantOf('auto', 'dark-daltonized', true)).toBe('dark')
  expect(variantOf('auto', 'auto', true)).toBe('light')
  expect(variantOf('auto', 'auto', null)).toBe('dark')
})

test('a palette read from data: short hex widened, a missing color named', async () => {
  const full = Object.fromEntries(KEYS.map(key => [key, '#abc']))
  expect(paletteFrom(full)?.fg).toBe('#aabbcc')
  expect(missingOf({ ...full, err: 'red', warn: undefined })).toEqual(['err', 'warn'])
})

test('the code colors of nzt read at 4.5:1 on the block and on the surface, in both variants', async () => {
  const nzt = THEMES.find(theme => theme.name === 'nzt')!
  for (const variant of ['dark', 'light'] as const) {
    const code = nzt.code![variant]
    const { surface, ...colors } = code
    const below = Object.entries(colors).flatMap(([part, color]) =>
      [surface, (nzt[variant] ?? nzt.dark).surface].filter(back => contrastOf(color, back) < 4.5).map(back => `${variant} ${part} ${color} on ${back}`),
    )
    expect(below).toEqual([])
  }
})
