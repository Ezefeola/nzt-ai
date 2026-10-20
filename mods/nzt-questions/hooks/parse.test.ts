import { expect, test } from 'claude-code/testing'

import type { Parsed, Question } from '../types'
import { merge, parse, pendingOf } from './parse'

const NZT_FORM = [
  'Necesito dos decisiones:',
  '',
  '1. **QT-02 · ¿Quién hace el commit?**',
  '   - **A · main, igual que a mano** — el mismo camino de siempre *(recomendada)*',
  '   - **B · Una rama por mod** — más pasos',
  '2. **QT-03 · ¿El instalador activa el flag?**',
  '',
  '   - **A · Lo activa** — escribe la configuración del usuario',
  '   - **B · No la activa** — el README lo explica *(recomendada)*',
].join('\n')

const asked = (parsed: Parsed): Question => ({ ...parsed, number: 1, status: 'pending', isChanged: false, answer: {} })

test('the NZT form gives each question its identifier, its options and the recommended one', async () => {
  const [first, second] = parse(NZT_FORM)
  expect(first).toEqual({
    key: 'QT-02',
    id: 'QT-02',
    text: '¿Quién hace el commit?',
    options: [
      { letter: 'A', name: 'main, igual que a mano', explain: 'el mismo camino de siempre', isRecommended: true },
      { letter: 'B', name: 'Una rama por mod', explain: 'más pasos', isRecommended: false },
    ],
  })
  expect(second!.options.map(option => [option.name, option.isRecommended])).toEqual([
    ['Lo activa', false],
    ['No la activa', true],
  ])
})

test('a numbered line ending in ? with nothing below is a question to answer with text, named by its order', async () => {
  const found = parse('Antes de seguir:\n\n1. ¿Qué nombre lleva el panel?\n2. ¿Va en inglés también?\n\nCon eso arranco.')
  expect(found).toEqual([
    { key: 'qué nombre lleva el panel', text: '¿Qué nombre lleva el panel?', options: [] },
    { key: 'va en inglés también', text: '¿Va en inglés también?', options: [] },
  ])
})

test('a line ending in ? inside a code block, a quote or a table is not a question', async () => {
  const text = ['```ts', 'const isOk = value?', '```', '> ¿Esto lo dijo otro?', '| ¿Columna? |', 'Listo.'].join('\n')
  expect(parse(text)).toEqual([])
})

test('a bullet ending in ? inside the list is an option, and a plain sentence without ? is never a question', async () => {
  const [only] = parse('¿Cómo seguimos?\n- Probamos otra vez?\n- Lo dejamos: no hace falta\nEsto no es una pregunta.')
  expect(only!.options).toEqual([
    { name: 'Probamos otra vez?', explain: '', isRecommended: false },
    { name: 'Lo dejamos', explain: 'no hace falta', isRecommended: false },
  ])
  expect(parse('Esto no termina en signo.')).toEqual([])
})

test('identifiers are read in the shapes agents write, and a heading question counts', async () => {
  expect(parse('### Q-1: ¿Abre solo?').map(question => question.id)).toEqual(['Q-1'])
  expect(parse('#4 ¿Lo borro?').map(question => question.id)).toEqual(['#4'])
  expect(parse('**¿Seguimos?**').map(question => [question.id, question.text])).toEqual([[undefined, '¿Seguimos?']])
})

test('the recommended mark is read in English too, and nothing is recommended when the agent marked nothing', async () => {
  const [english] = parse('Which one?\n- Keep it (Recommended)\n- Drop it')
  expect(english!.options.map(option => [option.name, option.isRecommended])).toEqual([
    ['Keep it', true],
    ['Drop it', false],
  ])
  const [plain] = parse('¿Cuál?\n- Una\n- Otra')
  expect(plain!.options.some(option => option.isRecommended)).toBe(false)
})

test('a question asked twice in one answer is held once, as it was asked last', async () => {
  const found = parse('QT-01 · ¿Sí o no?\n\nMás abajo:\n\nQT-01 · ¿Sí o no, al final?')
  expect(found.map(question => question.text)).toEqual(['¿Sí o no, al final?'])
})

test('a new key comes in pending, and the count of pending ones leaves out the sent', async () => {
  const { questions, added } = merge([], parse(NZT_FORM))
  expect(added).toEqual(['QT-02', 'QT-03'])
  expect(questions.map(question => question.status)).toEqual(['pending', 'pending'])
  expect(pendingOf([{ ...questions[0]!, status: 'sent' }, questions[1]!])).toBe(1)
})

test('a rewritten question keeps its answer while the chosen option is still there by name', async () => {
  const [held] = parse('QT-01 · ¿Cuál?\n- **A · Una** — x\n- **B · Otra** — y')
  const answered: Question = { ...asked(held!), status: 'answered', answer: { option: 'Otra' } }
  const [rewritten] = merge([answered], parse('QT-01 · ¿Cuál de las dos?\n- **A · Una** — x\n- **B · Otra** — z')).questions
  expect(rewritten).toMatchObject({ text: '¿Cuál de las dos?', status: 'answered', isChanged: false, answer: { option: 'Otra' } })
})

test('a rewritten question whose chosen option is gone loses the answer and is pending again, marked as changed', async () => {
  const [held] = parse('QT-01 · ¿Cuál?\n- **A · Una**\n- **B · Otra**')
  const answered: Question = { ...asked(held!), status: 'answered', answer: { option: 'Otra' } }
  const [rewritten] = merge([answered], parse('QT-01 · ¿Cuál?\n- **A · Una**\n- **B · Ninguna**')).questions
  expect(rewritten).toMatchObject({ status: 'pending', isChanged: true, answer: {} })
})

test('a sent question asked again comes back with its answer, ready to send again', async () => {
  const [held] = parse('QT-01 · ¿Cuál?\n- **A · Una**')
  const wasSent: Question = { ...asked(held!), status: 'sent', answer: { option: 'Una' } }
  const { questions, added } = merge([wasSent], parse('QT-01 · ¿Cuál?\n- **A · Una**'))
  expect(added).toEqual([])
  expect(questions[0]).toMatchObject({ status: 'answered', answer: { option: 'Una' } })
})
