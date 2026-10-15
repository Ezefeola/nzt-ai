import type { ClientModule } from 'claude-code'

import type { LiveProps } from '../types'
import { drawBand } from './draw'
import type { Frame } from './draw'
import { filledOf, levelOf, MARKS } from './gauge'

/** One frame of the surface's clock, in milliseconds. */
export const TICK = 50

const MOVE_FRAMES = 8
const BLINK_FRAMES = 18
const BLINK_PHASE = 3
const PULSE_HALF = 15
const SHIMMER = 4

/** What the instance keeps between frames; mutated by its draw and its clock alike. */
type Motion = {
  props: LiveProps
  frame: number
  from: number
  to: number
  moveStart: number | null
  blink: { at: number; start: number } | null
  isSettling: boolean
}

const easeOut = (k: number) => 1 - (1 - k) ** 3

const shownOf = (m: Motion): number => {
  if (m.moveStart === null) return m.to
  const k = (m.frame - m.moveStart) / MOVE_FRAMES
  return k >= 1 ? m.to : m.from + (m.to - m.from) * easeOut(k)
}

const isMoving = (m: Motion) =>
  (m.moveStart !== null && m.frame - m.moveStart < MOVE_FRAMES) ||
  (m.blink !== null && m.frame - m.blink.start < BLINK_FRAMES) ||
  m.props.working ||
  levelOf(m.to) === 'critical'

/** A new figure: the fill moves from where it is drawn now, and a mark crossed upwards blinks. */
const retarget = (m: Motion, percent: number) => {
  const from = shownOf(m)
  const crossed = MARKS.filter(mark => m.to < mark.at && percent >= mark.at).at(-1)
  m.from = from
  m.to = percent
  m.moveStart = m.frame
  if (crossed !== undefined) m.blink = { at: crossed.at, start: m.frame }
}

export const frameOf = (m: Motion): Frame => {
  const percent = shownOf(m)
  const { label, tokens, width, working } = m.props
  const filled = filledOf(percent, width)
  const blinking = m.blink !== null && m.frame - m.blink.start < BLINK_FRAMES ? m.blink : null
  return {
    label,
    tokens,
    width,
    percent,
    shimmerAt: working && filled > 0 ? (m.frame % (filled + SHIMMER)) - SHIMMER + 1 : null,
    blinkOff:
      blinking !== null && Math.floor((m.frame - blinking.start) / BLINK_PHASE) % 2 === 0 ? blinking.at : null,
    pulseOff: levelOf(percent) === 'critical' && Math.floor(m.frame / PULSE_HALF) % 2 === 1,
  }
}

const Live: ClientModule<LiveProps, { motion: Motion }> = (props, surface) => {
  let motion = surface.state?.motion
  if (motion === undefined) {
    const m: Motion = {
      props,
      frame: 0,
      from: props.percent,
      to: props.percent,
      moveStart: null,
      blink: null,
      isSettling: false,
    }
    motion = m
    // The clock runs for the instance's life, but redraws only while something moves, plus
    // one frame after, so the band settles on its still figure.
    surface.every(TICK, () => {
      m.frame += 1
      if (isMoving(m)) {
        m.isSettling = true
        surface.setState({ motion: m })
      } else if (m.isSettling) {
        m.isSettling = false
        surface.setState({ motion: m })
      }
    })
    surface.setState({ motion: m })
  } else {
    if (props.percent !== motion.to) retarget(motion, props.percent)
    motion.props = props
  }
  return drawBand(surface.elements, frameOf(motion))
}

export default Live
