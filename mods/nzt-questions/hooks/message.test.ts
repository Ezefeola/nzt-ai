import { expect, test } from 'claude-code/testing'

import type { Question } from '../types'
import { afterDraft, messageOf } from './message'

const question = (fields: Partial<Question>): Question => ({
  key: 'k',
  text: '¿?',
  options: [],
  number: 1,
  status: 'answered',
  isChanged: false,
  answer: {},
  ...fields,
})

test('the message has one line per answered question: identifier, letter and option, and the note', async () => {
  const chose = question({
    key: 'QT-02',
    id: 'QT-02',
    options: [{ letter: 'A', name: 'main, igual que a mano', explain: '', isRecommended: true }],
    answer: { option: 'main, igual que a mano', note: 'sin rama' },
  })
  const wrote = question({ key: 'q', number: 3, answer: { text: ' Que quede en el prompt ' } })
  expect(messageOf([chose, wrote], 'nota')).toBe('QT-02: A — main, igual que a mano · nota: sin rama\n3: Que quede en el prompt')
})

test('an option with no letter goes by its name, and skipped, pending or sent questions stay out', async () => {
  const noLetter = question({ options: [{ name: 'Keep it', explain: '', isRecommended: false }], answer: { option: 'Keep it' } })
  const others = (['skipped', 'pending', 'sent'] as const).map(status => question({ status, answer: { text: 'x' } }))
  expect(messageOf([noLetter, ...others], 'note')).toBe('1: Keep it')
})

test('the message starts on a new line only when the draft does not end in one', async () => {
  expect(afterDraft('QT-01: A — x', '')).toBe('QT-01: A — x')
  expect(afterDraft('QT-01: A — x', 'algo escrito')).toBe('\nQT-01: A — x')
  expect(afterDraft('QT-01: A — x', 'algo escrito\n')).toBe('QT-01: A — x')
})
