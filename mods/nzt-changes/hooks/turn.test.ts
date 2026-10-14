import { describe, expect, test } from 'claude-code/testing'

import {
  diffLines,
  diffWindow,
  fit,
  gitHunks,
  hunksOf,
  hunksWithin,
  indexLinesOf,
  indexRange,
  nearestTop,
  MAX_LCS_LINES,
  rulerOf,
  rulerViewOf,
  printable,
  sourceOfStep,
  startLineOf,
  turnStepOf,
} from './turn'

const show = (lines: { op: string; t: string }[]) => lines.map(line => `${line.op}${line.t}`)

describe('diffLines', () => {
  test('keeps every line, the unchanged ones as context', async () => {
    expect(show(diffLines('a\nb\nc\n', 'a\nB\nc\n'))).toEqual([' a', '-b', '+B', ' c'])
  })

  test('a new file is all added lines', async () => {
    expect(show(diffLines('', 'one\ntwo\n'))).toEqual(['+one', '+two'])
  })

  test('past the size limit it is all removed, then all added', async () => {
    const big = Array.from({ length: MAX_LCS_LINES + 1 }, (_, n) => `l${n}`).join('\n')
    const lines = diffLines(big, 'x')
    expect(lines.filter(line => line.op === '-')).toHaveLength(MAX_LCS_LINES + 1)
    expect(lines[lines.length - 1]).toEqual({ op: '+', t: 'x' })
  })

  test('carriage returns do not count as changes', async () => {
    expect(show(diffLines('a\r\nb\r\n', 'a\nb\n'))).toEqual([' a', ' b'])
  })
})

describe('hunksOf', () => {
  test('one line of context around each change, a hunk per group, numbered from the start', async () => {
    const lines = diffLines('a\nb\nc\nd\ne\nf\ng\n', 'a\nB\nc\nd\ne\nF\ng\n')
    expect(hunksOf(lines, 10, 10)).toBe(
      ['@@ -10,3 +10,3 @@', ' a', '-b', '+B', ' c', '@@ -14,3 +14,3 @@', ' e', '-f', '+F', ' g'].join('\n'),
    )
  })

  test('a new file is one hunk from an empty side', async () => {
    expect(hunksOf(diffLines('', 'x\ny\n'))).toBe('@@ -0,0 +1,2 @@\n+x\n+y')
  })

  test('a diff with no change has no hunk', async () => {
    expect(hunksOf(diffLines('a\n', 'a\n'))).toBe('')
  })

  test('control characters other than tab become ?', async () => {
    expect(hunksOf([{ op: '+', t: 'a\tb\u0007' }])).toBe('@@ -0,0 +1,1 @@\n+a\tb?')
  })
})

describe('gitHunks', () => {
  test('keeps git line numbers and trims its context to one line', async () => {
    const source = ['@@ -1,5 +1,5 @@', ' a', ' b', '-c', '+C', ' d', '@@ -20,2 +20,2 @@', '-x', '+y'].join('\n')
    expect(gitHunks(source)).toBe(
      ['@@ -2,3 +2,3 @@', ' b', '-c', '+C', ' d', '@@ -20,1 +20,1 @@', '-x', '+y'].join('\n'),
    )
  })

  test('a new file keeps its hunk from the empty side', async () => {
    expect(gitHunks('@@ -0,0 +1,2 @@\n+x\n+y')).toBe('@@ -0,0 +1,2 @@\n+x\n+y')
  })
})

describe('hunksWithin', () => {
  test('cuts at the limit, counts what it left out and recounts the last header', async () => {
    const source = ['@@ -1,3 +1,3 @@', ' a', '-b', '+B', ' c', '@@ -9,1 +9,1 @@', '-x', '+y'].join('\n')
    expect(hunksWithin(source, 3)).toEqual({ source: '@@ -1,2 +1,2 @@\n a\n-b\n+B', hidden: 3 })
  })

  test('drops a header left with no line under it', async () => {
    const source = ['@@ -1,1 +1,1 @@', '-a', '+b', '@@ -9,1 +9,1 @@', '-x', '+y'].join('\n')
    expect(hunksWithin(source, 2)).toEqual({ source: '@@ -1,1 +1,1 @@\n-a\n+b', hidden: 2 })
  })

  test('within the limit it is left as it is', async () => {
    expect(hunksWithin('@@ -1,1 +1,1 @@\n-a\n+b', 5)).toEqual({ source: '@@ -1,1 +1,1 @@\n-a\n+b', hidden: 0 })
  })
})

describe('startLineOf', () => {
  test('the line where the edited text starts', async () => {
    expect(startLineOf('one\r\ntwo\r\nthree\r\n', 'three')).toBe(3)
  })

  test('1 when the text is not in the file', async () => {
    expect(startLineOf('one\ntwo\n', 'nine')).toBe(1)
  })

  test('1 when the file could not be read', async () => {
    expect(startLineOf(undefined, 'two')).toBe(1)
  })
})

describe('turnStepOf', () => {
  test('counts every line and keeps only the first ones', async () => {
    const lines = Array.from({ length: 600 }, (_, n) => ({ op: '+' as const, t: `${n}` }))
    const step = turnStepOf('Write', 'a.md', lines, 'newFile')
    expect(step.added).toBe(600)
    expect(step.more).toBe(100)
    expect(step.source.split('\n')[0]).toBe('@@ -0,0 +1,500 @@')
    expect(step.note).toBe('newFile')
  })

  test('numbers the edit where it lands in the file', async () => {
    const step = turnStepOf('Edit', 'a.md', diffLines('old', 'new'), undefined, 42)
    expect(step.source).toBe('@@ -42,1 +42,1 @@\n-old\n+new')
  })
})

test('a step 0.2.0 left in the session, with lines and no hunks, is numbered from 1', async () => {
  const old = { tool: 'Edit', file: 'a.md', lines: [{ op: '-', t: 'a' }, { op: '+', t: 'b' }], more: 0, added: 1, removed: 1 }
  expect(sourceOfStep(old as never)).toBe('@@ -1,1 +1,1 @@\n-a\n+b')
})

const ONE_HUNK = '@@ -1,4 +1,4 @@\n a\n-b\n+B\n c\n d'
const TWO_HUNKS = '@@ -1,1 +1,1 @@\n-a\n+b\n@@ -10,1 +10,1 @@\n-x\n+y'

describe('diffWindow', () => {
  test('a diff that fits is drawn whole', async () => {
    expect(diffWindow(ONE_HUNK, 0, 10, 40)).toEqual({ source: ONE_HUNK, first: 0, count: 5, total: 5, lastTop: 0 })
  })

  test('a window from a line shows only its lines, under a recounted header', async () => {
    expect(diffWindow(ONE_HUNK, 1, 2, 40)).toEqual({
      source: '@@ -2,1 +2,1 @@\n-b\n+B',
      first: 1,
      count: 2,
      total: 5,
      lastTop: 3,
    })
  })

  test('a window past the end stops at the last full window', async () => {
    expect(diffWindow(ONE_HUNK, 99, 2, 40).source).toBe('@@ -3,2 +3,2 @@\n c\n d')
  })

  test('the row between two hunks counts', async () => {
    expect(diffWindow(TWO_HUNKS, 0, 3, 40).count).toBe(2)
    expect(diffWindow(TWO_HUNKS, 0, 10, 40).source).toBe(TWO_HUNKS)
  })

  test('a line wider than the room takes the rows it wraps into', async () => {
    expect(diffWindow(`@@ -1,2 +1,2 @@\n ${'x'.repeat(70)}\n a`, 0, 2, 40).count).toBe(1)
  })
})

describe('rulerOf', () => {
  test('each cell marks what its share of the lines changed', async () => {
    expect(rulerOf(ONE_HUNK, 5)).toEqual(['', 'rm', 'add', '', ''])
  })

  test('a cell over removed and added lines marks both', async () => {
    expect(rulerOf(ONE_HUNK, 1)).toEqual(['both'])
    expect(rulerOf(ONE_HUNK, 2)).toEqual(['rm', 'add'])
  })

  test('the cells of the lines in view', async () => {
    expect(rulerViewOf(40, 10, 0, 8)).toEqual({ from: 0, to: 1 })
    expect(rulerViewOf(40, 10, 32, 8)).toEqual({ from: 8, to: 9 })
  })
})

describe('the index', () => {
  const lines = indexLinesOf(['', 'docs', 'docs', 'src'])

  test('a folder title goes over the first of its steps', async () => {
    expect(lines).toEqual([
      { kind: 'step', step: 0 },
      { kind: 'folder', folder: 'docs' },
      { kind: 'step', step: 1 },
      { kind: 'step', step: 2 },
      { kind: 'folder', folder: 'src' },
      { kind: 'step', step: 3 },
    ])
  })

  test('the current step stays in view with the line above it', async () => {
    expect(indexRange(lines, 3, 4, null)).toMatchObject({ from: 2, to: 6, lastTop: 2, above: 1, below: 0 })
    expect(indexRange(lines, 0, 4, null)).toMatchObject({ from: 0, to: 4, lastTop: 2, above: 0, below: 1 })
  })

  test('once scrolled, it stays where the person left it', async () => {
    expect(indexRange(lines, 0, 4, 1)).toMatchObject({ from: 1, to: 5, lastTop: 2, above: 1, below: 1 })
  })

  test('a window moves only as far as a line needs to show', async () => {
    expect(nearestTop(3, 5, 4)).toBe(3)
    expect(nearestTop(3, 8, 4)).toBe(5)
    expect(nearestTop(3, 1, 4)).toBe(1)
  })

  test('a name that does not fit is cut with an ellipsis', async () => {
    expect(fit('register.tsx', 8)).toBe('registe…')
    expect(fit('a.md', 8)).toBe('a.md')
  })
})

test('printable turns tabs into spaces and other control characters into ?', async () => {
  expect(printable('a\tb\u0007')).toBe('a  b?')
})
