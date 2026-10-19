import type { Palette, Variant } from '../types'
import { TEXT_KEYS } from './palette'

/** The contrast text needs against what it is written on (WCAG 2.x, AA). */
export const MIN_CONTRAST = 4.5

const STEP = 0.02

export const channelsOf = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
]

export const hexOfChannels = (rgb: readonly number[]): string =>
  `#${rgb.map(value => Math.round(Math.max(0, Math.min(255, value))).toString(16).padStart(2, '0')).join('')}`

const linear = (value: number) => {
  const c = value / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

export const luminanceOf = (hex: string): number => {
  const [r, g, b] = channelsOf(hex)
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
}

export const contrastOf = (a: string, b: string): number => {
  const [hi, lo] = [luminanceOf(a), luminanceOf(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

/** `hex` moved `amount` of the way towards `to`, channel by channel. */
export const mix = (hex: string, to: string, amount: number): string => {
  const from = channelsOf(hex)
  const target = channelsOf(to)
  return hexOfChannels(from.map((value, i) => value + (target[i]! - value) * amount))
}

/**
 * `color` as it reads on every one of `backgrounds`: unchanged when it already does, else
 * mixed towards white on a dark variant and towards black on a light one, in small steps,
 * until it does. The hue is kept as long as the steps allow.
 */
export const legible = (color: string, backgrounds: readonly string[], variant: Variant): string => {
  const reads = (candidate: string) => backgrounds.every(back => contrastOf(candidate, back) >= MIN_CONTRAST)
  if (reads(color)) return color
  const toward = variant === 'dark' ? '#ffffff' : '#000000'
  for (let amount = STEP; amount < 1; amount += STEP) {
    const candidate = mix(color, toward, amount)
    if (reads(candidate)) return candidate
  }
  return toward
}

/** A palette whose every text color reads on its surface and its zebra. */
export const legiblePalette = (palette: Palette, variant: Variant): Palette => {
  const backgrounds = [palette.surface, palette.zebra]
  const adjusted = { ...palette }
  for (const key of TEXT_KEYS) adjusted[key] = legible(palette[key], backgrounds, variant)
  return adjusted
}
