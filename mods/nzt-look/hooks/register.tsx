import { atom, memberOf, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type {
  BandPart,
  CustomTheme,
  Level,
  PaletteKey,
  PanelNotice,
  Part,
  Prefs,
  Repaint,
  Running,
  Timing,
  TurnStats,
  Usage,
  Variant,
  VariantPref,
} from '../types'
import { drawGroupRow, drawToolRow } from './rows'
import type { RowState } from './rows'
import { drawCode, drawDiagram, drawMath } from './code'
import { drawFooter, drawPrompt, drawStillSpinner, figuresOf, PHASE_ICONS, pick } from './spinner'
import type { SpinnerProps } from './spinner-live'
import { DESIGN_SPEC, designedOf } from './design'
import { DIAGRAM_HINT, diagramOf } from './mermaid'
import { displayOf, withInlineMath } from './math'
import { segmentsOf } from './markdown'
import { drawBulleted, drawReply } from './reply'
import type { ReplyContext } from './reply'
import { diffLinesOf, drawDiffCard, drawShellCard, shellModelOf } from './shell'
import { diffstatOf, inputTextOf, isCreatedOf, isKept, isQuiet, kindOf, outputTextOf, pathOf, shortPath, targetOf, timeOf } from './tools'
import { bandModelOf, drawCells, drawContextText, drawDesktopBand, drawTerminalBand, meterColorsOf, stillFrame } from './band'
import type { LiveProps } from './band-live'
import { langOf, TEXTS } from './i18n'
import type { Texts } from './i18n'
import { agentLineOf, CONFIRM_MS, crossingLineOf, effortOf, isAbove, isConfirming, levelOf, NO_USAGE, usageOf } from './kernel'
import { colorfgbgLight, gnomeLight, isNztClaudeTheme, macLight, variantNamed, variantOf, windowsLight } from './light'
import { DEFAULT_THEME, hexOf } from './palette'
import { drawPanel } from './panel'
import {
  codeColorsOf,
  DEFAULT_PREFS,
  namesOf,
  ownNameOf,
  paletteOf,
  parseCustom,
  parseFolders,
  parsePrefs,
  rawPaletteOf,
  redraws,
  themeFor,
  withCustom,
  wordsOf,
} from './prefs'

const PANE = 'nzt-look'
const COMMAND = 'nzt-look'
const VERSION = '0.6.0'
// The mod's own files for Claude Code's /theme, copied as they are.
const CLAUDE_THEME_FILES = ['nzt-dark.json', 'nzt-light.json']
const DOCK_COLUMNS = 72
const INLINE_ROWS = 30
// A longer prompt keeps Claude Code's own drawing, which folds a big paste.
const MAX_PROMPT = 4000
// Nothing tells a plugin that the system switched between light and dark, so `auto` asks again.
const APPEARANCE_MS = 5000

const prefsAtom = atom({ plugin: 'nzt-look', key: 'prefs' } as const, DEFAULT_PREFS)
const customAtom = atom({ plugin: 'nzt-look', key: 'custom' } as const, [] as CustomTheme[])
const foldersAtom = atom({ plugin: 'nzt-look', key: 'folders' } as const, {} as Record<string, string>)
const folderAtom = atom({ plugin: 'nzt-look', key: 'folder' } as const, null as string | null)
const themeSettingAtom = atom({ plugin: 'nzt-look', key: 'themeSetting' } as const, null as string | null)
const systemLightAtom = atom({ plugin: 'nzt-look', key: 'systemLight' } as const, null as boolean | null)
const usageAtom = atom({ plugin: 'nzt-look', key: 'usage' } as const, NO_USAGE as Usage)
const runningAtom = atom({ plugin: 'nzt-look', key: 'running' } as const, { model: null, effort: null } as Running)
const toldAtom = atom({ plugin: 'nzt-look', key: 'told' } as const, null as Level | null)
const confirmAtAtom = atom({ plugin: 'nzt-look', key: 'confirmAt' } as const, null as number | null)
const isClearingAtom = atom({ plugin: 'nzt-look', key: 'isClearing' } as const, false)
const liveFailedAtom = atom({ plugin: 'nzt-look', key: 'liveFailed' } as const, false)
const minuteAtom = atom({ plugin: 'nzt-look', key: 'minute' } as const, 0)
const noticeAtom = atom({ plugin: 'nzt-look', key: 'notice' } as const, null as PanelNotice | null)
const repaintAtom = atom({ plugin: 'nzt-look', key: 'repaint' } as const, null as Repaint)
const turnAtom = atom({ plugin: 'nzt-look', key: 'turn' } as const, { tools: 0, added: 0, removed: 0 } as TurnStats)
const turnStartAtom = atom({ plugin: 'nzt-look', key: 'turnStart' } as const, null as number | null)
const turnTokensAtom = atom({ plugin: 'nzt-look', key: 'turnTokens' } as const, 0)
const secondAtom = atom({ plugin: 'nzt-look', key: 'second' } as const, 0)
const isTurningAtom = atom({ plugin: 'nzt-look', key: 'isTurning' } as const, false)
const touchedAtom = atom({ plugin: 'nzt-look', key: 'touched' } as const, {} as Record<string, 'created' | 'edited'>)
const timingFamily = atom({ plugin: 'nzt-look', key: 'timing' } as const, null as Timing | null)
const isOpenFamily = atom({ plugin: 'nzt-look', key: 'isOpen' } as const, null as boolean | null)
const isUnfoldedFamily = atom({ plugin: 'nzt-look', key: 'isUnfolded' } as const, false)
const inputFamily = atom({ plugin: 'nzt-look', key: 'input' } as const, null as unknown)
const MINUTE_MS = 60_000
const SECOND_MS = 1000

// Module state a reload starts over: whether the pane is showing, and the language option.
let isShowing = false
let t: Texts = TEXTS.es
let lang: 'es' | 'en' = 'es'
// The session the store was last read for. /clear, /resume and /branch go on under another id
// with $.state back at its initial values and no session.start, so the look would fall back to
// the defaults while the store still holds the person's choice.
let loadedFor: string | undefined

const reasonOf = (error: unknown) => (error instanceof Error ? error.message : String(error))

// The engine follows $ only into functions declared in this file, so everything that asks
// Claude Code something lives here; the drawing and the colors are worked out in the other files.

function logDebug($: EngineInterface, where: string, error: unknown) {
  $.ui.log(`${where}: ${reasonOf(error)}`, { to: 'debug' })
}

/** Reads what the store keeps; what cannot be read takes its default and the session goes on. */
async function load($: EngineInterface) {
  const custom = parseCustom(await $.store.get('custom').catch(() => undefined))
  const names = namesOf(custom)
  const prefs = parsePrefs(await $.store.get('prefs').catch(() => undefined), names)
  const folders = parseFolders(await $.store.get('folders').catch(() => undefined), names)
  const folder = await $.session.cwd().catch(() => null)
  await update($, customAtom, () => custom)
  await update($, prefsAtom, () => prefs)
  await update($, foldersAtom, () => folders)
  await update($, folderAtom, () => folder)
}

/**
 * Reads the store again when the session's id changed. No await between the check and the mark,
 * so a burst of rows loads once; a failed load lets the next row try again.
 */
async function reloadIfNewSession($: EngineInterface) {
  const id = await $.session.id().catch(() => undefined)
  if (id === undefined || id === loadedFor) return
  loadedFor = id
  try {
    await load($)
    await readThemeSetting($)
    await refreshAppearance($)
    await refreshModel($)
  } catch (error) {
    if (loadedFor === id) loadedFor = undefined
    logDebug($, 'reload', error)
  }
}

async function savePrefs($: EngineInterface, change: (prefs: Prefs) => Prefs) {
  let next = DEFAULT_PREFS
  await update($, prefsAtom, prefs => (next = change(prefs)))
  await $.store.set('prefs', next).catch(error => logDebug($, 'store prefs', error))
  return next
}

async function readThemeSetting($: EngineInterface) {
  const rows = await $.config.list().catch(() => [])
  const value = rows.find(row => row.key === 'theme')?.value
  await update($, themeSettingAtom, () => (typeof value === 'string' ? value : null))
}

/** Whether the terminal or the system draws light, for `auto`; null when nothing says. */
async function probeSystemLight($: EngineInterface): Promise<boolean | null> {
  const fromTerminal = colorfgbgLight(await $.env.get('COLORFGBG').catch(() => undefined))
  if (fromTerminal !== null) return fromTerminal
  const windows = await $.process
    .run(['reg', 'query', 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize', '/v', 'AppsUseLightTheme'], {
      timeoutMs: 2000,
    })
    .then(result => windowsLight(result.stdout))
    .catch(() => null)
  if (windows !== null) return windows
  const mac = await $.process
    .run(['defaults', 'read', '-g', 'AppleInterfaceStyle'], { timeoutMs: 2000 })
    .then(result => macLight(result.stdout, result.exitCode))
    .catch(() => null)
  if (mac !== null) return mac
  return $.process
    .run(['gsettings', 'get', 'org.gnome.desktop.interface', 'color-scheme'], { timeoutMs: 2000 })
    .then(result => gnomeLight(result.stdout))
    .catch(() => null)
}

async function refreshAppearance($: EngineInterface) {
  const prefs = await read($, prefsAtom)
  if (prefs.variant !== 'auto' || variantNamed(await read($, themeSettingAtom)) !== null) return
  const light = await probeSystemLight($)
  if (light !== (await read($, systemLightAtom))) await update($, systemLightAtom, () => light)
}

/** The theme and the variant in force, and the palette they draw with. */
async function look($: EngineInterface) {
  const prefs = await read($, prefsAtom)
  const custom = await read($, customAtom)
  const name = themeFor(prefs, await read($, foldersAtom), await read($, folderAtom))
  const variant: Variant = variantOf(prefs.variant, await read($, themeSettingAtom), await read($, systemLightAtom))
  return { prefs, custom, name, variant, palette: paletteOf(name, custom, variant), code: codeColorsOf(name, custom, variant) }
}

/** A theme chosen: where this folder has one pinned, the pin changes; elsewhere, the usual one. */
async function setTheme($: EngineInterface, name: string) {
  const folder = await read($, folderAtom)
  const folders = await read($, foldersAtom)
  if (folder !== null && folders[folder] !== undefined) {
    await saveFolders($, all => ({ ...all, [folder]: name }))
    await savePrefs($, prefs => ({ ...prefs, isDrawing: true }))
    return
  }
  await savePrefs($, prefs => ({ ...prefs, theme: name, isDrawing: true }))
}

async function saveFolders($: EngineInterface, change: (folders: Record<string, string>) => Record<string, string>) {
  let next: Record<string, string> = {}
  await update($, foldersAtom, folders => (next = change(folders)))
  await $.store.set('folders', next).catch(error => logDebug($, 'store folders', error))
}

async function saveCustom($: EngineInterface, theme: CustomTheme) {
  let next: CustomTheme[] = []
  await update($, customAtom, custom => (next = withCustom(custom, theme)))
  await $.store.set('custom', next).catch(error => logDebug($, 'store custom', error))
}

async function say($: EngineInterface, notice: PanelNotice | null) {
  await update($, noticeAtom, () => notice)
}

/** NZT oscuro or claro picked in /theme brings the mod to `nzt` too, the drawing left on or off as it was. */
async function followClaudeTheme($: EngineInterface, value: unknown) {
  if (!isNztClaudeTheme(value)) return
  const folder = await read($, folderAtom)
  if (folder !== null && (await read($, foldersAtom))[folder] !== undefined) {
    await saveFolders($, all => ({ ...all, [folder]: DEFAULT_THEME }))
    return
  }
  await savePrefs($, prefs => ({ ...prefs, theme: DEFAULT_THEME }))
}

/** Where Claude Code keeps the person's own themes; null when nothing names a home. */
async function claudeThemesFolder($: EngineInterface): Promise<string | null> {
  const joined = (base: string, ...names: string[]) => [base, ...names].join(base.includes('\\') ? '\\' : '/')
  const configured = await $.env.get('CLAUDE_CONFIG_DIR').catch(() => undefined)
  if (configured) return joined(configured, 'themes')
  const home = (await $.env.get('HOME').catch(() => undefined)) || (await $.env.get('USERPROFILE').catch(() => undefined))
  return home ? joined(home, '.claude', 'themes') : null
}

/**
 * Copies NZT oscuro and claro where /theme lists the person's themes. A file there already that
 * differs is left alone: /theme edits that copy in place, and the person's changes win.
 */
async function installThemes($: EngineInterface) {
  const folder = await claudeThemesFolder($)
  if (folder === null) return say($, { kind: 'installFailed', reason: t.noHome })
  try {
    const kept: string[] = []
    for (const file of CLAUDE_THEME_FILES) {
      const text = await $.fs.read(`${$.plugin.root}/themes/${file}`)
      const target = `${folder}${folder.includes('\\') ? '\\' : '/'}${file}`
      const held = await $.fs.read(target).catch(() => null)
      if (held === null) await $.fs.write(target, text as string)
      else if (held !== text) kept.push(file)
    }
    await say($, { kind: 'installed', folder, kept })
  } catch (error) {
    await say($, { kind: 'installFailed', reason: reasonOf(error) })
  }
}

async function pin($: EngineInterface) {
  const folder = await read($, folderAtom)
  if (folder === null) return
  const { name } = await look($)
  await saveFolders($, folders => ({ ...folders, [folder]: name }))
  await say($, { kind: 'pinned' })
}

async function unpin($: EngineInterface) {
  const folder = await read($, folderAtom)
  if (folder === null) return
  await saveFolders($, ({ [folder]: _, ...rest }) => rest)
  await say($, { kind: 'unpinned' })
}

/** The theme pinned here becomes the usual one, and the folder lets go of its pin. */
async function makeDefault($: EngineInterface) {
  const folder = await read($, folderAtom)
  const pinned = folder === null ? undefined : (await read($, foldersAtom))[folder]
  if (folder === null || pinned === undefined) return
  await savePrefs($, prefs => ({ ...prefs, theme: pinned }))
  await saveFolders($, ({ [folder]: _, ...rest }) => rest)
  await say($, null)
}

async function pickColor($: EngineInterface, key: PaletteKey) {
  await update($, repaintAtom, now => (now?.key === key ? null : { key }))
  await say($, null)
}

/** A repaint is kept as the person's own theme, `mi-<tema>`; the theme it came from stays as it was. */
async function paint($: EngineInterface, value: string) {
  const repaint = await read($, repaintAtom)
  if (repaint === null) return
  const color = hexOf(value)
  if (color === null) {
    await say($, { kind: 'invalid', value: value.trim() })
    return
  }
  const { name, custom, variant } = await look($)
  const own = ownNameOf(name)
  const other: Variant = variant === 'dark' ? 'light' : 'dark'
  const theme: CustomTheme = {
    name: own,
    label: own,
    [variant]: { ...rawPaletteOf(name, custom, variant), [repaint.key]: color },
    [other]: rawPaletteOf(name, custom, other),
  } as CustomTheme
  await saveCustom($, theme)
  await setTheme($, own)
  await update($, repaintAtom, () => null)
  await say($, { kind: 'saved', name: own, base: own.slice(3) })
}

async function toggle($: EngineInterface, change: (prefs: Prefs) => Prefs) {
  await savePrefs($, change)
  await say($, null)
}

async function closePane($: EngineInterface) {
  isShowing = false
  await $.ui.close({ id: PANE }).catch(() => undefined)
}

async function openPane($: EngineInterface) {
  const opened = await $.ui.open({
    id: PANE,
    title: t.title,
    focus: true,
    closeOnEscape: true,
    rows: INLINE_ROWS,
    columns: DOCK_COLUMNS,
  })
  isShowing = true
  return opened
}

/** `/nzt-look <args>`: the pane, the drawing on or off, a theme, or a copy. */
async function runCommand($: EngineInterface, args: string): Promise<string> {
  const words = args.trim().split(/\s+/).filter(Boolean)
  const [first, second] = [words[0]?.toLowerCase(), words[1]?.toLowerCase()]
  if (first === undefined) {
    if (isShowing) {
      await closePane($)
      return t.paneClosed
    }
    const opened = await openPane($)
    return opened.isPlaced ? t.paneOpened : t.paneWaiting(opened.reason)
  }
  if (first === 'off') {
    await savePrefs($, prefs => ({ ...prefs, isDrawing: false }))
    return t.drawingOff
  }
  if (first === 'on') {
    await savePrefs($, prefs => ({ ...prefs, isDrawing: true }))
    return t.drawingOn
  }
  if (first === 'copy') return copyLast($, second === 'code')
  const names = namesOf(await read($, customAtom))
  if (!names.includes(first)) return t.unknownTheme(first, names.join(', '))
  await setTheme($, first)
  return t.themeSet(first)
}

/** The agent's last reply, or its last code block, on the clipboard. */
async function copyLast($: EngineInterface, isCode: boolean): Promise<string> {
  const messages = await $.session.messages().catch(() => [])
  const reply = [...messages].reverse().find(message => message.role === 'assistant' && message.text.trim() !== '')
  if (reply === undefined) return t.nothingToCopy
  const text = isCode ? lastCodeOf(reply.text) : reply.text
  if (text === null) return t.nothingToCopy
  const copied = await $.ui.copy({ text }).catch(() => ({ isCopied: false }))
  return copied.isCopied ? (isCode ? t.copiedCode : t.copiedReply) : t.copyFailed
}

/** The session's figures, read again; a failed read leaves the band saying there is no reading. */
/** The main loop's model as `/model` shows it; a failed read leaves the band without that part. */
async function refreshModel($: EngineInterface) {
  const model = await $.session.model().catch(() => null)
  await update($, runningAtom, running => ({ ...running, model }))
}

async function refreshUsage($: EngineInterface): Promise<Usage> {
  const now = await $.session
    .usage()
    .then(usageOf)
    .catch(() => NO_USAGE)
  await update($, usageAtom, () => now)
  return now
}

/** The clear button: the first press asks to confirm, a second one within five seconds clears. */
async function pressClear($: EngineInterface) {
  const now = await $.clock.now()
  if (isConfirming(await read($, confirmAtAtom), now)) {
    await update($, confirmAtAtom, () => null)
    await update($, isClearingAtom, () => true)
    // A command run from inside the hook a press is waiting on is refused, so it starts in a
    // dispatch of its own.
    $.clock.after(1, () => {
      $.command
        .run({ command: 'clear' } as never)
        .catch((error: unknown) => $.ui.toast(t.clearFailed(reasonOf(error))))
        .finally(() => update($, isClearingAtom, () => false))
    })
    return
  }
  await update($, confirmAtAtom, () => now)
  $.clock.after(CONFIRM_MS, () => {
    update($, confirmAtAtom, at => (at === now ? null : at)).catch(() => undefined)
  })
}

/** A call of the main thread ended: its time, the turn's counts, and the file it created or edited. */
async function noteCall($: EngineInterface, tool: string, input: unknown, ran: { deny?: string; result?: unknown; isError?: boolean }) {
  const id = (input as { tool_use_id: string }).tool_use_id
  const end = await $.clock.now()
  await update($, atom({ plugin: 'nzt-look', key: 'timing', id } as const, null as Timing | null), held =>
    held === null ? null : { ...held, end },
  )
  if (ran.deny !== undefined) return
  const diff = ran.isError === true ? null : diffstatOf(tool, input, ran.result)
  await update($, turnAtom, turn => ({
    tools: turn.tools + 1,
    added: turn.added + (diff?.added ?? 0),
    removed: turn.removed + (diff?.removed ?? 0),
  }))
  const path = pathOf(input)
  if (diff !== null && path !== null) {
    const tone = isCreatedOf(tool, ran.result) ? 'created' : 'edited'
    await update($, touchedAtom, touched => ({ ...touched, [path]: touched[path] === 'created' ? 'created' : tone }))
  }
}

/**
 * A reply, or a command's output, with its blocks drawn: the folds the person opened are read
 * for each block, and its copy button puts the block's source on the clipboard.
 */
async function replyTree(
  $: EngineInterface,
  e: { requestId: string; surface: string; viewport?: { columns: number } } & Parameters<EngineInterface['ui']['resolve']>[0],
  segments: ReturnType<typeof segmentsOf>,
  prefs: Prefs,
) {
  const { palette, code } = await look($)
  const unfolded: boolean[] = []
  for (let index = 0; index < segments.length; index++) {
    const id = `${e.requestId}:${index}`
    unfolded.push(segments[index]!.kind === 'prose' ? false : await read($, atom({ plugin: 'nzt-look', key: 'isUnfolded', id } as const, false)))
  }
  const elements = $.ui.resolve(e)
  const { Box, Text, Button, Markdown } = elements
  const ctx: ReplyContext = {
    palette,
    t,
    surface: e.surface === 'desktop' ? 'desktop' : 'terminal',
    columns: Math.max(20, (e.viewport?.columns ?? 100) - 4),
    parts: prefs.parts,
    canFold: prefs.parts.fold && !prefs.calm,
    keyOf: index => `block:${e.requestId}:${index}`,
    isUnfolded: index => unfolded[index] === true,
    onToggle: index => {
      const id = `${e.requestId}:${index}`
      update($, atom({ plugin: 'nzt-look', key: 'isUnfolded', id } as const, false), now => !now).catch(() => undefined)
    },
    onCopy: text => {
      $.ui
        .copy({ text, surface: e.surface as never })
        .then(result => $.ui.toast(result.isCopied ? t.copied : t.copyFailed))
        .catch(() => $.ui.toast(t.copyFailed))
    },
  }
  ctx.drawCode = (segment, index) =>
    drawCode({ Box, Text, Button, Markdown }, segment.code, segment.language, palette, t, {
      surface: ctx.surface,
      isUnfolded: ctx.isUnfolded(index),
      canFold: ctx.canFold,
      canCopy: prefs.parts.copy,
      key: ctx.keyOf(index),
      onToggle: () => ctx.onToggle(index),
      onCopy: () => ctx.onCopy(segment.code),
      code,
    })
  ctx.drawMath = (segment, index) => {
    const block = displayOf(segment.tex)
    if (block === null) return null
    return drawMath({ Box, Text, Button, Markdown }, block, palette, t, {
      surface: ctx.surface,
      canCopy: prefs.parts.copy,
      key: ctx.keyOf(index),
      onCopy: () => ctx.onCopy(segment.tex),
    })
  }
  ctx.drawMermaid = (segment, index) => {
    const diagram = diagramOf(segment.code, ctx.columns - 4)
    if (diagram === null) return null
    return drawDiagram({ Box, Text, Button, Markdown }, diagram, palette, t, {
      surface: ctx.surface,
      canCopy: prefs.parts.copy,
      key: ctx.keyOf(index),
      onCopy: () => ctx.onCopy(segment.code),
    })
  }
  return drawReply({ Box, Text, Button, Markdown }, segments, ctx)
}

/** The preferences the conversation is drawn by: under `default`, the drawing counts as off. */
async function drawingPrefs($: EngineInterface): Promise<Prefs> {
  const prefs = await read($, prefsAtom)
  const name = themeFor(prefs, await read($, foldersAtom), await read($, folderAtom))
  return { ...prefs, isDrawing: redraws(prefs, name) }
}

/** Whether the drawing of a part is on: the drawing at all, and that part. */
async function draws($: EngineInterface, part: Part): Promise<boolean> {
  const prefs = await drawingPrefs($)
  return prefs.isDrawing && prefs.parts[part]
}

async function tickTurn($: EngineInterface) {
  if (await read($, isTurningAtom)) await update($, secondAtom, second => second + 1)
}

async function cancelClear($: EngineInterface) {
  if ((await read($, confirmAtAtom)) !== null) await update($, confirmAtAtom, () => null)
}

const lastCodeOf = (markdown: string): string | null => {
  const blocks = [...markdown.matchAll(/^```[^\n]*\n([\s\S]*?)^```/gm)]
  return blocks.at(-1)?.[1]?.replace(/\n$/, '') ?? null
}

export const register: Register = (on, options) => {
  lang = langOf(options.language)
  t = TEXTS[lang]

  on('session.start', async ($, e, next) => {
    await $.command
      .register({ name: COMMAND, description: t.commandDescription, argumentHint: t.commandHint })
      .catch(error => logDebug($, 'command', error))
    await $.tool.register(DESIGN_SPEC).catch(error => logDebug($, 'design tool', error))
    loadedFor = await $.session.id().catch(() => undefined)
    await load($).catch(error => logDebug($, 'load', error))
    await readThemeSetting($)
    await refreshAppearance($)
    $.clock.every(APPEARANCE_MS, () => {
      refreshAppearance($).catch(error => logDebug($, 'appearance', error))
    })
    // Countdowns read to the minute, so the band is drawn again once a minute.
    $.clock.every(MINUTE_MS, () => {
      update($, minuteAtom, minute => minute + 1).catch(() => undefined)
    })
    // The spinner's time goes on by the second while a turn runs; idle, nothing redraws.
    $.clock.every(SECOND_MS, () => {
      tickTurn($).catch(() => undefined)
    })
    const started = await next(e)
    await refreshUsage($)
    await refreshModel($)
    return started
  })

  // The effort is not readable on its own: it travels on each model request. The spinner's
  // tokens are the turn's responses added up, since Claude Code does not hand its live count on.
  on('turn.step', async function* ($, e, next) {
    const isMain = e.agentId === undefined
    if (isMain) {
      await update($, runningAtom, () => ({ model: e.model, effort: effortOf(e.effort) })).catch(error => logDebug($, 'running', error))
    }
    const stepped = yield* next(e)
    const generated = stepped.usage?.output_tokens ?? 0
    if (isMain && generated > 0) await update($, turnTokensAtom, tokens => tokens + generated).catch(error => logDebug($, 'tokens', error))
    return stepped
  })

  // The new model may take another effort, or none: unknown until its first request.
  on('classic.PostModelSwitch', async ($, e, next) => {
    await update($, runningAtom, () => ({ model: e.to_model, effort: null }))
    return next(e)
  }).catch(($, e, next) => next(e))

  // Pushed by the engine after each main-thread response: the figures change in the same step.
  on('session.measure', async ($, e, next) => {
    await update($, usageAtom, () => usageOf(e))
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const ended = await next(e)
    if (e.agentId === undefined) {
      await update($, isTurningAtom, () => false)
      await refreshUsage($)
    }
    return ended
  })

  on('prompt.submit', async ($, e, next) => {
    await cancelClear($)
    if (e.command === undefined && e.isMeta !== true) {
      await update($, turnAtom, () => ({ tools: 0, added: 0, removed: 0 }))
      await update($, touchedAtom, () => ({}))
      await update($, turnStartAtom, () => null)
      await update($, turnTokensAtom, () => 0)
    }
    const now = (await refreshUsage($)).reading
    if (now.kind === 'ok') await update($, toldAtom, () => levelOf(now.percent))
    if (!(await read($, prefsAtom)).agentLine) return next(e)
    return next({ ...e, context: [...(e.context ?? []), agentLineOf(now)] })
  }).catch(($, e, next) => next(e))

  // A tool call follows a model response, so this is the fill of a step still inside the turn.
  // A batch can run several units in one turn: a mark crossed there reaches the agent with the
  // next tool result, or its end-of-unit report would quote the figure the turn started with.
  on('tool.call', async ($, e, next) => {
    const isMain = e.agentId === undefined
    if (isMain) {
      const start = await $.clock.now()
      const id = e.tool_use_id
      await update($, atom({ plugin: 'nzt-look', key: 'timing', id } as const, null as Timing | null), () => ({ start, end: null })).catch(
        () => undefined,
      )
      // The shell card draws under the call's row and needs its command, which the result lacks.
      if (kindOf(e.tool) === 'run') {
        const { tool: _, tool_use_id: __, ...input } = e as unknown as Record<string, unknown>
        await update($, atom({ plugin: 'nzt-look', key: 'input', id } as const, null as unknown), () => input).catch(() => undefined)
      }
    }
    const ran = await next(e)
    if (isMain) await noteCall($, e.tool, e, ran).catch(error => logDebug($, 'turn stats', error))
    if (!isMain || ran.deny !== undefined || !(await read($, prefsAtom)).agentLine) return ran
    const now = (await refreshUsage($)).reading
    if (now.kind !== 'ok') return ran
    const level = levelOf(now.percent)
    if (level === 'low' || !isAbove(level, await read($, toldAtom))) return ran
    await update($, toldAtom, () => level)
    return { ...ran, context: [...(ran.context ?? []), crossingLineOf(now)] }
  }).catch(($, e, next) => next(e))

  on('session.compact', async ($, e, next) => {
    const compacted = await next(e)
    // The fill drops, so a mark crossed before compacting can warn again.
    const now = (await refreshUsage($)).reading
    await update($, toldAtom, () => (now.kind === 'ok' ? levelOf(now.percent) : null))
    return compacted
  })

  // After a /clear the process goes on with an empty conversation and no session.start.
  on('session.end', async ($, e, next) => {
    if (e.reason === 'clear') {
      await update($, usageAtom, () => NO_USAGE)
      await update($, toldAtom, () => null)
      await update($, confirmAtAtom, () => null)
    }
    return next(e)
  })

  on('classic.SessionStart', { source: ['clear', 'resume', 'fork'] }, async ($, e, next) => {
    await reloadIfNewSession($)
    return next(e)
  }).catch(($, e, next) => next(e))

  // On a Team or Enterprise plan the built-in guard can hold classic.SessionStart back from a
  // user's mod: the new session's first row catches the change instead.
  on('session.append', async ($, e, next) => {
    await reloadIfNewSession($)
    return next(e)
  }).catch(($, e, next) => next(e))

  // Typing cancels a clear waiting for its second press.
  on('prompt.change', async ($, e, next) => {
    if (e.text !== '') await cancelClear($)
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)
    const { prefs, palette } = await look($)
    await read($, minuteAtom)
    const now = await $.clock.now()
    const isClearing = await read($, isClearingAtom)
    const model = bandModelOf({
      usage: await read($, usageAtom),
      running: await read($, runningAtom),
      now,
      parts: prefs.band,
      columns: e.props.bodyColumns,
      isWorking: e.props.isWorking || isClearing,
      isConfirming: isConfirming(await read($, confirmAtAtom), now),
      t,
    })
    if (model === null) return next(e)
    const handlers = { onClear: () => pressClear($), onCancel: () => cancelClear($) }
    const elements = $.ui.resolve(e)
    if (e.surface === 'desktop' && 'Svg' in elements) {
      const { Box, Text, Button, Svg } = elements
      return drawDesktopBand({ Box, Text, Button, Svg }, model, palette, t, handlers)
    }
    const { Box, Text, Button } = elements
    const colors = meterColorsOf(palette)
    const context = model.context
    let contextNode: unknown = null
    if (context !== null) {
      const frame = stillFrame(context.kind === 'ok' ? context.percent : 0)
      const canMove = context.kind === 'ok' && !prefs.calm && !(await read($, liveFailedAtom)) && 'Client' in elements
      if (canMove && context.kind === 'ok') {
        const { Client } = elements
        const props: LiveProps = { context, colors, isWorking: e.props.isWorking }
        contextNode = <Client key="context" module="./band-live.tsx" props={props} />
      } else {
        contextNode = (
          <Text>
            {drawCells({ Text }, frame, colors, context.kind === 'ok')}
            {drawContextText({ Text }, context, frame, colors)}
          </Text>
        )
      }
    }
    return drawTerminalBand({ Box, Text, Button }, model, palette, t, handlers, contextNode)
  })

  on('ui.render', { component: 'ToolUse' }, async ($, e, next) => {
    const { tool } = e.props
    if (isKept(tool) || !(await draws($, 'tools'))) return next(e)
    const { prefs, palette } = await look($)
    const cwd = await read($, folderAtom)
    const isQuietRead = prefs.quietReads && isQuiet(tool)
    const state: RowState = e.props.isInterrupted ? 'cut' : e.props.isErrored ? 'failed' : e.props.isRunning ? 'running' : 'ok'
    const timing = await read($, memberOf(timingFamily, e))
    const isOpenMember = memberOf(isOpenFamily, e)
    const opened = await read($, isOpenMember)
    const path = pathOf(e.props.input)
    const touched = path === null ? undefined : (await read($, touchedAtom))[path]
    const elements = $.ui.resolve(e)
    const surface = e.surface === 'desktop' ? 'desktop' : 'terminal'
    const { Box, Text, Button } = elements
    return drawToolRow(
      { Box, Text, Button },
      {
        id: e.props.tool_use_id,
        kind: kindOf(tool),
        name: tool,
        target: targetOf(tool, e.props.input, cwd),
        state,
        diff: state === 'ok' ? diffstatOf(tool, e.props.input, e.props.output) : null,
        time: timing?.end != null ? timeOf(timing.end - timing.start) : null,
        tone: touched ?? null,
        // A failure opens by itself; the person's ▸ wins after that.
        isOpen: opened ?? state === 'failed',
        input: isQuietRead ? '' : inputTextOf(e.props.input),
        output: isQuietRead && state !== 'failed' ? '' : outputTextOf(tool, e.props.output),
        isCalm: prefs.calm || isQuietRead,
      },
      palette,
      t,
      surface,
      () => update($, isOpenMember, now => !(now ?? state === 'failed')),
    )
  }).catch(($, e, next) => next(e))

  on('ui.render', { component: 'ToolGroup' }, async ($, e, next) => {
    if (!(await draws($, 'tools'))) return next(e)
    const prefs = await read($, prefsAtom)
    const member = memberOf(isOpenFamily, e)
    if (prefs.expandReads || e.props.isExpanded || (await read($, member)) === true) {
      return next({ ...e, props: { ...e.props, isExpanded: true } })
    }
    const { palette } = await look($)
    const counts: { name: string; count: number; kind: ReturnType<typeof kindOf> }[] = []
    for (const call of e.props.calls) {
      const held = counts.find(count => count.name === call.tool)
      if (held === undefined) counts.push({ name: call.tool, count: 1, kind: kindOf(call.tool) })
      else held.count++
    }
    const { Box, Text, Button } = $.ui.resolve(e)
    return drawGroupRow(
      { Box, Text, Button },
      counts,
      e.props.calls.some(call => call.isErrored),
      palette,
      t,
      e.surface === 'desktop' ? 'desktop' : 'terminal',
      `group:${e.requestId}`,
      () => update($, member, () => true),
    )
  }).catch(($, e, next) => next(e))

  // A row's answer is behind its ▸, so the block Claude Code draws under it is left out; the
  // shell's and the edits' have cards of their own.
  on('ui.render', { component: 'ToolResult' }, async ($, e, next) => {
    const { tool } = e.props
    const prefs = await drawingPrefs($)
    if (isKept(tool) || !prefs.isDrawing) return next(e)
    const kind = kindOf(tool)
    if (kind === 'run') {
      const input = await read($, memberOf(inputFamily, e))
      const model = prefs.parts.shell && input !== null ? shellModelOf(input, e.props.output, e.props.isErrored) : null
      if (model === null) return next(e)
      const { palette } = await look($)
      const unfold = memberOf(isUnfoldedFamily, e)
      const isUnfolded = (await read($, unfold)) === true
      const { Box, Text, Button } = $.ui.resolve(e)
      return drawShellCard({ Box, Text, Button }, model, palette, t, {
        isUnfolded,
        canFold: prefs.parts.fold && !prefs.calm,
        key: `shell:${e.requestId}`,
        onToggle: () => update($, unfold, now => !now),
        surface: e.surface === 'desktop' ? 'desktop' : 'terminal',
      })
    }
    if (kind === 'write') {
      const lines = prefs.parts.diffs && !e.props.isErrored ? diffLinesOf(e.props.output) : null
      if (lines === null) return next(e)
      const { palette, code } = await look($)
      const output = e.props.output as { filePath?: string }
      const { Box, Text } = $.ui.resolve(e)
      return drawDiffCard({ Box, Text }, shortPath(output.filePath ?? '', await read($, folderAtom)), lines, palette, code)
    }
    if (!prefs.parts.tools) return next(e)
    const { Box } = $.ui.resolve(e)
    return <Box />
  }).catch(($, e, next) => next(e))

  on('ui.render', { component: 'AssistantMessage' }, async ($, e, next) => {
    const prefs = await drawingPrefs($)
    if (!prefs.isDrawing || e.props.isSummary === true) return next(e)
    const text = prefs.parts.math ? withInlineMath(e.props.text) : e.props.text
    // Prose alone goes to Claude Code's markdown, with its inline formulas in Unicode.
    const passed = () => (text === e.props.text ? next(e) : next({ ...e, props: { ...e.props, text } }))
    const segments = segmentsOf(text)
    if (!segments.some(segment => segment.kind !== 'prose')) return passed()
    const tree = await replyTree($, e, segments, prefs)
    if (tree === null) return passed()
    // The desktop app frames a reply its own way, with no bullet.
    if (e.surface === 'desktop') return tree
    const { palette } = await look($)
    const { Box, Text } = $.ui.resolve(e)
    return drawBulleted({ Box, Text }, tree, palette)
  }).catch(($, e, next) => next(e))

  on('tool.call', { tool: 'mcp__nzt-look__design' }, async ($, e) => {
    const designed = designedOf(e)
    if ('missing' in designed) {
      return { deny: `The theme was not applied, and the one in use stays: missing or not #rrggbb: ${designed.missing.join(', ')}.` }
    }
    await saveCustom($, designed.theme)
    await setTheme($, designed.theme.name)
    return { result: { applied: designed.theme.name }, text: `Applied the theme ${designed.theme.name}. The person can change any color in /nzt-look.` }
  })

  // While diagrams are drawn, the agent knows which kinds; never in a run with no interface.
  on('prompt.compose', async ($, e, next) => {
    const composed = await next(e)
    const prefs = await drawingPrefs($)
    if (!prefs.isDrawing || !prefs.parts.diagrams || e.surfaces.length === 0) return composed
    return { ...composed, sections: [...composed.sections, { id: 'nzt-look-diagrams', text: DIAGRAM_HINT, scope: 'session' as const }] }
  }).catch(($, e, next) => next(e))

  on('turn.start', async ($, e, next) => {
    const now = await $.clock.now()
    await update($, turnStartAtom, held => held ?? now)
    if (e.agentId === undefined) await update($, isTurningAtom, () => true)
    return next(e)
  })

  on('ui.render', { component: 'Spinner' }, async ($, e, next) => {
    const prefs = await drawingPrefs($)
    if (!prefs.isDrawing || !prefs.parts.spinner || e.props.message !== null) return next(e)
    const { name, palette } = await look($)
    const startedAt = await read($, turnStartAtom)
    const seed = String(startedAt ?? e.requestId)
    const word = prefs.words === 'theme' ? pick(wordsOf(name, lang).spinner, seed) : e.props.word
    const ellipsis = word.endsWith('…') ? '' : e.props.suffix
    const elements = $.ui.resolve(e)
    const { Box, Text } = elements
    if (e.surface === 'desktop') return drawStillSpinner({ Box, Text }, PHASE_ICONS[e.props.mode], word, ellipsis, palette)
    await read($, secondAtom)
    const figures = figuresOf({
      elapsedMs: startedAt === null ? null : (await $.clock.now()) - startedAt,
      tokens: await read($, turnTokensAtom),
      effort: (await read($, runningAtom)).effort,
    })
    const suffix = `${ellipsis}${figures}`
    if (prefs.calm || (await read($, liveFailedAtom)) || !('Client' in elements)) return drawStillSpinner({ Box, Text }, '◇', word, suffix, palette)
    const { Client } = elements
    const props: SpinnerProps = { word, suffix, colors: { fg: palette.fg, muted: palette.muted, accent: palette.user } }
    return <Client key="spinner" module="./spinner-live.tsx" props={props} />
  }).catch(($, e, next) => next(e))

  on('ui.render', { component: 'TurnDuration' }, async ($, e, next) => {
    const prefs = await drawingPrefs($)
    if (!prefs.isDrawing || !prefs.parts.spinner) return next(e)
    const { name, palette } = await look($)
    const turn = await read($, turnAtom)
    const line = prefs.words === 'theme' ? await next({ ...e, props: { ...e.props, word: pick(wordsOf(name, lang).done, String(e.props.durationMs)) } }) : await next(e)
    const extra = t.footerExtra(turn.tools, turn.added, turn.removed)
    if (extra === '') return line
    const { Box, Text } = $.ui.resolve(e)
    return drawFooter({ Box, Text }, line, extra, palette)
  }).catch(($, e, next) => next(e))

  // On the desktop the app's own prompt row stays: it carries copy, rewind and selection.
  on('ui.render', { component: 'UserMessage' }, async ($, e, next) => {
    const prefs = await drawingPrefs($)
    const isOwn = e.props.origin.kind === 'composer'
    if (!prefs.isDrawing || !prefs.parts.prompt || e.surface !== 'terminal' || !isOwn || e.props.text.length > MAX_PROMPT) return next(e)
    const { palette } = await look($)
    const { Box, Text } = $.ui.resolve(e)
    return drawPrompt({ Box, Text }, e.props.text, palette)
  }).catch(($, e, next) => next(e))

  on('ui.render', { component: 'CommandOutput' }, async ($, e, next) => {
    const prefs = await drawingPrefs($)
    if (!prefs.isDrawing || !prefs.parts.commands || e.props.isErrored) return next(e)
    const segments = segmentsOf(e.props.text, { pairs: true })
    if (!segments.some(segment => segment.kind !== 'prose')) return next(e)
    const tree = await replyTree($, e, segments, prefs)
    return tree === null ? next(e) : tree
  }).catch(($, e, next) => next(e))

  on('ui.fault', async ($, e, next) => {
    if (e.module.endsWith('-live.tsx')) await update($, liveFailedAtom, () => true)
    return next(e)
  })

  on('config.set', async ($, e, next) => {
    const set = await next(e)
    if (e.key === 'theme' && set.deny === undefined) {
      await update($, themeSettingAtom, () => (typeof set.value === 'string' ? set.value : null))
      await followClaudeTheme($, set.value)
    }
    return set
  }).catch(($, e, next) => next(e))

  on('command.run', { command: COMMAND }, async ($, e) => ({ text: await runCommand($, e.args) }))

  on('ui.close', async ($, e, next) => {
    if (e.id === PANE) isShowing = false
    return next(e)
  }).catch(($, e, next) => next(e))

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    isShowing = true
    const elements = $.ui.resolve(e)
    if (e.surface === 'mobile' || !('Input' in elements)) return <elements.Text>{t.mobile}</elements.Text>
    const { prefs, custom, name, variant, palette } = await look($)
    const folder = await read($, folderAtom)
    const pinned = folder === null ? null : ((await read($, foldersAtom))[folder] ?? null)
    const { Box, Text, Button, Input } = elements
    return drawPanel(
      { Box, Text, Button, Input },
      {
        t,
        version: VERSION,
        prefs,
        names: namesOf(custom),
        theme: name,
        pinned,
        variant,
        palette,
        notice: await read($, noticeAtom),
        repaint: (await read($, repaintAtom))?.key ?? null,
        done: wordsOf(name, lang).done[0]!,
      },
      {
        theme: name => setTheme($, name).then(() => say($, null)),
        variant: (variant: VariantPref) => toggle($, p => ({ ...p, variant })),
        pin: () => pin($),
        unpin: () => unpin($),
        makeDefault: () => makeDefault($),
        band: (part: BandPart) => toggle($, p => ({ ...p, band: { ...p.band, [part]: !p.band[part] } })),
        agentLine: () => toggle($, p => ({ ...p, agentLine: !p.agentLine })),
        part: (part: Part) => toggle($, p => ({ ...p, parts: { ...p.parts, [part]: !p.parts[part] } })),
        quietReads: () => toggle($, p => ({ ...p, quietReads: !p.quietReads })),
        expandReads: () => toggle($, p => ({ ...p, expandReads: !p.expandReads })),
        calm: () => toggle($, p => ({ ...p, calm: !p.calm })),
        words: words => toggle($, p => ({ ...p, words })),
        pick: (key: PaletteKey) => pickColor($, key),
        paint: (value: string) => paint($, value),
        install: () => installThemes($),
        close: () => closePane($),
      },
    )
  })
}
