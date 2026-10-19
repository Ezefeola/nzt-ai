import { expect, mock, test } from 'claude-code/testing';
const ROOT = 'C:/proj';
// 2026-10-19 12:00 UTC; the files below were last changed an hour before.
const NOW = 1792411200000;
const AN_HOUR_AGO = NOW - 3600000;
const VIOLET = '#c084fc';
const ORANGE = '#fb923c';
const GREEN = '#4ade80';
const run = (stdout, exitCode = 0, stderr = '') => ({
    value: { exitCode, stdout, stderr, isStdoutTruncated: false, isStderrTruncated: false },
});
const DISK = {
    folders: {
        [ROOT]: [
            { name: '.git', kind: 'dir' },
            { name: 'README.md', kind: 'file' },
            { name: 'src', kind: 'dir' },
            { name: 'logo.bin', kind: 'file' },
        ],
        [`${ROOT}/src`]: [{ name: 'main.ts', kind: 'file' }],
    },
    files: {
        [`${ROOT}/README.md`]: '# Proj\n',
        [`${ROOT}/src/main.ts`]: "export const a = 1\nexport const b = 'two'\n",
        [`${ROOT}/logo.bin`]: 'PNG\0\0data',
    },
    status: ['## mods...origin/mods [ahead 2]', ' M src/main.ts', ' D old.png', ''].join('\0'),
    numstat: ['12\t3\tsrc/main.ts', ''].join('\0'),
};
const at = (path) => String(path).replace(/\\/g, '/');
/** The world beneath the pane: the disk, git, the clock, the panes and the clipboard. Returns what it saw. */
const fakeDisk = (on, disk) => {
    const seen = { argv: [], copied: [], opened: [], closed: [] };
    const clock = mock.clock(on, { now: NOW });
    on('session.root', async () => ({ value: ROOT }));
    on('command.register', async () => ({ value: undefined }));
    on('fs.list', async (_, e) => {
        const entries = disk.folders[at(e.path)];
        if (entries === undefined)
            return { deny: 'EACCES: permission denied' };
        return {
            value: entries.map(entry => ({
                ...entry,
                size: disk.files[`${at(e.path)}/${entry.name}`]?.length ?? 0,
                mtimeMs: entry.kind === 'file' ? AN_HOUR_AGO : 0,
                isLink: false,
            })),
        };
    });
    on('fs.stat', async (_, e) => {
        const path = at(e.path);
        if (disk.folders[path] !== undefined)
            return { value: { kind: 'dir', size: 0, mtimeMs: 0, isLink: false } };
        const text = disk.files[path];
        if (text === undefined)
            return { deny: 'ENOENT' };
        return { value: { kind: 'file', size: text.length, mtimeMs: AN_HOUR_AGO, isLink: false } };
    });
    on('fs.read', async (_, e) => {
        const text = disk.files[at(e.path)];
        if (text === undefined)
            return { deny: 'ENOENT' };
        return { value: text };
    });
    on('process.run', async (_, e) => {
        seen.argv.push([...e.argv]);
        if (e.argv[0] !== 'git')
            return disk.openError === undefined ? run('') : run('', 1, disk.openError);
        if (disk.isRepo === false)
            return run('', 128, 'fatal: not a git repository');
        if (e.argv.includes('--show-prefix'))
            return run('\n');
        if (e.argv.includes('--numstat'))
            return run(disk.numstat ?? '');
        if (e.argv[1] === 'show')
            return run(['README.md', ''].join('\0'));
        if (e.argv[1] === 'log')
            return run('Update the readme\n');
        return run(disk.status ?? '');
    });
    on('ui.open', async (_, e) => {
        seen.opened.push(e.id);
        return { value: { isPlaced: true } };
    });
    on('ui.close', async (_, e) => {
        seen.closed.push(e.id);
        return { value: undefined };
    });
    on('ui.focus', async () => ({ value: {} }));
    on('ui.copy', async (_, e) => {
        seen.copied.push(e.text);
        return { value: { isCopied: true } };
    });
    return { clock, seen };
};
const openPane = ($) => $.command.run({
    command: 'nzt-files',
    args: '',
    origin: { kind: 'composer' },
    presentation: { isFullscreen: true, columns: 160 },
});
const mount = ($, bodyRows = 40, bodyColumns = 60) => $.ui.mount({
    plugin: 'nzt-files',
    surface: 'terminal',
    component: 'Pane',
    requestId: 'nzt-files',
    viewport: { columns: bodyColumns + 4, rows: bodyRows + 4 },
    props: {
        title: 'Archivos',
        isFocused: true,
        bodyColumns,
        placement: 'dock',
        scroll: { offset: 0, bodyRows },
        view: {},
    },
});
/** A tool call that waits for `release` before the tool answers, to look at the pane while it runs. */
const heldTool = (on, answer = { result: 'ok' }) => {
    let release = () => { };
    const held = new Promise(resolve => {
        release = resolve;
    });
    on('tool.call', async () => {
        await held;
        return answer;
    });
    return () => release();
};
const nameRow = (ui, name) => ui.find({ type: 'Text', text: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}$`) });
// The pane as it was.
test('the pane opens on the project: folders first, .git hidden, marks and counts of git', async ($, on) => {
    fakeDisk(on, DISK);
    expect(await openPane($)).toEqual({});
    const ui = await mount($);
    expect(await nameRow(ui, 'src/')).toBeDefined();
    expect(await nameRow(ui, 'README.md')).toBeDefined();
    expect(await nameRow(ui, '.git/')).toBeUndefined();
    expect(await ui.find({ type: 'Text', text: 'M:1' })).toBeDefined();
    expect(await ui.find({ type: 'Text', text: /Elegí un archivo del árbol\.$/ })).toBeDefined();
});
test('the card keeps a blank row under the pane tabs and still fills the body', async ($, on) => {
    fakeDisk(on, DISK);
    await openPane($);
    const ui = await mount($);
    expect(await ui.drawn()).toMatchObject({ props: { marginTop: 1, height: 39 } });
});
test('a folder opens with a click and its file shows beneath, numbered, with its detail', async ($, on) => {
    fakeDisk(on, DISK);
    await openPane($);
    const ui = await mount($);
    await ui.press({ key: 'n:src' });
    expect(await nameRow(ui, 'main.ts')).toBeDefined();
    await ui.press({ key: 'n:src/main.ts' });
    expect(await ui.find({ type: 'Text', text: 'src/main.ts' })).toBeDefined();
    expect(await ui.find({ type: 'Text', text: 'M modificado' })).toBeDefined();
    expect(await ui.find({ type: 'Text', text: /TypeScript · \d+ B · 2 líneas/ })).toBeDefined();
    expect(await ui.find({ type: 'Code', text: "export const a = 1\nexport const b = 'two'" })).toBeDefined();
    await ui.press({ key: 'n:src' });
    expect(await nameRow(ui, 'main.ts')).toBeUndefined();
});
test('a long line of source is cut at the edge until Wrap is checked', async ($, on) => {
    fakeDisk(on, DISK);
    await openPane($);
    const ui = await mount($);
    await ui.press({ key: 'n:src' });
    await ui.press({ key: 'n:src/main.ts' });
    expect(await ui.find({ type: 'Code' })).toMatchObject({ props: { wrap: 'truncate-end' } });
    expect(await ui.find({ type: 'Button', key: 'wrap', text: '☐ Ajustar' })).toBeDefined();
    await ui.press({ key: 'wrap' });
    expect(await ui.find({ type: 'Code' })).toMatchObject({ props: { wrap: 'wrap' } });
    expect(await ui.find({ type: 'Button', key: 'wrap', text: '☑ Ajustar' })).toBeDefined();
});
test('a binary file shows what it is, not its bytes', async ($, on) => {
    fakeDisk(on, DISK);
    await openPane($);
    const ui = await mount($);
    await ui.press({ key: 'n:logo.bin' });
    expect(await ui.find({ type: 'Text', text: /Archivo binario/ })).toBeDefined();
    expect(await ui.find({ type: 'Code' })).toBeUndefined();
});
test('a file deleted since the last commit stays in its place, struck through, and says where its diff is', async ($, on) => {
    fakeDisk(on, DISK);
    await openPane($);
    const ui = await mount($);
    expect((await nameRow(ui, 'old.png'))?.props).toMatchObject({ strikethrough: true });
    await ui.press({ key: 'n:old.png' });
    expect(await ui.find({ type: 'Text', text: /Se borró desde el último commit/ })).toBeDefined();
    expect(await ui.find({ type: 'Text', text: /\/nzt-changes/ })).toBeDefined();
});
test('a folder that cannot be read says so in its place and the rest keeps working', async ($, on) => {
    fakeDisk(on, { ...DISK, folders: { ...DISK.folders, [ROOT]: [...DISK.folders[ROOT], { name: 'secrets', kind: 'dir' }] } });
    await openPane($);
    const ui = await mount($);
    await ui.press({ key: 'n:secrets' });
    expect(await ui.find({ type: 'Text', text: /⚠ no se pudo leer: .*EACCES/ })).toBeDefined();
    await ui.press({ key: 'n:README.md' });
    expect(await ui.find({ type: 'Markdown', text: '# Proj' })).toBeDefined();
});
test('a file taller than its window scrolls and says which lines show', async ($, on) => {
    const long = Array.from({ length: 60 }, (_, i) => `line ${i + 1}`).join('\n');
    fakeDisk(on, { ...DISK, files: { ...DISK.files, [`${ROOT}/src/main.ts`]: long } });
    await openPane($);
    const ui = await mount($);
    await ui.press({ key: 'n:src' });
    await ui.press({ key: 'n:src/main.ts' });
    expect(await ui.find({ type: 'Text', text: /^líneas 1–\d+ de 60$/ })).toBeDefined();
    await ui.press({ key: 'view-down' });
    expect(await ui.find({ type: 'Text', text: /^líneas 2–\d+ de 60$/ })).toBeDefined();
});
// Context zero: the pane adds nothing to what Claude reads.
test('the command opens and closes the pane beside the conversation without printing a line', async ($, on) => {
    fakeDisk(on, DISK);
    expect(await openPane($)).toEqual({});
    await mount($);
    expect(await openPane($)).toEqual({});
});
test('the command prints one line only when the pane cannot go beside the conversation', async ($, on) => {
    fakeDisk(on, DISK);
    const opened = await $.command.run({
        command: 'nzt-files',
        args: '',
        origin: { kind: 'composer' },
        presentation: { isFullscreen: false, columns: 160 },
    });
    expect(opened.text).toMatch(/sobre el prompt/);
});
test('a tool call reaches the tool as it came and its result comes back untouched', async ($, on) => {
    fakeDisk(on, DISK);
    const seen = [];
    on('tool.call', async (_, e) => {
        seen.push(e);
        return { result: 'the file' };
    });
    await openPane($);
    await mount($);
    const ran = await $.tool.call({ tool: 'Read', file_path: `${ROOT}/README.md` });
    expect(ran).toEqual({ result: 'the file' });
    expect(seen[0]).toMatchObject({ tool: 'Read', file_path: `${ROOT}/README.md` });
    expect(seen[0].context).toBeUndefined();
});
test('a tool whose result the pane cannot follow still gets it back untouched', async ($, on) => {
    fakeDisk(on, DISK);
    on('tool.call', async () => ({ result: { filenames: 'not a list' } }));
    await openPane($);
    await mount($);
    expect(await $.tool.call({ tool: 'Grep', pattern: 'x' })).toEqual({ result: { filenames: 'not a list' } });
});
test('a message naming @path reaches Claude as typed, with nothing added', async ($, on) => {
    fakeDisk(on, DISK);
    const seen = [];
    on('prompt.submit', async (_, e) => {
        seen.push({ text: e.text, ...(e.context === undefined ? {} : { context: e.context }) });
        return { text: e.text };
    });
    await openPane($);
    await mount($);
    await $.prompt.submit({ text: 'look at @src/main.ts please' });
    expect(seen).toEqual([{ text: 'look at @src/main.ts please' }]);
});
// Claude's activity.
test('a file Claude reads is violet while the tool runs and goes out a few seconds after it ends', async ($, on) => {
    const { clock } = fakeDisk(on, DISK);
    const release = heldTool(on);
    await openPane($);
    const ui = await mount($);
    const call = $.tool.call({ tool: 'Read', file_path: `${ROOT}/README.md` });
    await clock.settle();
    expect((await nameRow(ui, 'README.md'))?.props).toMatchObject({ color: VIOLET, bold: true });
    release();
    await call;
    expect((await nameRow(ui, 'README.md'))?.props).toMatchObject({ color: VIOLET, dimColor: true });
    await clock.advance(3000);
    expect((await nameRow(ui, 'README.md'))?.props.color).toBeUndefined();
});
test('a file Claude writes is orange, and the tree opens its folders to show it', async ($, on) => {
    const { clock } = fakeDisk(on, DISK);
    const release = heldTool(on);
    await openPane($);
    const ui = await mount($);
    const call = $.tool.call({ tool: 'Edit', file_path: `${ROOT}/src/main.ts`, old_string: 'a', new_string: 'b' });
    await clock.settle();
    expect((await nameRow(ui, 'main.ts'))?.props).toMatchObject({ color: ORANGE });
    release();
    await call;
});
test('without following, a closed folder takes the color of the file Claude writes inside it', { options: { follow: false } }, async ($, on) => {
    const { clock } = fakeDisk(on, DISK);
    const release = heldTool(on);
    await openPane($);
    const ui = await mount($);
    const call = $.tool.call({ tool: 'Write', file_path: `${ROOT}/src/main.ts`, content: 'x' });
    await clock.settle();
    expect(await nameRow(ui, 'main.ts')).toBeUndefined();
    expect((await nameRow(ui, 'src/'))?.props).toMatchObject({ color: ORANGE });
    release();
    await call;
});
test('a tool that fails or is refused takes its color away at once', async ($, on) => {
    fakeDisk(on, DISK);
    on('tool.call', async () => ({ deny: 'the person said no' }));
    await openPane($);
    const ui = await mount($);
    await $.tool.call({ tool: 'Read', file_path: `${ROOT}/README.md` });
    expect((await nameRow(ui, 'README.md'))?.props.color).toBeUndefined();
});
test('a shell command that only reads paints the project files it names', async ($, on) => {
    const { clock } = fakeDisk(on, DISK);
    const release = heldTool(on);
    await openPane($);
    const ui = await mount($);
    const call = $.tool.call({ tool: 'Bash', command: 'cat README.md | head -n 5' });
    await clock.settle();
    expect((await nameRow(ui, 'README.md'))?.props).toMatchObject({ color: VIOLET });
    release();
    await call;
});
test('a search paints the files it found', async ($, on) => {
    fakeDisk(on, DISK);
    on('tool.call', async () => ({ result: { filenames: [`${ROOT}/README.md`], numFiles: 1 } }));
    await openPane($);
    const ui = await mount($);
    await $.tool.call({ tool: 'Grep', pattern: 'Proj' });
    expect((await nameRow(ui, 'README.md'))?.props).toMatchObject({ color: VIOLET });
});
test('what Claude reads outside the project paints nothing', async ($, on) => {
    const { clock } = fakeDisk(on, DISK);
    const release = heldTool(on);
    await openPane($);
    const ui = await mount($);
    const call = $.tool.call({ tool: 'Read', file_path: 'D:/elsewhere/README.md' });
    await clock.settle();
    expect((await nameRow(ui, 'README.md'))?.props.color).toBeUndefined();
    release();
    await call;
});
test('with the activity setting on writing only, what Claude reads is not painted', { options: { activity: 'write' } }, async ($, on) => {
    const { clock } = fakeDisk(on, DISK);
    const release = heldTool(on);
    await openPane($);
    const ui = await mount($);
    const call = $.tool.call({ tool: 'Read', file_path: `${ROOT}/README.md` });
    await clock.settle();
    expect((await nameRow(ui, 'README.md'))?.props.color).toBeUndefined();
    release();
    await call;
});
// The git line.
test('a commit Claude makes paints its files green and the last row says it is done', async ($, on) => {
    fakeDisk(on, DISK);
    on('tool.call', async () => ({ result: { stdout: '', stderr: '' } }));
    await openPane($);
    const ui = await mount($);
    await $.tool.call({ tool: 'Bash', command: 'git commit -m "Update the readme"' });
    expect((await nameRow(ui, 'README.md'))?.props).toMatchObject({ color: GREEN });
    expect(await ui.find({ type: 'Text', text: '● commit hecho' })).toBeDefined();
    expect(await ui.find({ type: 'Text', text: ' · Update the readme' })).toBeDefined();
});
test('a git operation says it is running, then that it failed, and the row goes after 45 seconds', async ($, on) => {
    const { clock } = fakeDisk(on, DISK);
    let release = () => { };
    const held = new Promise(resolve => {
        release = resolve;
    });
    on('tool.call', async () => {
        await held;
        return { isError: true, result: 'rejected', text: 'rejected' };
    });
    await openPane($);
    const ui = await mount($);
    const call = $.tool.call({ tool: 'Bash', command: 'git push' });
    await clock.settle();
    expect(await ui.find({ type: 'Text', text: '↻ haciendo push…' })).toBeDefined();
    release();
    await call;
    expect(await ui.find({ type: 'Text', text: '✗ push falló' })).toBeDefined();
    await clock.advance(45000);
    expect(await ui.find({ type: 'Text', text: '✗ push falló' })).toBeUndefined();
});
test('the heading says the branch, the remote one and how far ahead it is', async ($, on) => {
    fakeDisk(on, DISK);
    await openPane($);
    const ui = await mount($);
    expect(await ui.find({ type: 'Text', text: /⑂ mods → origin\/mods/ })).toBeDefined();
    expect(await ui.find({ type: 'Text', text: ' ↑2' })).toBeDefined();
});
test('a modified file shows the lines it gained and lost', async ($, on) => {
    fakeDisk(on, DISK);
    await openPane($);
    const ui = await mount($);
    await ui.press({ key: 'n:src' });
    expect(await ui.find({ type: 'Text', text: '+12' })).toBeDefined();
    expect(await ui.find({ type: 'Text', text: '-3' })).toBeDefined();
});
test('a narrow pane shows only the letters, and a dot on the folder in place of its counts', async ($, on) => {
    fakeDisk(on, DISK);
    await openPane($);
    const ui = await mount($, 40, 40);
    await ui.press({ key: 'n:src' });
    expect(await ui.find({ type: 'Text', text: '+12' })).toBeUndefined();
    expect(await ui.find({ type: 'Text', text: 'M:1' })).toBeUndefined();
    expect(await ui.find({ type: 'Text', text: '●' })).toBeDefined();
    expect(await ui.find({ type: 'Text', text: 'M' })).toBeDefined();
});
test('outside a repository the tree shows with no marks, and a line says when they show', async ($, on) => {
    fakeDisk(on, { ...DISK, isRepo: false });
    await openPane($);
    const ui = await mount($);
    expect(await nameRow(ui, 'README.md')).toBeDefined();
    expect(await ui.find({ type: 'Text', text: /sin git/ })).toBeDefined();
    expect(await ui.find({ type: 'Text', text: /después de git init/ })).toBeDefined();
    expect(await ui.find({ type: 'Text', text: '●' })).toBeUndefined();
});
test('with notices off the git init line is gone', { options: { notices: false } }, async ($, on) => {
    fakeDisk(on, { ...DISK, isRepo: false });
    await openPane($);
    const ui = await mount($);
    expect(await ui.find({ type: 'Text', text: /después de git init/ })).toBeUndefined();
});
// Markdown.
const LONG_MD = Array.from({ length: 30 }, (_, i) => `## Part ${i + 1}\n\nText of part ${i + 1}.`).join('\n\n');
test('a Markdown file is drawn, with its box checked, and unchecking it shows the source', async ($, on) => {
    fakeDisk(on, DISK);
    await openPane($);
    const ui = await mount($);
    await ui.press({ key: 'n:README.md' });
    expect(await ui.find({ type: 'Markdown', text: '# Proj' })).toBeDefined();
    expect(await ui.find({ type: 'Button', key: 'markdown', text: '☑ Markdown' })).toBeDefined();
    await ui.press({ key: 'markdown' });
    expect(await ui.find({ type: 'Code', text: '# Proj' })).toBeDefined();
    expect(await ui.find({ type: 'Button', key: 'markdown', text: '☐ Markdown' })).toBeDefined();
});
test('drawn Markdown moves a whole block at a time and says which lines show', async ($, on) => {
    fakeDisk(on, { ...DISK, files: { ...DISK.files, [`${ROOT}/README.md`]: LONG_MD } });
    await openPane($);
    const ui = await mount($);
    await ui.press({ key: 'n:README.md' });
    expect(await ui.find({ type: 'Text', text: /^líneas 1–\d+ de 119 · de a bloque$/ })).toBeDefined();
    await ui.press({ key: 'view-down' });
    expect(await ui.find({ type: 'Text', text: /^líneas 3–\d+ de 119 · de a bloque$/ })).toBeDefined();
    expect((await ui.find({ type: 'Markdown' }))?.text.startsWith('Text of part 1.')).toBe(true);
});
test('a Markdown block larger than the engine draws at once shows the file as source and says why', async ($, on) => {
    // One table past the engine's 100,000 characters, within the 5,000 lines the viewer keeps.
    const huge = `| a |\n${`| ${'x'.repeat(30)} |\n`.repeat(3000)}`;
    fakeDisk(on, { ...DISK, files: { ...DISK.files, [`${ROOT}/README.md`]: huge } });
    await openPane($);
    const ui = await mount($);
    await ui.press({ key: 'n:README.md' });
    expect(await ui.find({ type: 'Text', text: /Se ve como fuente/ })).toBeDefined();
    expect(await ui.find({ type: 'Markdown' })).toBeUndefined();
});
test('the file expands over the whole pane, and ← Árbol brings the tree back as it was', async ($, on) => {
    fakeDisk(on, DISK);
    await openPane($);
    const ui = await mount($);
    await ui.press({ key: 'n:src' });
    await ui.press({ key: 'n:README.md' });
    await ui.press({ key: 'expand' });
    expect(await nameRow(ui, 'src/')).toBeUndefined();
    expect(await ui.find({ type: 'Button', key: 'expand', text: '← Árbol' })).toBeDefined();
    await ui.press({ key: 'expand' });
    expect(await nameRow(ui, 'main.ts')).toBeDefined();
    expect(await ui.find({ type: 'Markdown', text: '# Proj' })).toBeDefined();
});
// Search, keys, copy, open.
test('the search shows the matches under their folders, closed ones too, and Enter chooses the first', async ($, on) => {
    fakeDisk(on, DISK);
    await openPane($);
    const ui = await mount($);
    await ui.input({ key: 'search', text: 'MAIN', kind: 'change' });
    expect(await nameRow(ui, 'src/')).toBeDefined();
    expect(await nameRow(ui, 'main.ts')).toBeDefined();
    expect(await nameRow(ui, 'README.md')).toBeUndefined();
    await ui.input({ key: 'search', text: 'MAIN', kind: 'submit' });
    expect(await ui.find({ type: 'Code', text: /export const a = 1/ })).toBeDefined();
    expect(await nameRow(ui, 'README.md')).toBeDefined();
    expect(await nameRow(ui, 'main.ts')).toBeDefined();
});
test('a search with no match says so and stays open; emptying it brings the tree back', async ($, on) => {
    fakeDisk(on, DISK);
    await openPane($);
    const ui = await mount($);
    await ui.input({ key: 'search', text: 'zzz', kind: 'change' });
    expect(await ui.find({ type: 'Text', text: /Nada con «zzz»/ })).toBeDefined();
    expect(await ui.find({ type: 'Input', key: 'search' })).toBeDefined();
    await ui.press({ key: 'clear' });
    expect(await nameRow(ui, 'README.md')).toBeDefined();
});
test('the search does not walk into heavy folders', async ($, on) => {
    const disk = {
        ...DISK,
        folders: {
            ...DISK.folders,
            [ROOT]: [...DISK.folders[ROOT], { name: 'node_modules', kind: 'dir' }],
            [`${ROOT}/node_modules`]: [{ name: 'main-lib.js', kind: 'file' }],
        },
    };
    fakeDisk(on, disk);
    await openPane($);
    const ui = await mount($);
    await ui.input({ key: 'search', text: 'main', kind: 'change' });
    expect(await nameRow(ui, 'main.ts')).toBeDefined();
    expect(await nameRow(ui, 'main-lib.js')).toBeUndefined();
});
test('j and k walk the rows, l opens a folder and h closes it', async ($, on) => {
    fakeDisk(on, DISK);
    await openPane($);
    const ui = await mount($);
    await ui.press({ key: 'down' });
    await ui.press({ key: 'in' });
    expect(await nameRow(ui, 'main.ts')).toBeDefined();
    await ui.press({ key: 'out' });
    expect(await nameRow(ui, 'main.ts')).toBeUndefined();
});
test('copy path puts the row path from the project folder on the clipboard and says so', async ($, on) => {
    const { seen } = fakeDisk(on, DISK);
    await openPane($);
    const ui = await mount($);
    await ui.press({ key: 'n:src' });
    await ui.press({ key: 'n:src/main.ts' });
    await ui.press({ key: 'copy' });
    expect(seen.copied).toEqual(['src/main.ts']);
    expect(await ui.find({ type: 'Text', text: 'Ruta copiada: src/main.ts' })).toBeDefined();
});
test('open with the app hands the file to Windows, and a double click does the same', async ($, on) => {
    const { seen, clock } = fakeDisk(on, DISK);
    await openPane($);
    const ui = await mount($);
    await ui.press({ key: 'n:README.md' });
    await ui.press({ key: 'open' });
    const opened = seen.argv.filter(argv => argv[0] === 'powershell.exe');
    expect(opened).toHaveLength(1);
    expect(opened[0].at(-1)).toBe("Start-Process -FilePath 'C:\\proj\\README.md'");
    await clock.advance(1000);
    await ui.press({ key: 'n:README.md' });
    await ui.press({ key: 'n:README.md' });
    expect(seen.argv.filter(argv => argv[0] === 'powershell.exe')).toHaveLength(2);
});
test('the open with setting runs its command with the file put in', { options: { openWith: 'code -g {path}' } }, async ($, on) => {
    const { seen } = fakeDisk(on, DISK);
    await openPane($);
    const ui = await mount($);
    await ui.press({ key: 'n:README.md' });
    await ui.press({ key: 'open' });
    const opened = seen.argv.find(argv => argv[0] === 'powershell.exe');
    expect(opened.at(-1)).toBe("Start-Process -FilePath 'code' -ArgumentList @('-g','C:\\proj\\README.md')");
});
test('a file that cannot be opened says why and the pane stays as it was', async ($, on) => {
    fakeDisk(on, { ...DISK, openError: 'No application is associated with the specified file' });
    await openPane($);
    const ui = await mount($);
    await ui.press({ key: 'n:README.md' });
    await ui.press({ key: 'open' });
    expect(await ui.find({ type: 'Text', text: /No se pudo abrir: No application/ })).toBeDefined();
    expect(await ui.find({ type: 'Markdown', text: '# Proj' })).toBeDefined();
});
test('a message naming @path opens its folders and highlights it', async ($, on) => {
    fakeDisk(on, DISK);
    on('prompt.submit', async (_, e) => ({ text: e.text }));
    await openPane($);
    const ui = await mount($);
    await $.prompt.submit({ text: 'look at @src/main.ts' });
    expect(await nameRow(ui, 'main.ts')).toBeDefined();
});
// The column, the icons and opening at the start.
test('the column shows each file date, and Σ changes it to sizes', async ($, on) => {
    fakeDisk(on, DISK);
    await openPane($);
    const ui = await mount($);
    expect(await ui.find({ type: 'Text', text: '19 oct' })).toBeDefined();
    await ui.press({ key: 'sum' });
    expect(await ui.find({ type: 'Text', text: '7 B' })).toBeDefined();
});
test('the age column says how long ago', { options: { column: 'age' } }, async ($, on) => {
    fakeDisk(on, DISK);
    await openPane($);
    const ui = await mount($);
    expect(await ui.find({ type: 'Text', text: '1h' })).toBeDefined();
});
test('in sizes a folder shows what everything inside it takes', { options: { column: 'size' } }, async ($, on) => {
    const { clock } = fakeDisk(on, DISK);
    await openPane($);
    const ui = await mount($);
    await clock.settle();
    const size = DISK.files[`${ROOT}/src/main.ts`].length;
    expect(await ui.find({ type: 'Text', text: `${size} B` })).toBeDefined();
});
test('with Nerd Font icons a folder row carries its folder icon', { options: { icons: 'nerd' } }, async ($, on) => {
    fakeDisk(on, DISK);
    await openPane($);
    const ui = await mount($);
    expect(await ui.find({ type: 'Text', text: '▸ \u{f07b} ' })).toBeDefined();
});
test('the pane opens by itself when the session starts', async ($, on) => {
    const { seen } = fakeDisk(on, DISK);
    on('session.start', async (_, e) => ({ cwd: e.cwd }));
    await $.session.start({ cwd: ROOT, surface: 'terminal', isInteractive: true });
    expect(seen.opened).toEqual(['nzt-files']);
});
test('opened at the start and seated above the prompt, the pane closes again', async ($, on) => {
    const { seen } = fakeDisk(on, DISK);
    on('session.start', async (_, e) => ({ cwd: e.cwd }));
    await $.session.start({ cwd: ROOT, surface: 'terminal', isInteractive: true });
    await $.ui.mount({
        plugin: 'nzt-files',
        surface: 'terminal',
        component: 'Pane',
        requestId: 'nzt-files',
        viewport: { columns: 64, rows: 28 },
        props: { title: 'Archivos', isFocused: false, bodyColumns: 60, placement: 'inline', scroll: { offset: 0, bodyRows: 24 }, view: {} },
    });
    expect(seen.opened).toEqual(['nzt-files']);
    expect(seen.closed).toEqual(['nzt-files']);
});
test('with open at start off the pane waits for the command', { options: { openAtStart: false } }, async ($, on) => {
    const { seen } = fakeDisk(on, DISK);
    on('session.start', async (_, e) => ({ cwd: e.cwd }));
    await $.session.start({ cwd: ROOT, surface: 'terminal', isInteractive: true });
    expect(seen.opened).toEqual([]);
});
