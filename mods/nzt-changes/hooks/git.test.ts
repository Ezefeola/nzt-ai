import { describe, expect, test } from 'claude-code/testing'

import { addedDiffOf, diffOf, groupsOf, parseNumstat, parseStatus, relativeTo } from './git'

describe('parseStatus', () => {
  test('marks each kind of change, renames with their old path', async () => {
    const out = [
      ' M README.md',
      'M  Plan/state.json',
      '?? specs/mods/new.md',
      'A  mods/x/a.ts',
      ' D presentation/old.png',
      'R  specs/b.md',
      'specs/a.md',
      'UU src/conflict.ts',
      'AD gone.txt',
      '',
    ].join('\0')
    expect(parseStatus(out).map(f => `${f.mark} ${f.from ? `${f.from} → ` : ''}${f.path}`)).toEqual([
      'M README.md',
      'M Plan/state.json',
      'A specs/mods/new.md',
      'A mods/x/a.ts',
      'D presentation/old.png',
      'R specs/a.md → specs/b.md',
      '! src/conflict.ts',
    ])
    expect(parseStatus(out).find(f => f.path === 'specs/mods/new.md')?.isUntracked).toBe(true)
  })

  test('no changes is an empty list', async () => {
    expect(parseStatus('')).toEqual([])
  })
})

describe('parseNumstat', () => {
  test('counts lines, binaries as bin and renames under their new path', async () => {
    const counts = parseNumstat(
      ['3\t1\tREADME.md', '-\t-\tlogo.png', '0\t18\t', 'specs/a.md', 'specs/b.md', ''].join('\0'),
    )
    expect(counts.get('README.md')).toEqual({ added: 3, removed: 1, isBinary: false })
    expect(counts.get('logo.png')).toEqual({ added: 0, removed: 0, isBinary: true })
    expect(counts.get('specs/b.md')).toEqual({ added: 0, removed: 18, isBinary: false })
  })
})

describe('groupsOf', () => {
  test('groups by folder, the root first, folders and files in alphabetical order', async () => {
    const file = (path: string) => ({
      path,
      mark: 'M' as const,
      added: 1,
      removed: 0,
      isBinary: false,
      isUntracked: false,
    })
    const groups = groupsOf(
      ['specs/z.md', 'README.md', 'Plan/state.json', 'specs/a.md', 'mods/x/hooks/git.ts'].map(file),
    )
    expect(groups.map(g => `${g.folder || '(root)'}: ${g.files.map(f => f.path).join(', ')}`)).toEqual([
      '(root): README.md',
      'mods/x/hooks: mods/x/hooks/git.ts',
      'Plan: Plan/state.json',
      'specs: specs/a.md, specs/z.md',
    ])
  })
})

describe('diffOf', () => {
  const DIFF = [
    'diff --git a/a.md b/a.md',
    'index 1..2 100644',
    '--- a/a.md',
    '+++ b/a.md',
    '@@ -1,2 +1,2 @@',
    ' keep',
    '-old',
    '+new',
    '',
  ].join('\r\n')

  test('keeps the hunks, drops the header and carriage returns', async () => {
    expect(diffOf(DIFF)).toEqual({ kind: 'text', source: '@@ -1,2 +1,2 @@\n keep\n-old\n+new', cutLines: 0 })
  })

  test('a binary file has no text diff', async () => {
    expect(diffOf('diff --git a/x.png b/x.png\nBinary files a/x.png and b/x.png differ\n').kind).toBe('binary')
  })

  test('a rename with the same content only moved', async () => {
    const moved = 'diff --git a/a.md b/b.md\nsimilarity index 100%\nrename from a.md\nrename to b.md\n'
    expect(diffOf(moved).kind).toBe('moved')
  })

  test('a diff over the limit is cut at a line and its last hunk recounted', async () => {
    const big = ['@@ -1,6 +1,6 @@', ' a', '-b', '+c', ' d', '-e', '+f', '@@ -20,2 +20,2 @@', '-x', '+y'].join('\n')
    const cut = diffOf(big, 22)
    expect(cut).toEqual({ kind: 'text', source: '@@ -1,2 +1,1 @@\n a\n-b', cutLines: 7 })
  })

  test('a cut right after a header drops that header', async () => {
    const big = ['@@ -1,1 +1,1 @@', '-a', '+b', '@@ -9,1 +9,1 @@', '-cccccccccc'].join('\n')
    const cut = diffOf(big, 45)
    expect(cut).toEqual({ kind: 'text', source: '@@ -1,1 +1,1 @@\n-a\n+b', cutLines: 2 })
  })
})

describe('addedDiffOf', () => {
  test('a new file is all added lines', async () => {
    expect(addedDiffOf('one\r\ntwo\n')).toEqual({ kind: 'text', source: '@@ -0,0 +1,2 @@\n+one\n+two', cutLines: 0 })
  })

  test('an empty new file has no diff, a binary one none in text', async () => {
    expect(addedDiffOf('').kind).toBe('empty')
    expect(addedDiffOf('PNG\0\0').kind).toBe('binary')
  })
})

describe('relativeTo', () => {
  test('Windows paths compare without case, other roots exactly', async () => {
    expect(relativeTo('C:/Repo', 'c:\\repo\\specs\\a.md')).toBe('specs/a.md')
    expect(relativeTo('/home/me/repo', '/home/me/repo/a.md')).toBe('a.md')
    expect(relativeTo('/home/me/repo', '/home/me/Repo/a.md')).toBe(undefined)
    expect(relativeTo('C:/Repo', 'D:/other/a.md')).toBe(undefined)
  })
})
