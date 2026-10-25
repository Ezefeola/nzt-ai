import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, UiPressArgument } from 'claude-code'

import type { Action, Found, Mods } from '../types'
import { CATALOG, groupsOf, installCommand, installedFileOf, isInstalled, versionsOf } from './catalog'
import type { Kind } from './catalog'
import { langOf, TEXTS } from './i18n'
import type { Texts } from './i18n'

const PANE = 'nzt-hub'
const DOCK_COLUMNS = 58
const INLINE_ROWS = 24
const DOCK_FLOOR = 110
// A press on Abrir that has not opened its mod by then is waiting for Claude's turn to end.
const WAIT_MS = 400
// Below this many columns for a mod's row, the copy button drops its second word.
const NARROW = 40
// The accent of NZT's mods, the one nzt-state uses: a theme key, so it follows the theme.
const ACCENT = 'claude'
const COPY_BG = '#2e2e2e'
const BANNER = ['█▄ █ ▀▀█ ▀█▀', '█ ▀█ █▄▄  █ ']
// The card's rows besides the list: its border, the banner, the subtitle, the rule and the button.
const CARD_ROWS = 2 + BANNER.length + 1 + 1 + 1

const mods = atom({ plugin: 'nzt-hub', key: 'mods' } as const, { kind: 'loading' } as Mods)
const actions = atom({ plugin: 'nzt-hub', key: 'actions' } as const, {} as Record<string, Action>)

// Module state a reload starts over: whether the pane is showing, the first mod the list
// shows, and how far it can scroll.
let isShowing = false
let listTop = 0
let listLastTop = 0
let t: Texts = TEXTS.es

/** One row of the list: a group's title or a mod. */
type Entry = { kind: 'title'; group: Kind } | { kind: 'mod'; mod: Found }

const reasonOf = (error: unknown) => (error instanceof Error ? error.message : String(error))

/** The rows a mod takes in the list, its blank row after it included. */
const rowsOf = (action: Action | undefined, commandRows: number) =>
  2 + (action?.kind === 'copied' || action?.kind === 'failed' ? 1 : action?.kind === 'copyFailed' ? 1 + commandRows : 0) + 1

// The engine follows $ only into functions declared in this file, so everything that asks
// Claude Code something lives here; what they return is shaped in ./catalog.

async function refresh($: EngineInterface) {
  const commands = await $.command.list().catch(() => [])
  const keys = (await $.config.list().catch(() => [])).map(row => row.key)
  const file = installedFileOf($.plugin.root)
  const text = file === undefined ? undefined : await $.fs.read(file).catch(() => undefined)
  const versions = typeof text === 'string' ? versionsOf(text) : {}
  const found: Found[] = CATALOG.map(mod => {
    const installed = isInstalled(mod.id, commands, keys)
    return installed && versions[mod.id] !== undefined
      ? { id: mod.id, isInstalled: true, version: versions[mod.id] }
      : { id: mod.id, isInstalled: installed }
  })
  await update($, mods, (): Mods => ({ kind: 'ok', mods: found }))
}

async function setAction($: EngineInterface, id: string, action: Action | undefined) {
  await update($, actions, value => {
    const { [id]: _, ...rest } = value
    return action === undefined ? rest : { ...rest, [id]: action }
  })
}

async function closePane($: EngineInterface) {
  isShowing = false
  await $.ui.close({ id: PANE }).catch(() => undefined)
}

/** Runs the mod's command as if typed, and gives it this pane's place once it ran. */
async function openMod($: EngineInterface, id: string) {
  let isDone = false
  const ran = $.command.run({ command: id }).finally(() => {
    isDone = true
  })
  void $.clock
    .sleep(WAIT_MS)
    .then(() => (isDone ? undefined : setAction($, id, { kind: 'waiting' })))
    .catch(() => undefined)
  try {
    await ran
    await setAction($, id, undefined)
    await closePane($)
  } catch (error) {
    await setAction($, id, { kind: 'failed', message: reasonOf(error) })
  }
}

async function copyInstall($: EngineInterface, id: string, surface: UiPressArgument['surface']) {
  const copied = await $.ui.copy({ text: installCommand(id), surface }).catch(() => ({ isCopied: false }))
  await setAction($, id, { kind: copied.isCopied ? 'copied' : 'copyFailed' })
}

export const register: Register = (on, options) => {
  t = TEXTS[langOf(options.language)]

  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'nzt-hub', description: t.commandDescription })

    return next(e)
  })

  on('command.run', { command: 'nzt-hub' }, async ($, e) => {
    if (isShowing) {
      await closePane($)
      return { text: t.paneClosed }
    }
    // A reopened pane starts clean: what a press left last time is over.
    await update($, actions, () => ({}))
    listTop = 0
    const opened = await $.ui.open({
      id: PANE,
      title: t.title,
      focus: true,
      closeOnEscape: true,
      rows: INLINE_ROWS,
      columns: DOCK_COLUMNS,
    })
    isShowing = true
    await refresh($)

    if (!opened.isPlaced) return { text: t.paneWaiting(opened.reason) }
    // The app seats the pane at its side: what follows speaks of a terminal, which it has not.
    if ((await $.session.surfaces().catch(() => [])).some(surface => surface !== 'terminal')) return {}
    // Claude Code docks a pane beside the transcript only in fullscreen and from 110 columns.
    const { isFullscreen, columns } = e.presentation
    if (!isFullscreen) return { text: t.paneInlineNoFullscreen }
    if (columns < DOCK_FLOOR) return { text: t.paneInlineNarrow(columns, DOCK_FLOOR) }
    return { text: t.paneOpened }
  })

  // On the terminal the card is as tall as the body and the wheel moves the list; in the app
  // the pane is drawn whole and taller than the body: there the app scrolls it.
  on('ui.scroll', { requestId: PANE }, async ($, e, next) => {
    if (e.contentRows > e.bodyRows) return next(e)
    listTop = Math.max(0, Math.min(listTop + Math.sign(e.by), listLastTop))
    await update($, actions, value => ({ ...value }))
    return {}
  })

  on('ui.close', async ($, e, next) => {
    if (e.id === PANE) isShowing = false
    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    isShowing = true
    const { Box, Text, Button } = $.ui.resolve(e)
    const known = await read($, mods)
    const pending = await read($, actions)
    // Inside the card's border and padding.
    const width = Math.max(30, e.props.bodyColumns - 4)
    // One row less than the body: the blank row above the card keeps it off the pane's tabs.
    const height = e.props.scroll.bodyRows - 1
    const listRows = Math.max(3, height - CARD_ROWS)
    // A mod's row: its bar, one space, and the rest.
    const rowWidth = width - 2
    const command = (id: string) => installCommand(id)
    const commandRows = (id: string) => Math.max(1, Math.ceil(command(id).length / rowWidth))

    const count = known.kind === 'ok' ? known.mods.filter(mod => mod.isInstalled).length : 0

    if (e.surface !== 'terminal') {
      // The app gives the pane its own tab, title and close, scrolls it, and lays it out in a
      // proportional font: there the pane goes unframed, drawn whole, its Buttons with no hotkey,
      // which the app would draw as a chip on each.
      const top = (
        <Box key="top" flexDirection="column" gap="xs">
          <Box flexDirection="column">
            {BANNER.map(line => (
              <Text key={line} bold color={ACCENT}>
                {line}
              </Text>
            ))}
          </Box>
          <Box flexDirection="row" flexWrap="wrap" justifyContent="space-between" gap="xs">
            <Text dimColor italic wrap="wrap">
              {t.subtitle}
            </Text>
            {known.kind === 'ok' && (
              <Text>
                {CATALOG.map((mod, i) => (
                  <Text key={mod.id} color={i < count ? ACCENT : 'gray'}>
                    {i === 0 ? '●' : ' ●'}
                  </Text>
                ))}
                <Text dimColor>{` ${t.installed(count, CATALOG.length)}`}</Text>
              </Text>
            )}
          </Box>
        </Box>
      )
      if (known.kind === 'loading') {
        void refresh($)
        return (
          <Box flexDirection="column" gap="sm" paddingY="xs">
            {top}
            <Text dimColor>{t.searching}</Text>
          </Box>
        )
      }
      const groups = groupsOf(known.mods).map(group => (
        <Box key={`group:${group.kind}`} flexDirection="column" gap="sm">
          <Text dimColor bold wrap="wrap">
            {t.groups[group.kind]}
          </Text>
          {group.mods.map(mod => {
            const spec = CATALOG.find(one => one.id === mod.id)!
            const words = t.mods[spec.id]
            const action = pending[mod.id]
            // The app does not color text inside a Button: the mod's color is in its bar and its icon.
            const right = !mod.isInstalled ? (
              <Button key={`copy:${mod.id}`} label={`⧉ ${t.copy}`} variant="secondary" onPress={press => copyInstall($, mod.id, press.surface)} />
            ) : action?.kind === 'waiting' ? (
              <Text color="yellow" wrap="wrap">
                {t.waiting}
              </Text>
            ) : (
              <Button key={`open:${mod.id}`} label={t.open} variant="secondary" onPress={() => openMod($, mod.id)} />
            )
            return (
              <Box key={mod.id} flexDirection="row" gap="sm">
                {/* The bar: a strip of the mod's color as tall as the mod, whatever its text wraps to. */}
                <Box key="bar" width={1} flexShrink={0} backgroundColor={mod.isInstalled ? spec.color : 'gray'}>
                  <Text> </Text>
                </Box>
                <Box flexDirection="column" flexGrow={1} flexShrink={1} gap="xs">
                  <Box flexDirection="row" justifyContent="space-between" alignItems="center" gap="sm">
                    <Box flexDirection="row" flexShrink={1} overflow="hidden">
                      <Text bold color={mod.isInstalled ? spec.color : undefined} dimColor={!mod.isInstalled}>
                        {`${spec.icon} `}
                      </Text>
                      <Text bold dimColor={!mod.isInstalled}>
                        {words.title}
                      </Text>
                      <Text dimColor wrap="truncate-end">
                        {` ${mod.isInstalled ? (mod.version === undefined ? '' : `v${mod.version}`) : t.notInstalled}`}
                      </Text>
                    </Box>
                    <Box flexShrink={0}>{right}</Box>
                  </Box>
                  <Text dimColor={!mod.isInstalled} wrap="wrap">
                    {words.desc}
                  </Text>
                  {action?.kind === 'copied' && <Text color="green">{t.copied}</Text>}
                  {action?.kind === 'failed' && (
                    <Text color="red" wrap="wrap">
                      {t.openFailed(action.message)}
                    </Text>
                  )}
                  {action?.kind === 'copyFailed' && (
                    <Box flexDirection="column">
                      <Text color="red" wrap="wrap">
                        {t.copyFailed}
                      </Text>
                      <Text color="cyan" wrap="wrap">
                        {command(mod.id)}
                      </Text>
                    </Box>
                  )}
                </Box>
              </Box>
            )
          })}
        </Box>
      ))
      return (
        <Box flexDirection="column" gap="md" paddingY="xs">
          {top}
          {groups}
        </Box>
      )
    }

    const heading = (
      <Box flexDirection="column">
        {BANNER.map(line => (
          <Text key={line} bold color={ACCENT}>
            {line}
          </Text>
        ))}
        <Box flexDirection="row" justifyContent="space-between">
          <Box flexShrink={1} overflow="hidden">
            <Text dimColor italic wrap="truncate-end">
              {t.subtitle}
            </Text>
          </Box>
          {known.kind === 'ok' && (
            <Text>
              {CATALOG.map((mod, i) => (
                <Text key={mod.id} color={i < count ? ACCENT : 'gray'}>
                  {i === 0 ? '●' : ' ●'}
                </Text>
              ))}
              <Text dimColor>{` ${t.installed(count, CATALOG.length)}`}</Text>
            </Text>
          )}
        </Box>
        <Text dimColor>{'─'.repeat(width)}</Text>
      </Box>
    )
    const buttons = (
      <Box flexDirection="row" gap={2}>
        <Button key="close" label={t.close} hotkey="c" onPress={() => closePane($)} />
      </Box>
    )
    const card = (body: JSX.Element) => (
      <Box flexDirection="column" marginTop={1} height={height} borderStyle="round" borderColor={ACCENT} paddingX={1}>
        {heading}
        <Box flexDirection="column" height={listRows} overflow="hidden">
          {body}
        </Box>
        {buttons}
      </Box>
    )

    if (known.kind === 'loading') {
      void refresh($)
      return card(<Text dimColor>{t.searching}</Text>)
    }

    // The list in order: each group's title, then its mods. A mod's own blank row after it is
    // the blank row above the next group's title.
    const entries: Entry[] = groupsOf(known.mods).flatMap(group => [
      { kind: 'title', group: group.kind } as const,
      ...group.mods.map(mod => ({ kind: 'mod', mod }) as const),
    ])
    // Which entries fit from listTop; when some stay below, the last row says how many mods.
    const sizes = entries.map(entry => (entry.kind === 'title' ? 1 : rowsOf(pending[entry.mod.id], commandRows(entry.mod.id))))
    listLastTop = 0
    for (let used = 0, i = sizes.length - 1; i >= 0; i--) {
      used += sizes[i]!
      if (used > listRows) {
        listLastTop = i + 1
        break
      }
    }
    listTop = Math.min(listTop, listLastTop)
    let used = 0
    let shownTo = listTop
    while (shownTo < sizes.length && used + sizes[shownTo]! - 1 <= listRows - (shownTo < sizes.length - 1 ? 1 : 0)) {
      used += sizes[shownTo]!
      shownTo++
    }
    const below = entries.slice(shownTo).filter(entry => entry.kind === 'mod').length

    const rows = entries.slice(listTop, shownTo).map(entry => {
      if (entry.kind === 'title') {
        return (
          <Text key={`group:${entry.group}`} dimColor bold wrap="truncate-end">
            {t.groups[entry.group]}
          </Text>
        )
      }
      const mod = entry.mod
      const spec = CATALOG.find(one => one.id === mod.id)!
      const words = t.mods[spec.id]
      const action = pending[mod.id]
      const lines = rowsOf(action, commandRows(mod.id)) - 1
      const color = mod.isInstalled ? spec.color : 'gray'

      let right: JSX.Element
      if (!mod.isInstalled) {
        right = (
          <Button key={`copy:${mod.id}`} plain onPress={press => copyInstall($, mod.id, press.surface)}>
            <Text backgroundColor={COPY_BG} bold>{` ⧉ ${rowWidth < NARROW ? t.copyShort : t.copy} `}</Text>
          </Button>
        )
      } else if (action?.kind === 'waiting') {
        right = (
          <Text color="yellow" wrap="truncate-end">
            {rowWidth < NARROW ? t.waitingShort : t.waiting}
          </Text>
        )
      } else {
        right = (
          <Button key={`open:${mod.id}`} plain onPress={() => openMod($, mod.id)}>
            <Text backgroundColor={spec.color} color="inverseText" bold>{` ${t.open} `}</Text>
          </Button>
        )
      }

      let extra: JSX.Element | null = null
      if (action?.kind === 'copied') extra = <Text color="green">{t.copied}</Text>
      else if (action?.kind === 'failed') {
        extra = (
          <Text color="red" wrap="truncate-end">
            {t.openFailed(action.message)}
          </Text>
        )
      } else if (action?.kind === 'copyFailed') {
        extra = (
          <Box flexDirection="column">
            <Text color="red" wrap="truncate-end">
              {t.copyFailed}
            </Text>
            <Text color="cyan" wrap="wrap">
              {command(mod.id)}
            </Text>
          </Box>
        )
      }

      return (
        <Box key={mod.id} flexDirection="row" marginBottom={1}>
          <Text color={color}>{Array.from({ length: lines }, () => '┃').join('\n')}</Text>
          <Box flexDirection="column" marginLeft={1} flexGrow={1} flexShrink={1}>
            <Box flexDirection="row" justifyContent="space-between" gap={1}>
              <Box flexDirection="row" flexShrink={1} overflow="hidden">
                <Text bold color={mod.isInstalled ? spec.color : undefined} dimColor={!mod.isInstalled}>
                  {`${spec.icon} `}
                </Text>
                <Text bold dimColor={!mod.isInstalled}>
                  {words.title}
                </Text>
                <Box flexShrink={1} overflow="hidden">
                  <Text dimColor wrap="truncate-end">
                    {` ${mod.isInstalled ? (mod.version === undefined ? '' : `v${mod.version}`) : t.notInstalled}`}
                  </Text>
                </Box>
              </Box>
              <Box flexShrink={action?.kind === 'waiting' ? 1 : 0} overflow="hidden">
                {right}
              </Box>
            </Box>
            <Text dimColor={!mod.isInstalled} wrap="truncate-end">
              {words.desc}
            </Text>
            {extra}
          </Box>
        </Box>
      )
    })

    return card(
      <Box flexDirection="column">
        {rows}
        {below > 0 && <Text dimColor>{t.below(below)}</Text>}
      </Box>,
    )
  })
}
