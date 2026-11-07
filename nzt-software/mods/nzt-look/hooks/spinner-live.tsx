import type { ClientModule } from 'claude-code'

import type { SpinnerColors } from './spinner'

/** What the hooks hand the animated spinner: the word, what follows it, its colors. */
export type SpinnerProps = { word: string; suffix: string; colors: SpinnerColors }

const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
const TICK = 80
// The band of light is this many letters wide and runs past the word's ends before it returns.
const BAND = 3
const PAUSE = 6

const Spinner: ClientModule<SpinnerProps, { frame: number }> = (props, surface) => {
  if (surface.state === undefined) {
    let frame = 0
    surface.every(TICK, () => {
      frame += 1
      surface.setState({ frame })
    })
    surface.setState({ frame })
  }
  const frame = surface.state?.frame ?? 0
  const { Text } = surface.elements
  const letters = [...props.word]
  const span = letters.length + BAND + PAUSE
  const head = (frame % span) - BAND
  return (
    <Text>
      <Text color={props.colors.accent}>{`${FRAMES[frame % FRAMES.length]} `}</Text>
      {letters.map((letter, i) => {
        const isLit = i >= head && i < head + BAND
        return (
          <Text color={isLit ? props.colors.fg : props.colors.muted} bold={isLit}>
            {letter}
          </Text>
        )
      })}
      <Text color={props.colors.muted}>{props.suffix}</Text>
    </Text>
  )
}

export default Spinner
