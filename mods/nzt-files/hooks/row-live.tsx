import type { ClientModule } from 'claude-code'

/** What a press on a row asks of the hooks: open or close the folder, or show the file. */
export type RowPress = { press: string; isDir: boolean }

/**
 * A row of the tree in the app. A Button only takes the press on its label, and the app paints
 * it in its own color, so the row is a region of its own: a click anywhere along it, or Enter
 * or space once a click gave it the focus, presses it, and the marks keep their colors.
 */
export type RowProps = {
  path: string
  name: string
  isDir: boolean
  isOpen: boolean
  isDeleted: boolean
  doing: { color: string; isFading: boolean } | null
  aside: { key: string; text: string; color: string }[]
}

// The folder's arrow, one shape turned: the same width open and closed, so the name never moves.
const CHEVRON = { closed: 'ᐳ', open: 'ᐯ' }

const Row: ClientModule<RowProps, true> = (props, surface) => {
  if (surface.state === undefined) {
    surface.onPointer(event => {
      // Released over the row: a press that slides off it is no press.
      const isInside = event.x >= 0 && event.y >= 0 && (surface.columns === 0 || (event.x < surface.columns && event.y < surface.rows))
      if (event.type === 'up' && event.button === 'left' && isInside) surface.post({ press: props.path, isDir: props.isDir } satisfies RowPress)
    })
    surface.onKey(event => {
      if (event.key === 'return' || event.key === ' ') surface.post({ press: props.path, isDir: props.isDir } satisfies RowPress)
    })
    surface.setState(true)
  }
  const { Box, Text } = surface.elements
  return (
    <Box key="row" flexDirection="row" justifyContent="space-between" alignItems="center">
      <Box flexDirection="row" alignItems="center" gap={1} flexShrink={1} overflow="hidden">
        {props.isDir ? (
          <Box width={2} flexShrink={0} justifyContent="center">
            <Text dimColor>{props.isOpen ? CHEVRON.open : CHEVRON.closed}</Text>
          </Box>
        ) : null}
        <Text strikethrough={props.isDeleted} wrap="truncate-end">{props.name}</Text>
        {props.doing === null ? null : (
          <Text color={props.doing.color} dimColor={props.doing.isFading}>●</Text>
        )}
      </Box>
      <Box flexDirection="row" gap={1} flexShrink={0}>
        {props.aside.map(part => (
          <Text key={part.key} color={part.color}>{part.text}</Text>
        ))}
      </Box>
    </Box>
  )
}

export default Row
