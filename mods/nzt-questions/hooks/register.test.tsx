import { expect, test } from 'claude-code/testing'
import type { TestBody } from 'claude-code/testing'

type Engine = Parameters<TestBody>[0]
type On = Parameters<TestBody>[1]

const ANSWER = [
  'Dos decisiones antes de seguir:',
  '',
  '1. **QT-02 · ¿Quién hace el commit?**',
  '   - **A · main, igual que a mano** — el mismo camino *(recomendada)*',
  '   - **B · Una rama por mod** — más pasos',
  '2. ¿Que quede en el prompt o se manda solo?',
].join('\n')

type Session = { fills: { text: string; mode: string }[]; toasts: string[]; opens: number }

/** A session whose prompt holds `draft`, whose side has room or not, and that takes fills or refuses them. */
const fakeSession = (on: On, opts: { draft?: string; isPlaced?: boolean; isFilled?: boolean } = {}) => {
  const session: Session = { fills: [], toasts: [], opens: 0 }
  on('ui.open', async () => {
    session.opens++
    return { value: opts.isPlaced === false ? { isPlaced: false, reason: 'narrow' } : { isPlaced: true } } as never
  })
  on('ui.close', async () => ({ value: undefined }) as never)
  on('ui.toast', async (_, e) => {
    session.toasts.push((e as { text: string }).text)
    return { value: undefined } as never
  })
  on('prompt.read', async () => ({ value: { text: opts.draft ?? '', cursor: 0 } }) as never)
  on('prompt.fill', async (_, e) => {
    session.fills.push({ text: e.text, mode: e.mode })
    return { isFilled: opts.isFilled !== false }
  })
  on('turn.complete', async () => ({ text: '' }) as never)
  on('tool.call', async () => ({ result: {} }) as never)
  on('prompt.submit', async (_, e) => ({ text: e.text }) as never)
  return session
}

const turnEnds = ($: Engine, answer: string, extra: { agentId?: string; isAborted?: boolean } = {}) =>
  $.turn.complete({ answer, durationMs: 1, isAborted: false, turnId: 't1', reason: 'answer', ...extra } as never)

const mount = ($: Engine, bodyRows = 40, bodyColumns = 60, surface: 'terminal' | 'desktop' = 'terminal') =>
  $.ui.mount({
    plugin: 'nzt-questions',
    surface,
    component: 'Pane',
    requestId: 'nzt-questions',
    viewport: { columns: bodyColumns + 4, rows: bodyRows + 4 },
    props: {
      title: 'Preguntas',
      isFocused: true,
      bodyColumns,
      placement: 'dock',
      scroll: { offset: 0, bodyRows },
      view: {},
    },
  })


test('an answer with questions opens the pane on the first one, its options the recommended first', async ($, on) => {
  const session = fakeSession(on)
  await turnEnds($, ANSWER)
  expect(session.opens).toBe(1)
  const ui = await mount($)
  expect(await ui.find({ type: 'Text', text: '¿Quién hace el commit?' })).toBeDefined()
  expect(await ui.find({ key: 'option:main, igual que a mano' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /★ recomendada/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /^0 de 2 contestadas$/ })).toBeDefined()
})

test("a subagent's answer and a cut turn bring no questions", async ($, on) => {
  const session = fakeSession(on)
  await turnEnds($, ANSWER, { agentId: 'a1' })
  await turnEnds($, ANSWER, { isAborted: true })
  expect(session.opens).toBe(0)
  const ui = await mount($)
  expect(await ui.find({ type: 'Text', text: 'No hay preguntas pendientes.' })).toBeDefined()
})

test('a message the person sends answers what was asked, and a slash command does not', async ($, on) => {
  fakeSession(on)
  await turnEnds($, ANSWER)
  await $.prompt.submit({ text: '/nzt-questions', command: 'nzt-questions' } as never)
  const ui = await mount($)
  expect(await ui.find({ type: 'Text', text: '¿Quién hace el commit?' })).toBeDefined()
  await $.prompt.submit({ text: 'la primera, dale' } as never)
  expect(await ui.find({ type: 'Text', text: 'No hay preguntas pendientes.' })).toBeDefined()
  // Asked again, they come back.
  await turnEnds($, ANSWER)
  expect(await ui.find({ type: 'Text', text: '¿Quién hace el commit?' })).toBeDefined()
})

test('the questions of a turn that asked through AskUserQuestion are not left waiting', async ($, on) => {
  const session = fakeSession(on)
  await $.tool.call({ tool: 'AskUserQuestion', questions: [] } as never)
  await turnEnds($, ANSWER)
  expect(session.opens).toBe(0)
  // The next turn, with no tool, asks as usual.
  await turnEnds($, ANSWER)
  expect(session.opens).toBe(1)
})

test('with no room beside the conversation, it says once that there are questions to answer', async ($, on) => {
  const session = fakeSession(on, { isPlaced: false })
  await turnEnds($, ANSWER)
  expect(session.toasts).toEqual(['Hay 2 preguntas para contestar: /nzt-questions'])
})

test('each question has its row in the index, and choosing an option stays on the question', async ($, on) => {
  fakeSession(on)
  await turnEnds($, ANSWER)
  const ui = await mount($)
  expect(await ui.find({ key: 'go:QT-02' })).toBeDefined()
  expect(await ui.find({ key: 'go:que quede en el prompt o se manda solo' })).toBeDefined()
  await ui.press({ key: 'option:main, igual que a mano' })
  expect(await ui.find({ type: 'Text', text: '¿Quién hace el commit?' })).toBeDefined()
  expect(await ui.find({ key: 'take' })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: /a lista o respuesta/ })).toBeDefined()
  expect(await ui.find({ key: 'swap' })).toBeDefined()
})

test('a goes to the list and back, each press knowing where the last one left the focus', async ($, on) => {
  fakeSession(on)
  on('ui.focus', async () => ({ value: {} }) as never)
  await turnEnds($, ANSWER)
  const ui = await mount($)
  expect(await ui.find({ key: 'swap', label: 'Ir a la lista' })).toBeDefined()
  await ui.press({ key: 'swap' })
  expect(await ui.find({ key: 'swap', label: 'Ir a la respuesta' })).toBeDefined()
  await ui.press({ key: 'swap' })
  expect(await ui.find({ key: 'swap', label: 'Ir a la lista' })).toBeDefined()
})

test('with many questions the index keeps the one on show and says how many more there are', async ($, on) => {
  fakeSession(on)
  const many = Array.from({ length: 12 }, (_, i) => `QT-${String(i + 10)} · ¿Pregunta número ${i + 1}?`).join('\n\n')
  await turnEnds($, many)
  const ui = await mount($, 40, 30)
  expect(await ui.find({ key: 'go:QT-10' })).toBeDefined()
  expect(await ui.find({ key: 'go:QT-21' })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: /^↓ \d+ más$/ })).toBeDefined()
})

test('the answers go to the prompt as one message after the draft, and the sent ones stop being pending', async ($, on) => {
  const session = fakeSession(on, { draft: 'lo que escribí' })
  await turnEnds($, ANSWER)
  const ui = await mount($)
  await ui.press({ key: 'option:main, igual que a mano' })
  await ui.press({ key: 'next' })
  // Answering the last one pending shows the message on its own, ready to take.
  await ui.input({ key: 'other:que quede en el prompt o se manda solo', text: 'Que quede en el prompt' })
  expect(await ui.find({ type: 'Text', text: 'QT-02: A — main, igual que a mano' })).toBeDefined()
  await ui.press({ key: 'take' })
  expect(session.fills).toEqual([
    { text: '\nQT-02: A — main, igual que a mano\n2: Que quede en el prompt', mode: 'append' },
  ])
  expect(await ui.find({ type: 'Text', text: /^2 enviadas$/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /Está en el prompt/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /Se agregó después/ })).toBeDefined()
})

test('a skipped question stays out of the message and pending', async ($, on) => {
  const session = fakeSession(on)
  await turnEnds($, ANSWER)
  const ui = await mount($)
  await ui.press({ key: 'skip' })
  await ui.input({ key: 'other:que quede en el prompt o se manda solo', text: 'Solo' })
  await ui.press({ key: 'take' })
  expect(session.fills.map(fill => fill.text)).toEqual(['2: Solo'])
  expect(await ui.find({ type: 'Text', text: /1 salteada, sigue pendiente/ })).toBeDefined()
})

test('when the prompt does not take the message, nothing is marked sent and the pane says so', async ($, on) => {
  fakeSession(on, { isFilled: false })
  await turnEnds($, ANSWER)
  const ui = await mount($)
  await ui.press({ key: 'option:main, igual que a mano' })
  await ui.press({ key: 'review' })
  await ui.press({ key: 'take' })
  expect(await ui.find({ type: 'Text', text: /^1 de 2 contestadas$/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /No se pudo escribir en el prompt/ })).toBeDefined()
})

test('with nothing asked, the pane says where its questions come from', async ($, on) => {
  fakeSession(on)
  const ui = await mount($)
  expect(await ui.find({ type: 'Text', text: 'No hay preguntas pendientes.' })).toBeDefined()
})

test('the command opens the pane and, run again, closes it', async ($, on) => {
  fakeSession(on)
  const run = () =>
    $.command.run({ command: 'nzt-questions', args: '', origin: { kind: 'composer' }, presentation: { isFullscreen: true, columns: 160 } })
  expect(await run()).toEqual({ text: 'Panel de preguntas abierto.' })
  expect(await run()).toEqual({ text: 'Panel de preguntas cerrado.' })
})

/** A click along the right end of a row in the app, released on it. */
const clickRow = async (ui: Awaited<ReturnType<typeof mount>>, key: string) => {
  await ui.resize({ columns: 40, rows: 1, in: key })
  await ui.pointer({ type: 'down', x: 38, y: 0, button: 'left', in: key })
  await ui.pointer({ type: 'up', x: 38, y: 0, button: 'left', in: key })
}

test('in the app the pane goes unframed and drawn whole: no title, Close, rules, keys line, list-or-answer or key chips; the terminal keeps them', async ($, on) => {
  fakeSession(on)
  await turnEnds($, ANSWER)

  const desk = await mount($, 40, 60, 'desktop')
  const term = await mount($)

  expect((await desk.findAll({ type: 'Box' })).map(box => box.props.borderStyle).filter(Boolean)).toEqual([])
  expect((await desk.findAll({ type: 'Box' })).map(box => box.props.height).filter(Boolean)).toEqual([])
  expect((await desk.findAll({ type: 'Button' })).map(button => button.props.hotkey).filter(Boolean)).toEqual([])
  expect(await desk.find({ key: 'close' })).toBeUndefined()
  expect(await desk.find({ key: 'swap' })).toBeUndefined()
  expect(await desk.find({ type: 'Text', text: ' NZT ' })).toBeUndefined()
  expect(await desk.find({ type: 'Text', text: /^─+$/ })).toBeUndefined()
  expect(await desk.find({ type: 'Text', text: /Tab recorrer/ })).toBeUndefined()
  expect(await term.find({ key: 'close' })).toBeDefined()
  expect(await term.find({ key: 'swap' })).toBeDefined()
  expect(await term.find({ type: 'Text', text: /Tab recorrer/ })).toBeDefined()
})

test('in the app the list is drawn whole, and a click anywhere along a row shows its question', async ($, on) => {
  fakeSession(on)
  const many = Array.from({ length: 12 }, (_, i) => `QT-${String(i + 10)} · ¿Pregunta número ${i + 1}?`).join('\n\n')
  await turnEnds($, many)
  const ui = await mount($, 40, 30, 'desktop')
  expect(await ui.find({ type: 'Text', text: /^↓ \d+ más$/ })).toBeUndefined()

  await clickRow(ui, 'go:QT-21')

  expect(await ui.find({ type: 'Text', text: '¿Pregunta número 12?' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /^ QT-21 · ¿Pregunta número 12\?$/, in: 'go:QT-21' })).toMatchObject({ props: { bold: true } })
})

test('in the app a click anywhere along an option picks it, and the option keeps its colors', async ($, on) => {
  fakeSession(on)
  await turnEnds($, ANSWER)
  const ui = await mount($, 40, 60, 'desktop')
  expect(await ui.find({ key: 'review' })).toBeUndefined()

  await clickRow(ui, 'option:main, igual que a mano')

  expect(await ui.find({ type: 'Text', text: /^●$/, in: 'option:main, igual que a mano' })).toMatchObject({ props: { color: '#f48fb1' } })
  expect(await ui.find({ type: 'Text', text: /^ ★ recomendada$/, in: 'option:main, igual que a mano' })).toMatchObject({ props: { color: 'claude' } })
  expect(await ui.find({ key: 'review' })).toMatchObject({ props: { variant: 'primary' } })
  expect(await ui.find({ type: 'Text', text: /^1 de 2 contestadas$/ })).toBeDefined()
})

test('in the app the answers go to the prompt with the primary button', async ($, on) => {
  const session = fakeSession(on)
  await turnEnds($, ANSWER)
  const ui = await mount($, 40, 60, 'desktop')
  await clickRow(ui, 'option:main, igual que a mano')
  await ui.press({ key: 'next' })
  await ui.input({ key: 'other:que quede en el prompt o se manda solo', text: 'Que quede en el prompt' })
  expect(await ui.find({ key: 'take' })).toMatchObject({ props: { variant: 'primary' } })

  await ui.press({ key: 'take' })

  expect(session.fills.map(fill => fill.text)).toEqual(['QT-02: A — main, igual que a mano\n2: Que quede en el prompt'])
  expect(await ui.find({ type: 'Text', text: /Está en el prompt/ })).toBeDefined()
  expect(await ui.find({ key: 'again' })).toMatchObject({ props: { variant: 'primary' } })
})

const wheel = (contentRows: number) => ({
  component: 'Pane' as const,
  requestId: 'nzt-questions',
  offset: 1,
  by: 1,
  bodyRows: 10,
  contentRows,
  origin: { kind: 'person' as const },
  pointer: { row: 4, column: 3 },
})

test('a wheel over a pane taller than its body goes on to the app, which scrolls it', async ($, on) => {
  fakeSession(on)
  const reached: number[] = []
  on('ui.scroll', async (_, e) => {
    reached.push(e.offset)
    return {} as never
  })
  await turnEnds($, ANSWER)

  await $.ui.scroll(wheel(40))

  expect(reached).toEqual([1])
})

test('a wheel over a pane as tall as its body moves the options, as on the terminal', async ($, on) => {
  fakeSession(on)
  const reached: number[] = []
  on('ui.scroll', async (_, e) => {
    reached.push(e.offset)
    return {} as never
  })
  await turnEnds($, ANSWER)

  await $.ui.scroll(wheel(10))

  expect(reached).toEqual([])
})
