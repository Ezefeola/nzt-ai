import { describe, expect, test } from 'claude-code/testing';
import { foundOf, isShown, MAX_FOUND, shellReadOf, touchOf } from './activity';
import { branchOf, countsOf, gitOpsOf, linesOf } from './git';
import { TEXTS } from './i18n';
import { blocksOf, blockWindow, hasHugeBlock, MARKDOWN_LIMIT } from './markdown';
import { matchesOf, MAX_MATCHES, searchTreeOf } from './search';
import { settingsOf } from './settings';
import { marksOf, relativeTo, rowsOf } from './tree';
const z = (...entries) => [...entries, ''].join('\0');
describe('branchOf', () => {
    test('reads the branch, the remote one and how far ahead and behind', async () => {
        expect(branchOf(z('## main...origin/main [ahead 2, behind 1]'))).toEqual({
            kind: 'branch',
            name: 'main',
            upstream: 'origin/main',
            ahead: 2,
            behind: 1,
        });
    });
    test('a branch with no remote one is the branch alone', async () => {
        expect(branchOf(z('## work'))).toEqual({ kind: 'branch', name: 'work', ahead: 0, behind: 0 });
    });
    test('a loose commit is told apart, and a repository with no commit names its branch', async () => {
        expect(branchOf(z('## HEAD (no branch)'))).toBe('detached');
        expect(branchOf(z('## No commits yet on main'))).toEqual({ kind: 'branch', name: 'main', ahead: 0, behind: 0 });
    });
    test('the branch entry is not read as a changed file', async () => {
        expect(marksOf(z('## main...origin/main', ' M a.ts'))).toEqual({ 'a.ts': 'M' });
    });
});
describe('linesOf', () => {
    test('counts the lines each file gained and lost, from the project folder', async () => {
        expect(linesOf(z('12\t3\tapp/a.ts', '1\t0\tother/b.ts'), 'app/')).toEqual({ 'a.ts': [12, 3] });
    });
    test('a binary file is left out and a rename counts on its new path', async () => {
        expect(linesOf(z('-\t-\tlogo.png', '4\t1\t', 'old.ts', 'new.ts'))).toEqual({ 'new.ts': [4, 1] });
    });
});
test('a folder counts the files of each mark it holds at any depth', async () => {
    expect(countsOf({ 'a/b/x.ts': 'M', 'a/y.ts': 'M', 'a/z.ts': 'U', 'c/w.ts': 'D' })).toEqual({
        'a/b': { M: 1 },
        a: { M: 2, U: 1 },
        c: { D: 1 },
    });
});
describe('gitOpsOf', () => {
    test('names each git operation of a command once, in order', async () => {
        expect(gitOpsOf('git add . && git commit -m "x" && git push')).toEqual(['commit', 'push']);
    });
    test('sees past git options and names a pull request', async () => {
        expect(gitOpsOf('git -C repo checkout main; gh pr create --fill')).toEqual(['checkout', 'pr']);
    });
    test('a command that is not one of them is none', async () => {
        expect(gitOpsOf('git status && npm test')).toEqual([]);
    });
});
describe('touchOf', () => {
    test('a read, a write, a search and a shell command are told apart', async () => {
        expect(touchOf('Read', { file_path: 'a.ts' })).toEqual({ kind: 'read', paths: ['a.ts'] });
        expect(touchOf('NotebookEdit', { notebook_path: 'n.ipynb' })).toEqual({ kind: 'write', paths: ['n.ipynb'] });
        expect(touchOf('Glob', { pattern: '*.ts' })).toEqual({ kind: 'search' });
        expect(touchOf('PowerShell', { command: 'Get-Content a.ts' })).toEqual({ kind: 'shell', command: 'Get-Content a.ts' });
    });
    test('a tool the tree does not follow is none', async () => {
        expect(touchOf('WebFetch', { url: 'https://example.com' })).toBeUndefined();
    });
});
test(`a search paints at most ${MAX_FOUND} of the files it found`, async () => {
    const names = Array.from({ length: MAX_FOUND + 5 }, (_, i) => `f${i}.ts`);
    expect(foundOf({ filenames: names })).toHaveLength(MAX_FOUND);
    expect(foundOf({ content: 'no names' })).toEqual([]);
});
describe('shellReadOf', () => {
    test('a command that only reads names its words, options left out', async () => {
        expect(shellReadOf('cat README.md | head -n 5')).toEqual(['README.md', '5']);
        expect(shellReadOf('Get-Content -Path src/a.ts | Select-Object -First 3')).toEqual(['src/a.ts', '3']);
    });
    test('a command that writes, moves elsewhere or is unknown is not followed', async () => {
        expect(shellReadOf('cat a.ts > b.ts')).toBeUndefined();
        expect(shellReadOf('cd src && cat a.ts')).toBeUndefined();
        expect(shellReadOf('npm test')).toBeUndefined();
    });
    test('a redirection to nowhere still only reads', async () => {
        expect(shellReadOf('grep -r foo src 2>/dev/null')).toEqual(['foo', 'src']);
    });
});
test('the activity setting paints what it names, and the commit whenever something is painted', async () => {
    expect(isShown('write', 'read')).toBe(false);
    expect(isShown('write', 'commit')).toBe(true);
    expect(isShown('none', 'commit')).toBe(false);
    expect(isShown('read-write', 'read')).toBe(true);
});
describe('blocksOf', () => {
    test('cuts headings, paragraphs, lists and tables apart, and keeps a fenced block whole', async () => {
        const lines = ['# Title', 'intro', 'more', '', '- a', '- b', '', '```', 'code', '', 'more code', '```', '| a |', '| - |'];
        expect(blocksOf(lines).map(block => [block.from, block.to])).toEqual([
            [0, 1],
            [1, 3],
            [4, 6],
            [7, 12],
            [12, 14],
        ]);
    });
});
describe('blockWindow', () => {
    const blocks = blocksOf(Array.from({ length: 20 }, (_, i) => [`## Part ${i}`, '', `text ${i}`, '']).flat());
    test('shows whole blocks that fit, from the block asked', async () => {
        expect(blockWindow(blocks, 4, 8, 40)).toMatchObject({ first: 4, count: 4 });
    });
    test('never runs past the end', async () => {
        const window = blockWindow(blocks, 999, 8, 40);
        expect(window.first + window.count).toBe(blocks.length);
    });
    test('a block taller than the window still shows, from its top', async () => {
        const tall = blocksOf(Array.from({ length: 30 }, (_, i) => `- item ${i}`));
        expect(blockWindow(tall, 0, 8, 40)).toMatchObject({ first: 0, count: 1 });
    });
});
test('a block past what the engine draws at once is told apart', async () => {
    expect(hasHugeBlock([{ from: 0, to: 1, text: 'x'.repeat(MARKDOWN_LIMIT + 1) }])).toBe(true);
    expect(hasHugeBlock([{ from: 0, to: 1, text: 'x'.repeat(MARKDOWN_LIMIT) }])).toBe(false);
});
describe('search', () => {
    const index = [
        { path: 'src', isDir: true, size: 0, mtimeMs: 0 },
        { path: 'src/Main.ts', isDir: false, size: 1, mtimeMs: 0 },
        { path: 'docs/main.md', isDir: false, size: 1, mtimeMs: 0 },
        { path: 'README.md', isDir: false, size: 1, mtimeMs: 0 },
    ];
    test('matches the path from the project folder without case', async () => {
        expect(matchesOf(index, 'MAIN').map(item => item.path)).toEqual(['src/Main.ts', 'docs/main.md']);
    });
    test(`keeps at most ${MAX_MATCHES} matches`, async () => {
        const many = Array.from({ length: MAX_MATCHES + 1 }, (_, i) => ({ path: `f${i}`, isDir: false, size: 0, mtimeMs: 0 }));
        expect(matchesOf(many, 'f')).toHaveLength(MAX_MATCHES);
    });
    test('shows each match under the folders that hold it, those open', async () => {
        const tree = searchTreeOf(matchesOf(index, 'main'), {});
        const rows = rowsOf(tree.listings, tree.open, tree.marks);
        expect(rows.map(row => (row.kind === 'entry' ? row.path : ''))).toEqual(['docs', 'docs/main.md', 'src', 'src/Main.ts']);
    });
});
describe('relativeTo', () => {
    test('takes an absolute path inside the project to a path from it, without case on Windows', async () => {
        expect(relativeTo('C:/proj', 'c:\\Proj\\src\\a.ts')).toBe('src/a.ts');
        expect(relativeTo('C:/proj', '/c/proj/src/a.ts')).toBe('src/a.ts');
        expect(relativeTo('C:/proj', './src/../README.md')).toBe('README.md');
    });
    test('a path outside the project is none', async () => {
        expect(relativeTo('C:/proj', 'D:/other/a.ts')).toBeUndefined();
        expect(relativeTo('C:/proj', 'C:/project2/a.ts')).toBeUndefined();
        expect(relativeTo('/home/me/proj', '../x.ts')).toBeUndefined();
    });
});
describe('age and day', () => {
    const now = new Date(2026, 9, 19, 12).getTime();
    test('an age is in its largest unit, and past a week it is the day', async () => {
        expect(TEXTS.es.age(now - 30000, now)).toBe('ahora');
        expect(TEXTS.es.age(now - 12 * 60000, now)).toBe('12m');
        expect(TEXTS.es.age(now - 3 * 3600000, now)).toBe('3h');
        expect(TEXTS.es.age(now - 5 * 86400000, now)).toBe('5d');
        expect(TEXTS.es.age(new Date(2026, 9, 9).getTime(), now)).toBe('9 oct');
    });
    test('a day of another year carries the year', async () => {
        expect(TEXTS.es.day(new Date(2025, 9, 9).getTime(), now)).toBe('9 oct 2025');
        expect(TEXTS.en.day(new Date(2025, 9, 9).getTime(), now)).toBe('Oct 9 2025');
    });
});
test('settings take their defaults for what is missing or unknown', async () => {
    expect(settingsOf({ activity: 'loud', follow: 'yes', openWith: '  code -g {path} ' })).toEqual({
        activity: 'read-write',
        follow: true,
        openAtStart: true,
        column: 'date',
        openWith: 'code -g {path}',
        icons: 'auto',
        notices: true,
    });
});
