import type { ClientModule } from 'claude-code'

/** What a press on a row of the index asks of the hooks: jump to a step, or open or close a title. */
export type RowPress = { press: string }

/**
 * A row of the index in the app. A Button only takes the press on its label, and the app paints
 * it in its own color, so the row is a region of its own: a click anywhere along it, or Enter
 * or space once a click gave it the focus, presses it, and the marks and counts keep their colors.
 */
export type RowProps = {
  press: string
  /** A title's arrow, open or closed; none on a step. */
  isOpen: boolean | null
  lead: { text: string; color?: string; isDim?: boolean } | null
  name: string
  isBold: boolean
  aside: { key: string; text: string; color?: string; isDim?: boolean }[]
}

// The title's arrow, one shape turned: the same width open and closed, so the name never moves.
const CHEVRON = { closed: 'ᐳ', open: 'ᐯ' }

const Row: ClientModule<RowProps, true> = (props, surface) => {
  if (surface.state === undefined) {
    surface.onPointer(event => {
      // Released over the row: a press that slides off it is no press.
      const isInside = event.x >= 0 && event.y >= 0 && (surface.columns === 0 || (event.x < surface.columns && event.y < surface.rows))
      if (event.type === 'up' && event.button === 'left' && isInside) surface.post({ press: props.press } satisfies RowPress)
    })
    surface.onKey(event => {
      if (event.key === 'return' || event.key === ' ') surface.post({ press: props.press } satisfies RowPress)
    })
    surface.setState(true)
  }
  const { Box, Text } = surface.elements
  return (
    <Box key="row" flexDirection="row" justifyContent="space-between" alignItems="center">
      <Box flexDirection="row" alignItems="center" gap={1} flexShrink={1} overflow="hidden">
        {props.isOpen === null ? null : (
          <Box width={2} flexShrink={0} justifyContent="center">
            <Text dimColor>{props.isOpen ? CHEVRON.open : CHEVRON.closed}</Text>
          </Box>
        )}
        {props.lead === null ? null : (
          <Text color={props.lead.color} dimColor={props.lead.isDim === true}>{props.lead.text}</Text>
        )}
        <Text bold={props.isBold} wrap="truncate-end">{props.name}</Text>
      </Box>
      <Box flexDirection="row" gap={1} flexShrink={0}>
        {props.aside.map(part => (
          <Text key={part.key} color={part.color} dimColor={part.isDim === true}>{part.text}</Text>
        ))}
      </Box>
    </Box>
  )
}

export default Row
