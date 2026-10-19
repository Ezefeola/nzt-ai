import type { ClientModule } from 'claude-code'

import { CELLS, drawCells, drawContextText, stillFrame } from './band'
import type { ContextModel, MeterColors, MeterFrame } from './band'
import { levelOf, MARKS } from './kernel'

/** What the hooks hand the animated meter: the figure to reach, its colors, and whether a turn works. */
export type LiveProps = { context: ContextModel & { kind: 'ok' }; colors: MeterColors; isWorking: boolean }

/** One frame of the surface's clock, in milliseconds. */
export const TICK = 50

const MOVE_FRAMES = 8
const BLINK_FRAMES = 18
const BLINK_PHASE = 3
const PULSE_HALF = 15
const SHIMMER = 2

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
  m.props.isWorking ||
  levelOf(m.to) === 'critical'

/** A new figure: the fill moves from where it is drawn now, and a mark crossed upwards blinks. */
const retarget = (m: Motion, percent: number) => {
  const crossed = MARKS.filter(mark => m.to < mark.at && percent >= mark.at).at(-1)
  m.from = shownOf(m)
  m.to = percent
  m.moveStart = m.frame
  if (crossed !== undefined) m.blink = { at: crossed.at, start: m.frame }
}

export const frameOf = (m: Motion): MeterFrame => {
  const percent = shownOf(m)
  const still = stillFrame(percent)
  const filled = (CELLS * percent) / 100
  const lit = Math.round(filled)
  const blinking = m.blink !== null && m.frame - m.blink.start < BLINK_FRAMES ? m.blink : null
  const head = lit > 0 ? (m.frame % (lit + SHIMMER)) - SHIMMER + 1 : 0
  return {
    ...still,
    // The percentage reads the figure reached; only the cells travel.
    percent: m.to,
    level: levelOf(m.to),
    filled,
    bright: m.props.isWorking && lit > 0 ? Array.from({ length: SHIMMER }, (_, i) => head + i).filter(i => i >= 0 && i < lit) : [],
    blinkOff: blinking !== null && Math.floor((m.frame - blinking.start) / BLINK_PHASE) % 2 === 0 ? blinking.at : null,
    pulseOff: levelOf(m.to) === 'critical' && Math.floor(m.frame / PULSE_HALF) % 2 === 1,
  }
}

const Live: ClientModule<LiveProps, { motion: Motion }> = (props, surface) => {
  let motion = surface.state?.motion
  if (motion === undefined) {
    const m: Motion = { props, frame: 0, from: props.context.percent, to: props.context.percent, moveStart: null, blink: null, isSettling: false }
    motion = m
    // The clock runs for the instance's life but redraws only while something moves, plus one
    // frame after, so the meter settles on its still figure.
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
    if (props.context.percent !== motion.to) retarget(motion, props.context.percent)
    motion.props = props
  }
  const frame = frameOf(motion)
  const { Text } = surface.elements
  return (
    <Text>
      {drawCells(surface.elements, frame, props.colors)}
      {drawContextText(surface.elements, props.context, frame, props.colors)}
    </Text>
  )
}

export default Live
