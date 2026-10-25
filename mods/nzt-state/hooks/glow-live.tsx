import type { ClientModule } from 'claude-code'

import { GLOW_STEPS, glowOf } from './glow'

/** What a press folds or unfolds, posted to the hooks. */
export type GlowPress = { press: 'turn' }

/**
 * A text that glows on its own clock, so the pane around it is not drawn again each frame:
 * on the desktop a redraw of the whole pane restarts the hover of every button in it.
 *
 * The desktop draws a Button natively, in its own color, whatever the Text inside it says. So a
 * text that glows and is pressed is no Button: the region itself takes the click, and Enter or
 * space once a click gave it the focus. `press` names what it folds; null, the text is not pressed.
 */
export type GlowProps = {
  text: string
  color: string
  depth: number
  isBold: boolean
  wrap: 'wrap' | 'truncate-end'
  press: GlowPress['press'] | null
}

// The pane's character clock, so both move at the same pace.
const TICK = 220

const Glow: ClientModule<GlowProps, { step: number }> = (props, surface) => {
  const press = props.press
  if (surface.state === undefined) {
    let step = 0
    surface.every(TICK, () => {
      step = (step + 1) % GLOW_STEPS
      surface.setState({ step })
    })
    if (press !== null) {
      const posted: GlowPress = { press }
      surface.onPointer(event => {
        // Released over the text: a press that slides off it is no press.
        const isInside = event.x >= 0 && event.y >= 0 && (surface.columns === 0 || (event.x < surface.columns && event.y < surface.rows))
        if (event.type === 'up' && event.button === 'left' && isInside) surface.post(posted)
      })
      surface.onKey(event => {
        if (event.key === 'return' || event.key === ' ') surface.post(posted)
      })
    }
    // Set at once, so a call before the first tick does not start a second clock.
    surface.setState({ step })
  }
  const { Box, Text } = surface.elements
  const text = (
    <Text
      color={glowOf(props.color, surface.state?.step ?? 0, props.depth)}
      bold={props.isBold}
      wrap={props.wrap}
      hover={press === null ? undefined : { underline: true }}
    >
      {props.text}
    </Text>
  )
  // A hover applies under the nearest keyed Box: the region is that Box.
  return press === null ? text : <Box key="glow">{text}</Box>
}

export default Glow
