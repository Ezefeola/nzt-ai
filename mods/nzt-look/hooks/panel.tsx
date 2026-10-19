import type { Elements } from 'claude-code'

import type { BandPart, Palette, PaletteKey, PanelNotice, Part, Prefs, Variant, VariantPref } from '../types'
import { drawCells, drawContextText, meterColorsOf, stillFrame } from './band'
import type { Texts } from './i18n'
import { BAND_PARTS, PARTS } from './prefs'

/** The colors the panel lets the person repaint, in the order the design shows them. */
export const PAINTABLE = ['user', 'fg', 'muted', 'surface', 'zebra', 'ok', 'err', 'warn', 'read', 'write', 'run'] as const satisfies readonly PaletteKey[]

export type PanelModel = {
  t: Texts
  version: string
  prefs: Prefs
  names: readonly string[]
  /** The theme in force here: the folder's pin or the usual one. */
  theme: string
  /** The theme pinned to this folder, if any. */
  pinned: string | null
  variant: Variant
  palette: Palette
  notice: PanelNotice | null
  repaint: PaletteKey | null
  /** The word the theme ends a turn with, for the preview's footer. */
  done: string
}

export type PanelHandlers = {
  theme: (name: string) => void
  variant: (variant: VariantPref) => void
  pin: () => void
  unpin: () => void
  makeDefault: () => void
  band: (part: BandPart) => void
  agentLine: () => void
  part: (part: Part) => void
  quietReads: () => void
  expandReads: () => void
  calm: () => void
  words: (words: Prefs['words']) => void
  pick: (key: PaletteKey) => void
  paint: (value: string) => void
  close: () => void
}

type PanelElements = Pick<Elements['terminal'], 'Box' | 'Text' | 'Button'> & { Input?: Elements['terminal']['Input'] }

const mark = (isOn: boolean) => (isOn ? ' ●' : ' ○')

/** A turn drawn in the theme being chosen: the prompt, a command, an edit, grouped reads, a table and the band. */
const drawPreview = ({ Box, Text }: Pick<PanelElements, 'Box' | 'Text'>, palette: Palette, t: Texts, done: string) => {
  const colors = meterColorsOf(palette)
  const frame = stillFrame(34)
  const row = (cells: readonly string[], back?: string, color?: string) => (
    <Box flexDirection="row">
      {cells.map((cell, i) => (
        <Box width={i === 0 ? 12 : 10}>
          <Text color={color ?? palette.fg} backgroundColor={back} bold={color !== undefined}>
            {cell.padEnd(i === 0 ? 12 : 10)}
          </Text>
        </Box>
      ))}
    </Box>
  )
  return (
    <Box flexDirection="column" backgroundColor={palette.surface} borderStyle="round" borderColor={palette.muted} paddingX={1}>
      <Text>
        <Text color={palette.user}>› </Text>
        <Text color={palette.fg}>{t.previewPrompt}</Text>
      </Text>
      <Text>
        <Text color={palette.run}>● </Text>
        <Text color={palette.run} bold>Bash</Text>
        <Text color={palette.muted}> pnpm test --filter hub </Text>
        <Text color={palette.ok}>✓</Text>
        <Text color={palette.muted}> 2.1s</Text>
      </Text>
      <Text>
        <Text color={palette.write}>● </Text>
        <Text color={palette.write} bold>Edit</Text>
        <Text color={palette.warn}> apps/hub/src/server.ts </Text>
        <Text color={palette.ok}>+18</Text>
        <Text color={palette.err}> −3</Text>
        <Text color={palette.muted}> 0.4s</Text>
      </Text>
      <Text>
        <Text color={palette.read}>● </Text>
        <Text color={palette.muted}>{`${t.grouped(['Read 2', 'Grep 1'])} ▸`}</Text>
      </Text>
      {row(['/chat', '60', '1 min'], undefined, palette.user)}
      {row(['/upload', '10', '1 min'], palette.zebra)}
      {row(['/search', '120', '1 min'])}
      <Text color={palette.muted}>{`✻ ${done} 41s${t.footerExtra(6, 18, 3)}`}</Text>
      <Text>
        <Text color={palette.muted}>{`${t.context} `}</Text>
        {drawCells({ Text }, frame, colors)}
        {drawContextText({ Text }, { kind: 'ok', percent: 34, level: 'high', tokens: null }, frame, colors)}
      </Text>
    </Box>
  )
}

// A section title: dim, upper case, one row of air above it.
const section = (Text: PanelElements['Text'], title: string, palette: Palette) => (
  <Text color={palette.muted} bold>
    {`\n${title}`}
  </Text>
)

/** The options pane: theme with its preview, the band's parts, the conversation's parts, the colors. */
export const drawPanel = (elements: PanelElements, model: PanelModel, on: PanelHandlers) => {
  const { Box, Text, Button, Input } = elements
  const { t, prefs, palette } = model
  const chips = (items: readonly { key: string; label: string; isOn: boolean; press: () => void; hotkey?: string }[]) => (
    <Box flexDirection="row" flexWrap="wrap" columnGap={2}>
      {items.map(item => (
        <Button key={item.key} plain hotkey={item.hotkey} onPress={item.press}>
          <Text color={item.isOn ? palette.user : undefined} bold={item.isOn}>{`${item.label}${mark(item.isOn)}`}</Text>
        </Button>
      ))}
    </Box>
  )
  const notice = model.notice
  return (
    <Box flexDirection="column" borderStyle="round" borderColor={palette.user} paddingX={1} marginTop={1}>
      <Box flexDirection="row" justifyContent="space-between">
        <Text bold color={palette.user}>{`◐ ${t.title}`}</Text>
        <Text color={palette.muted}>{t.version(model.version)}</Text>
      </Box>
      {!prefs.isDrawing && (
        <Box flexDirection="column">
          <Text color={palette.warn}>{`▲ ${t.offNotice}`}</Text>
          <Text color={palette.muted}>{t.offHint}</Text>
        </Box>
      )}

      {section(Text, t.sectionTheme, palette)}
      {chips(
        model.names.map((name, i) => ({
          key: `theme:${name}`,
          label: name,
          isOn: name === model.theme,
          press: () => on.theme(name),
          hotkey: i < 9 ? String(i + 1) : undefined,
        })),
      )}
      <Box flexDirection="row" flexWrap="wrap" columnGap={2}>
        <Text color={palette.muted}>{t.variant}</Text>
        {(['auto', 'dark', 'light'] as const).map(variant => (
          <Button key={`variant:${variant}`} plain onPress={() => on.variant(variant)}>
            <Text color={prefs.variant === variant ? palette.user : undefined} bold={prefs.variant === variant}>
              {`${t.variants[variant]}${prefs.variant === variant ? ' ●' : ''}`}
            </Text>
          </Button>
        ))}
      </Box>
      <Box flexDirection="row" flexWrap="wrap" columnGap={2}>
        <Text color={palette.muted}>{t.folder}</Text>
        {model.pinned === null ? (
          <>
            <Text color={palette.muted}>{t.folderDefault}</Text>
            <Button key="pin" plain label={t.pin} onPress={on.pin} />
          </>
        ) : (
          <>
            <Text>{t.folderPinned(model.pinned)}</Text>
            <Button key="unpin" plain label={t.unpin} onPress={on.unpin} />
            <Button key="make-default" plain label={t.makeDefault} onPress={on.makeDefault} />
          </>
        )}
      </Box>

      {section(Text, t.sectionPreview, palette)}
      {drawPreview(elements, palette, t, model.done)}

      {section(Text, t.sectionBand, palette)}
      {chips([
        ...BAND_PARTS.map(part => ({ key: `band:${part}`, label: t.bandParts[part], isOn: prefs.band[part], press: () => on.band(part) })),
        { key: 'agent-line', label: t.agentLine, isOn: prefs.agentLine, press: on.agentLine },
      ])}

      {section(Text, t.sectionLook, palette)}
      {chips([
        ...PARTS.map(part => ({ key: `part:${part}`, label: t.parts[part], isOn: prefs.parts[part], press: () => on.part(part) })),
        { key: 'quiet-reads', label: t.quietReads, isOn: prefs.quietReads, press: on.quietReads },
        { key: 'expand-reads', label: t.expandReads, isOn: prefs.expandReads, press: on.expandReads },
        { key: 'calm', label: t.calm, isOn: prefs.calm, press: on.calm },
      ])}
      <Box flexDirection="row" flexWrap="wrap" columnGap={2}>
        <Text color={palette.muted}>{t.words.label}</Text>
        {(['claude', 'theme'] as const).map(words => (
          <Button key={`words:${words}`} plain onPress={() => on.words(words)}>
            <Text color={prefs.words === words ? palette.user : undefined} bold={prefs.words === words}>
              {`${t.words[words]}${prefs.words === words ? ' ●' : ''}`}
            </Text>
          </Button>
        ))}
      </Box>

      {section(Text, t.sectionColors, palette)}
      <Box flexDirection="row" flexWrap="wrap" columnGap={2}>
        {PAINTABLE.map(key => (
          <Button key={`color:${key}`} plain onPress={() => on.pick(key)}>
            <Text>
              <Text color={palette[key]} backgroundColor={key === 'surface' || key === 'zebra' ? palette[key] : undefined}>
                ■
              </Text>
              <Text bold={model.repaint === key} color={model.repaint === key ? palette.user : undefined}>{` ${t.colors[key]}`}</Text>
            </Text>
          </Button>
        ))}
      </Box>
      {model.repaint !== null && Input !== undefined ? (
        <Box flexDirection="row" columnGap={1}>
          <Text color={palette.muted}>{`${t.colors[model.repaint as (typeof PAINTABLE)[number]]} ${palette[model.repaint]} →`}</Text>
          <Input key={`paint:${model.repaint}`} placeholder="#rrggbb" value="" submitLabel={t.paint} onSubmit={(value: string) => on.paint(value)} />
        </Box>
      ) : (
        notice === null && <Text color={palette.muted}>{t.pickColor}</Text>
      )}
      {notice?.kind === 'invalid' && <Text color={palette.err}>{`✗ ${t.invalidColor(notice.value)}`}</Text>}
      {notice?.kind === 'saved' && <Text color={palette.ok}>{`✓ ${t.saved(notice.name, notice.base)}`}</Text>}
      {notice?.kind === 'pinned' && <Text color={palette.ok}>{`✓ ${t.pinnedNotice}`}</Text>}
      {notice?.kind === 'unpinned' && <Text color={palette.ok}>{`✓ ${t.unpinnedNotice}`}</Text>}

      {section(Text, t.sectionClaude, palette)}
      <Text wrap="wrap">{t.claudeTheme}</Text>
      <Text color={palette.muted} wrap="wrap">{`\n${t.designHint}`}</Text>
      <Box marginTop={1}>
        <Button key="close" label={t.close} hotkey="c" onPress={on.close} />
      </Box>
    </Box>
  )
}
