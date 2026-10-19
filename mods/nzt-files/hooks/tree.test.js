import { describe, expect, test } from 'claude-code/testing';
import { contentOf, dotsOf, marksOf, MAX_LINES, rowsOf, sortedOf, textWindow, treeWindow, withDeleted } from './tree';
const status = (...entries) => [...entries, ''].join('\0');
const file = (name) => ({ name, isDir: false, size: 0, mtimeMs: 0 });
const folder = (name) => ({ name, isDir: true, size: 0, mtimeMs: 0 });
describe('marksOf', () => {
    test('reads each status as the mark VS Code shows', async () => {
        const marks = marksOf(status(' M README.md', '?? notes.md', 'A  src/new.ts', ' D old.png'));
        expect(marks).toEqual({ 'README.md': 'M', 'notes.md': 'U', 'src/new.ts': 'A', 'old.png': 'D' });
    });
    test('a rename marks the new path added and the old one deleted', async () => {
        expect(marksOf(status('R  docs/b.md', 'docs/a.md'))).toEqual({ 'docs/b.md': 'A', 'docs/a.md': 'D' });
    });
    test('paths are taken from the project folder, and files outside it are left out', async () => {
        const marks = marksOf(status(' M app/src/main.ts', ' M other/x.ts'), 'app/');
        expect(marks).toEqual({ 'src/main.ts': 'M' });
    });
});
test('a folder takes the strongest mark it holds at any depth', async () => {
    const dots = dotsOf({ 'a/b/new.md': 'U', 'a/changed.md': 'M', 'c/gone.png': 'D', 'c/d/new.md': 'U' });
    expect(dots).toEqual({ 'a/b': 'U', a: 'M', c: 'D', 'c/d': 'U' });
});
test('the tree hides .git and lists folders first, each group by name without case', async () => {
    const entries = [file('readme.md'), folder('.git'), folder('src'), file('App.ts'), folder('Docs')];
    expect(sortedOf(entries).map(entry => entry.name)).toEqual(['Docs', 'src', 'App.ts', 'readme.md']);
});
test('what was deleted since the last commit is put back where it was', async () => {
    const entries = withDeleted('', [folder('src')], { 'old.png': 'D', 'gone/a.md': 'D', 'src/x.ts': 'D' });
    expect(entries).toEqual([folder('gone'), folder('src'), file('old.png')]);
});
describe('rowsOf', () => {
    const listings = {
        '': { kind: 'ok', entries: [folder('src'), file('README.md')] },
        src: { kind: 'ok', entries: [file('main.ts')] },
    };
    test('an open folder shows its entries one level deeper, with marks and dots', async () => {
        const rows = rowsOf(listings, ['src'], { 'src/main.ts': 'M' });
        expect(rows.map(row => (row.kind === 'entry' ? [row.path, row.depth, row.mark ?? ''] : row.kind))).toEqual([
            ['src', 0, 'M'],
            ['src/main.ts', 1, 'M'],
            ['README.md', 0, ''],
        ]);
    });
    test('a closed folder hides its entries', async () => {
        expect(rowsOf(listings, [], {}).map(row => (row.kind === 'entry' ? row.path : ''))).toEqual(['src', 'README.md']);
    });
    test('a folder that could not be read shows why, in its place', async () => {
        const rows = rowsOf({ ...listings, src: { kind: 'error', message: 'EACCES' } }, ['src'], {});
        expect(rows[1]).toEqual({ kind: 'error', path: 'src', depth: 1, message: 'EACCES' });
    });
    test('a deleted file is a row marked as deleted', async () => {
        const rows = rowsOf(listings, [], { 'old.png': 'D' });
        expect(rows.find(row => row.kind === 'entry' && row.path === 'old.png')).toMatchObject({ isDeleted: true, mark: 'D' });
    });
});
describe('treeWindow', () => {
    test('a tree that fits shows whole, with nothing left out', async () => {
        expect(treeWindow(5, 15, null, 4)).toMatchObject({ from: 0, to: 5, above: 0, below: 0 });
    });
    test('the chosen row is brought into view, and the edges count what they stand for', async () => {
        const window = treeWindow(40, 10, null, 30);
        expect(window.from <= 30 && 30 < window.to - 1).toBe(true);
        expect(window.above).toBe(window.from + 1);
        expect(window.below).toBe(40 - window.to + 1);
    });
    test('a scrolled tree stays where the person left it, within its end', async () => {
        expect(treeWindow(40, 10, 99, 0)).toMatchObject({ from: 30, to: 40, lastTop: 30, below: 0 });
    });
});
describe('contentOf', () => {
    test('keeps the lines of a file, whatever its line ends', async () => {
        expect(contentOf('one\r\ntwo\nthree\n')).toEqual({ lines: ['one', 'two', 'three'], total: 3 });
    });
    test(`a file longer than ${MAX_LINES} lines keeps the first ${MAX_LINES} and counts them all`, async () => {
        const text = Array.from({ length: MAX_LINES + 20 }, (_, i) => `line ${i}`).join('\n');
        const kept = contentOf(text);
        expect(kept.lines).toHaveLength(MAX_LINES);
        expect(kept.total).toBe(MAX_LINES + 20);
    });
});
describe('textWindow', () => {
    const lines = Array.from({ length: 50 }, (_, i) => `line ${i + 1}`);
    test('shows as many lines as the rows hold, from the top asked', async () => {
        expect(textWindow(lines, 10, 8, 40)).toEqual({ first: 10, count: 8, lastTop: 42, total: 50 });
    });
    test('never runs past the end', async () => {
        expect(textWindow(lines, 999, 8, 40)).toMatchObject({ first: 42, count: 8 });
    });
    test('a long line takes the rows it wraps to', async () => {
        const wide = ['x'.repeat(100), 'short', 'short'];
        expect(textWindow(wide, 0, 3, 40)).toMatchObject({ first: 0, count: 1 });
    });
    test('a long line cut at the edge takes one row', async () => {
        const wide = ['x'.repeat(100), 'short', 'short'];
        expect(textWindow(wide, 0, 3, 40, false)).toMatchObject({ first: 0, count: 3 });
    });
});
