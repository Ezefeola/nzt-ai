import type { ClientModule } from 'claude-code'

/** What a press on a row asks of the hooks: show a question of the list, or pick an option. */
export type RowPress = { press: string }

/**
 * A row of the list, or an option, in the app. A Button only takes the press on its label, and
 * the app paints it in its own color, so the row is a region of its own: a click anywhere along
 * it, or Enter or space once a click gave it the focus, presses it, and its marks keep their colors.
 */
export type RowProps = {
  press: string
  parts: { key: string; text: string; color?: string; isBold?: boolean; isDim?: boolean }[]
  /** An option wraps to show all it says; a row of the list is one line, cut at the width. */
  isWrapped: boolean
}

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
  const { Text } = surface.elements
  return (
    <Text key="row" wrap={props.isWrapped ? 'wrap' : 'truncate-end'}>
      {props.parts.map(part => (
        <Text key={part.key} color={part.color} bold={part.isBold === true} dimColor={part.isDim === true}>
          {part.text}
        </Text>
      ))}
    </Text>
  )
}

export default Row
