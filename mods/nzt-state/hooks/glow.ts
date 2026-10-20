/**
 * The soft glow of what the pane wants seen: a tone that rises from dim to full and falls
 * back, one step per frame, instead of jumping between two.
 */

/** Steps in one rise and fall. */
export const GLOW_STEPS = 10

// The gray each color is dimmed toward: halfway between a dark and a light terminal, so the
// dim end still reads on either.
const GRAY = 0x80

/** How lit a step is, from 0 (dimmest) to 1 (full), along a smooth wave. */
export const levelOf = (step: number) => {
  const n = ((step % GLOW_STEPS) + GLOW_STEPS) % GLOW_STEPS
  return (1 - Math.cos((2 * Math.PI * n) / GLOW_STEPS)) / 2
}

/**
 * `#rrggbb` at a step of the glow: full at the wave's top, and at the bottom mixed with
 * gray by `depth` (0 never dims, 1 dims to gray).
 */
export const glowOf = (color: string, step: number, depth: number) => {
  const mix = depth * (1 - levelOf(step))
  const channel = (at: number) => {
    const value = parseInt(color.slice(at, at + 2), 16)
    return Math.round(value + (GRAY - value) * mix)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${channel(1)}${channel(3)}${channel(5)}`
}
