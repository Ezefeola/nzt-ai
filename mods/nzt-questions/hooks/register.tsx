import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Answer, Notice, Question, View } from '../types'
import { langOf, TEXTS } from './i18n'
import type { Texts } from './i18n'
import { afterDraft, messageOf } from './message'
import { isAnswered, merge, parse, pendingOf } from './parse'

const PANE = 'nzt-questions'
const DOCK_COLUMNS = 58
const INLINE_ROWS = 24
// The accent of NZT's mods, a theme key, and the color of Preguntas in nzt-hub.
const ACCENT = 'claude'
const COLOR = '#f48fb1'
// From this many columns down, the buttons take their short labels.
const NARROW = 46
// The index rows beside the conversation and above the prompt.
const INDEX_DOCK = 6
const INDEX_INLINE = 3
// The card's rows besides the index and the question: its border, the heading, two rules
// around the index, the navigation, a rule, the close and primary row, and the keys line.
const CARD_ROWS = 2 + 1 + 2 + 1 + 1 + 1 + 1

const questions = atom({ plugin: 'nzt-questions', key: 'questions' } as const, [] as Question[])
const current = atom({ plugin: 'nzt-questions', key: 'current' } as const, null as string | null)
const pending = atom({ plugin: 'nzt-questions', key: 'pending' } as const, 0)
const view = atom({ plugin: 'nzt-questions', key: 'view' } as const, 'question' as View)
const sent = atom({ plugin: 'nzt-questions', key: 'sent' } as const, '')
const notice = atom({ plugin: 'nzt-questions', key: 'notice' } as const, null as Notice | null)

// Module state a reload starts over: whether the pane is showing, and how far the options scroll.
let isShowing = false
let optionTop = 0
let optionLastTop = 0
// The key on show as the last drawing read it, so a press moves from what the person saw.
let currentKey: string | null = null
// Where the focus ring is, as `ui.focus` last said: on the index, or on the answers.
let isFocusInIndex = false
// The element the answers start at, as the last drawing laid them out.
let firstAnswerKey: string | null = null
let t: Texts = TEXTS.es

const reasonOf = (error: unknown) => (error instanceof Error ? error.message : String(error))

/** The questions still to send, in the order they are held. */
const openOf = (list: Question[]) => list.filter(question => question.status !== 'sent')

// The engine follows $ only into functions declared in this file, so everything that asks
// Claude Code something lives here; what the answers say is read in ./parse and ./message.

async function save($: EngineInterface, change: (list: Question[]) => Question[]) {
  let next: Question[] = []
  await update($, questions, list => (next = change(list)))
  await update($, pending, () => pendingOf(next))
  return next
}

/** Answers a question; the one that leaves none pending shows the message, ready to take. */
async function answer($: EngineInterface, key: string, change: (was: Answer) => Answer) {
  const list = await save($, all =>
    all.map(question => {
      if (question.key !== key) return question
      const given = change(question.answer)
      return { ...question, answer: given, status: isAnswered(given) ? 'answered' : 'pending', isChanged: false }
    }),
  )
  const open = openOf(list)
  if (open.some(question => question.status === 'pending') || !open.some(question => question.status === 'answered')) return
  await update($, view, () => 'review')
  await focusOn($, 'take')
}

/** Shows another question: the one after or before the one on show, among those not sent. */
async function move($: EngineInterface, by: 1 | -1) {
  const list = openOf(await read($, questions))
  const at = list.findIndex(question => question.key === currentKey)
  const to = list[Math.max(0, Math.min(list.length - 1, at + by))]
  if (to !== undefined) await show($, to.key)
}

async function show($: EngineInterface, key: string | null) {
  optionTop = 0
  await update($, current, () => key)
  await update($, view, () => 'question')
}

/**
 * Puts the focus on one of the pane's elements and records where it landed: a move the mod
 * makes itself does not come back through its own `ui.focus` hook.
 */
async function focusOn($: EngineInterface, key: string) {
  const moved = await $.ui.focus({ requestId: PANE, key }).catch(() => ({ deny: 'refused' }))
  if ('deny' in moved && moved.deny !== undefined) return
  isFocusInIndex = key.startsWith('go:')
  await update($, view, value => value)
}

/** Shows a question picked in the index and puts the focus on its answers. */
async function pick($: EngineInterface, key: string) {
  await show($, key)
  if (firstAnswerKey !== null) await focusOn($, firstAnswerKey)
}

/** Moves the focus between the index and the answers of the question on show. */
async function swap($: EngineInterface) {
  const to = isFocusInIndex ? firstAnswerKey : currentKey === null ? null : `go:${currentKey}`
  if (to !== null) await focusOn($, to)
}

async function skip($: EngineInterface, key: string) {
  await save($, list => list.map(question => (question.key === key ? { ...question, status: 'skipped' } : question)))
  await move($, 1)
}

async function fill($: EngineInterface, message: string) {
  const draft = await $.prompt.read().catch(() => ({ text: '', cursor: 0 }))
  const filled = await $.prompt
    .fill({ text: afterDraft(message, draft.text), mode: 'append' })
    .catch(() => ({ isFilled: false }))
  if (!filled.isFilled) {
    await update($, notice, (): Notice => ({ kind: 'fillFailed' }))
    return false
  }
  await update($, notice, () => (draft.text === '' ? null : ({ kind: 'appended' } as Notice)))
  return true
}

async function take($: EngineInterface) {
  const message = messageOf(await read($, questions), t.noteWord)
  if (message === '' || !(await fill($, message))) return
  const list = await save($, all =>
    all.map(question => (question.status === 'answered' ? { ...question, status: 'sent' } : question)),
  )
  await update($, sent, () => message)
  await update($, current, () => openOf(list)[0]?.key ?? null)
  await update($, view, () => 'sent')
}

async function takeAgain($: EngineInterface) {
  const message = await read($, sent)
  if (message !== '') await fill($, message)
}

async function closePane($: EngineInterface) {
  isShowing = false
  await $.ui.close({ id: PANE }).catch(() => undefined)
}

/** Folds an answer's questions into the pane's, and opens it when a new one came. */
async function arrive($: EngineInterface, text: string) {
  let found: ReturnType<typeof parse>
  try {
    found = parse(text)
  } catch (error) {
    await update($, notice, (): Notice => ({ kind: 'readFailed', message: reasonOf(error) }))
    return
  }
  if (found.length === 0) return

  let added: string[] = []
  const list = await save($, held => {
    const merged = merge(held, found)
    added = merged.added
    return merged.questions
  })
  await update($, notice, value => (value?.kind === 'readFailed' ? null : value))
  const shown = await read($, current)
  const open = openOf(list)
  if (added.length > 0 || !open.some(question => question.key === shown)) {
    await show($, open.find(question => added.includes(question.key))?.key ?? open[0]?.key ?? null)
  }
  if (added.length === 0 || isShowing) return

  const opened = await $.ui
    .open({ id: PANE, title: t.title, closeOnEscape: true, rows: INLINE_ROWS, columns: DOCK_COLUMNS })
    .catch(() => ({ isPlaced: false }))
  if (!opened.isPlaced) $.ui.toast(t.toast(open.length))
}

export const register: Register = (on, options) => {
  t = TEXTS[langOf(options.language)]

  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'nzt-questions', description: t.commandDescription })

    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const ended = await next(e)
    // A subagent's questions are not for the person, and a cut turn did not finish asking.
    if (e.agentId === undefined && !e.isAborted) {
      await arrive($, e.answer).catch(error =>
        update($, notice, (): Notice => ({ kind: 'readFailed', message: reasonOf(error) })).catch(() => undefined),
      )
    }
    return ended
  })

  on('command.run', { command: 'nzt-questions' }, async $ => {
    if (isShowing) {
      await closePane($)
      return { text: t.paneClosed }
    }
    const opened = await $.ui.open({
      id: PANE,
      title: t.title,
      focus: true,
      closeOnEscape: true,
      rows: INLINE_ROWS,
      columns: DOCK_COLUMNS,
    })
    isShowing = true
    return { text: opened.isPlaced ? t.paneOpened : t.paneWaiting(opened.reason) }
  })

  on('ui.scroll', { requestId: PANE }, async ($, e) => {
    optionTop = Math.max(0, Math.min(optionTop + Math.sign(e.by), optionLastTop))
    await update($, view, value => value)
    return {}
  })

  on('ui.focus', { requestId: PANE }, async ($, e, next) => {
    const isInIndex = e.element?.startsWith('go:') === true
    if (isInIndex !== isFocusInIndex) {
      isFocusInIndex = isInIndex
      // Redraws the swap button, whose label says where it goes.
      await update($, view, value => value)
    }
    return next(e)
  })

  on('ui.close', async ($, e, next) => {
    if (e.id === PANE) isShowing = false
    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    isShowing = true
    const elements = $.ui.resolve(e)
    const { Box, Text, Button } = elements
    // The mobile app draws no field yet: there a question is answered by its options alone.
    const Input = 'Input' in elements ? elements.Input : null
    const list = await read($, questions)
    const shownView = await read($, view)
    const said = await read($, notice)
    const open = openOf(list)
    const shownKey = await read($, current)
    const chosen = open.find(question => question.key === shownKey) ?? open[0]
    currentKey = chosen?.key ?? null

    // Inside the card's border and padding.
    const width = Math.max(24, e.props.bodyColumns - 4)
    const isNarrow = width <= NARROW
    // One row less than the body: the blank row above the card keeps it off the pane's tabs.
    const height = e.props.scroll.bodyRows - 1
    const indexRows = Math.min(e.props.placement === 'dock' ? INDEX_DOCK : INDEX_INLINE, Math.max(1, list.length))
    const bodyRows = Math.max(3, height - CARD_ROWS - indexRows)

    const answered = list.filter(question => question.status === 'answered').length
    const sentCount = list.filter(question => question.status === 'sent').length
    const heading = (
      <Box flexDirection="row" justifyContent="space-between">
        <Text>
          <Text backgroundColor={ACCENT} color="inverseText" bold> NZT </Text>{' '}
          <Text bold color={ACCENT}>{t.title}</Text>
        </Text>
        {list.length > 0 && (
          <Text dimColor wrap="truncate-end">
            {shownView === 'sent' ? t.sentCount(sentCount) : t.answeredOf(answered, open.length)}
          </Text>
        )}
      </Box>
    )
    const rule = <Text dimColor>{'─'.repeat(width)}</Text>
    // The tabs, the question or the message, the navigation, and apart from it the close and
    // primary row, with the keys that work under it.
    const card = (index: JSX.Element | null, body: JSX.Element, navigation: JSX.Element | null, bottom: JSX.Element, keys: string) => (
      <Box flexDirection="column" marginTop={1} height={height} borderStyle="round" borderColor={ACCENT} paddingX={1}>
        {heading}
        {rule}
        <Box flexDirection="column" height={indexRows} overflow="hidden">
          {index ?? <Text> </Text>}
        </Box>
        {rule}
        <Box flexDirection="column" height={bodyRows} overflow="hidden">
          {said?.kind === 'readFailed' && (
            <Text color="red" wrap="wrap">
              {t.readFailed(said.message)}
            </Text>
          )}
          {body}
        </Box>
        <Box height={1}>{navigation ?? <Text> </Text>}</Box>
        {rule}
        <Box flexDirection="row" justifyContent="space-between" height={1}>
          {bottom}
        </Box>
        <Text dimColor wrap="truncate-end">
          {keys}
        </Text>
      </Box>
    )
    // Plain with a hotkey, a Button reads `c: Cerrar`, its key in the accent.
    const closeButton = <Button key="close" plain label={t.close} hotkey="c" onPress={() => closePane($)} />

    if (list.length === 0 || (open.length === 0 && shownView === 'question')) {
      return card(
        null,
        <Box flexDirection="column">
          <Text>{t.empty}</Text>
          <Text dimColor wrap="wrap">
            {t.emptyWhere}
          </Text>
        </Box>,
        null,
        closeButton,
        t.keysEmpty,
      )
    }

    // The index lists every question, the sent ones too, and keeps the one on show inside its window.
    const at = Math.max(0, open.findIndex(question => question.key === chosen?.key))
    const listAt = Math.max(0, list.findIndex(question => question.key === chosen?.key))
    const indexTop = Math.max(0, Math.min(listAt - indexRows + 1, list.length - indexRows))
    const below = list.length - indexTop - indexRows
    const mark = (question: Question) =>
      question.status === 'answered' ? '●' : question.status === 'skipped' ? '→' : question.status === 'sent' ? '✓' : '○'
    const markColor = (question: Question) =>
      question.status === 'skipped' ? 'yellow' : question.status === 'sent' ? 'green' : undefined
    const index = (
      <Box flexDirection="column">
        {list.slice(indexTop, indexTop + indexRows - (below > 0 ? 1 : 0)).map(question => {
          const isChosen = question.key === chosen?.key && shownView === 'question'
          return (
            <Button key={`go:${question.key}`} plain onPress={() => pick($, question.key)}>
              <Text wrap="truncate-end" color={isChosen ? COLOR : undefined} bold={isChosen}>
                <Text color={isChosen ? COLOR : markColor(question)}>{mark(question)}</Text>
                {` ${question.id ?? question.number} · ${question.text}`}
              </Text>
            </Button>
          )
        })}
        {below > 0 && <Text dimColor>{t.below(below + 1)}</Text>}
      </Box>
    )

    if (shownView === 'review' || shownView === 'sent') {
      const isSent = shownView === 'sent'
      const message = isSent ? await read($, sent) : messageOf(list, t.noteWord)
      const skippedCount = open.filter(question => question.status === 'skipped').length
      return card(
        index,
        <Box flexDirection="column">
          {isSent ? <Text color="green">{t.taken}</Text> : <Text dimColor>{t.reviewTitle}</Text>}
          {isSent && said?.kind === 'appended' && <Text dimColor>{t.appended}</Text>}
          {said?.kind === 'fillFailed' && <Text color="red">{t.fillFailed}</Text>}
          <Box flexDirection="column" marginTop={1}>
            {message.split('\n').map(line => (
              <Text key={line} wrap="wrap">
                {line}
              </Text>
            ))}
          </Box>
          {skippedCount > 0 && (
            <Box marginTop={1}>
              <Text color="yellow">{t.skipped(skippedCount)}</Text>
            </Box>
          )}
        </Box>,
        <Button key="back" plain label={t.back} hotkey="p" onPress={() => show($, currentKey)} />,
        <>
          {closeButton}
          <Button key={isSent ? 'again' : 'take'} plain onPress={() => (isSent ? takeAgain($) : take($))}>
            <Text backgroundColor={COLOR} color="black" bold>
              {` ${isSent ? t.takeAgain : isNarrow ? t.takeShort : t.take} `}
            </Text>
          </Button>
        </>,
        t.keysReview,
      )
    }

    // The question on show, its options the recommended first.
    const question = chosen!
    const options = [...question.options].sort((a, b) => Number(b.isRecommended) - Number(a.isRecommended))
    const optionRows = options.map(option => {
      const line = `○ ${option.letter ?? ''} · ${option.name}${option.isRecommended ? ` ★ ${t.recommended}` : ''} — ${option.explain}`
      return Math.max(1, Math.ceil(line.length / width))
    })
    const fixedRows = 1 + Math.ceil(question.text.length / width) + (question.isChanged ? 1 : 0) + 2 + (options.length === 0 ? 1 : 0)
    optionLastTop = 0
    for (let used = 0, i = optionRows.length - 1; i >= 0; i--) {
      used += optionRows[i]!
      if (used > bodyRows - fixedRows) {
        optionLastTop = i + 1
        break
      }
    }
    optionTop = Math.min(optionTop, optionLastTop)
    const firstOption = options[optionTop]
    firstAnswerKey =
      firstOption !== undefined ? `option:${firstOption.name}` : Input !== null ? `other:${question.key}` : null

    const body = (
      <Box flexDirection="column">
        <Text dimColor>{`${question.id ?? question.number} · ${t.position(at + 1, open.length)}`}</Text>
        <Text bold wrap="wrap">
          {question.text}
        </Text>
        {question.isChanged && <Text color="yellow">{t.changed}</Text>}
        {options.length === 0 && <Text dimColor>{t.noOptions}</Text>}
        {options.slice(optionTop).map(option => {
          const isPicked = question.answer.option === option.name
          // One running line per option: its name, the mark, and what it says after it, dim.
          return (
            <Button
              key={`option:${option.name}`}
              plain
              onPress={() => answer($, question.key, was => ({ option: option.name, note: was.note }))}
            >
              <Text wrap="wrap">
                <Text color={isPicked ? COLOR : undefined}>{isPicked ? '●' : '○'}</Text>
                <Text bold color={isPicked ? COLOR : undefined}>
                  {` ${option.letter === undefined ? '' : `${option.letter} · `}${option.name}`}
                </Text>
                {option.isRecommended && <Text color={ACCENT}>{` ★ ${t.recommended}`}</Text>}
                {option.explain !== '' && <Text dimColor>{` — ${option.explain}`}</Text>}
              </Text>
            </Button>
          )
        })}
        {Input !== null && (
          <Input
            key={`other:${question.key}`}
            label={t.other}
            placeholder={options.length === 0 ? t.answerPlaceholder : t.otherPlaceholder}
            value={question.answer.option === undefined ? (question.answer.text ?? '') : ''}
            submitLabel={t.save}
            onSubmit={(value: string) => answer($, question.key, was => ({ text: value, note: was.note }))}
          />
        )}
        {Input !== null && (
          <Input
            key={`note:${question.key}`}
            label={t.note}
            placeholder={t.notePlaceholder}
            value={question.answer.note ?? ''}
            submitLabel={t.save}
            onSubmit={(value: string) =>
              save($, all =>
                all.map(one => (one.key === question.key ? { ...one, answer: { ...one.answer, note: value } } : one)),
              )
            }
          />
        )}
      </Box>
    )

    return card(
      index,
      body,
      <Box flexDirection="row" gap={2}>
        <Button key="previous" plain label={isNarrow ? t.previousShort : t.previous} hotkey="p" onPress={() => move($, -1)} />
        <Button key="next" plain label={isNarrow ? t.nextShort : t.next} hotkey="n" onPress={() => move($, 1)} />
        <Button key="skip" plain label={t.skip} hotkey="s" onPress={() => skip($, question.key)} />
        <Button key="swap" plain label={isFocusInIndex ? t.toAnswers : t.toIndex} hotkey="a" onPress={() => swap($)} />
      </Box>,
      <>
        {closeButton}
        {answered > 0 ? (
          <Button key="review" plain onPress={() => update($, view, () => 'review')}>
            <Text backgroundColor={COLOR} color="black" bold>
              {` ${isNarrow ? t.reviewShort : t.review} `}
            </Text>
          </Button>
        ) : (
          <Text dimColor>{` ${isNarrow ? t.reviewShort : t.review} `}</Text>
        )}
      </>,
      t.keysQuestion,
    )
  })
}
