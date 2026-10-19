/** The only entry the tree hides. */
const HIDDEN = '.git';
/** The most lines and characters the viewer keeps of a file. */
export const MAX_LINES = 5000;
export const MAX_CHARS = 1000000;
/** Which mark a folder's dot takes when it holds several: the strongest. */
const RANK = { D: 3, M: 2, A: 1, U: 1 };
export const folderOf = (path) => path.slice(0, Math.max(0, path.lastIndexOf('/')));
export const nameOf = (path) => path.slice(path.lastIndexOf('/') + 1);
export const join = (folder, name) => (folder === '' ? name : `${folder}/${name}`);
/** The folders that hold `path`, outermost first: `a/b/c.ts` is held by `a` and `a/b`. */
export const ancestorsOf = (path) => {
    const folders = [];
    for (let folder = folderOf(path); folder !== ''; folder = folderOf(folder))
        folders.unshift(folder);
    return folders;
};
/**
 * `path`, absolute or relative to the project's folder `root`, as a path from that folder;
 * undefined when it lies outside. On Windows the case does not tell paths apart, and Git
 * Bash's `/c/...` is `C:/...`.
 */
export const relativeTo = (root, path) => {
    const isWindows = /^[A-Za-z]:/.test(root);
    let clean = path.trim().replace(/\\/g, '/');
    if (isWindows)
        clean = clean.replace(/^\/([A-Za-z])\//, (_, drive) => `${drive}:/`);
    const isAbsolute = clean.startsWith('/') || /^[A-Za-z]:\//.test(clean);
    const words = [];
    for (const word of (isAbsolute ? clean : `${root}/${clean}`).split('/')) {
        if (word === '' || word === '.')
            continue;
        if (word === '..')
            words.pop();
        else
            words.push(word);
    }
    const whole = (root.startsWith('/') ? '/' : '') + words.join('/');
    const same = (a, b) => (isWindows ? a.toLowerCase() === b.toLowerCase() : a === b);
    if (same(whole, root))
        return '';
    if (!same(whole.slice(0, root.length + 1), `${root}/`))
        return undefined;
    return whole.slice(root.length + 1);
};
const markOf = (xy) => {
    if (xy === '??')
        return 'U';
    const [x, y] = [xy[0], xy[1]];
    // Added to the index and deleted from the tree: it exists neither in the commit nor on disk.
    if (x === 'A' && y === 'D')
        return undefined;
    if (x === 'A' || x === 'C' || x === 'R')
        return 'A';
    if (x === 'D' || y === 'D')
        return 'D';
    return 'M';
};
/**
 * The marks `git status --porcelain=v1 -z` gives, by path from the project's folder: `prefix`
 * is where that folder sits in the repository (`git rev-parse --show-prefix`), and a file
 * outside it is left out. A rename marks its new path added and its old one deleted.
 */
export const marksOf = (out, prefix = '') => {
    const parts = out.split('\0');
    const marks = {};
    const put = (path, mark) => {
        if (!path.startsWith(prefix))
            return;
        const own = path.slice(prefix.length).replace(/\/$/, '');
        if (own !== '')
            marks[own] = mark;
    };
    for (let i = 0; i < parts.length; i++) {
        const entry = parts[i] ?? '';
        // `--branch` puts the branch first, as `## main...origin/main`.
        if (entry.length < 4 || entry.startsWith('## '))
            continue;
        const xy = entry.slice(0, 2);
        const isRename = xy[0] === 'R' || xy[0] === 'C';
        const from = isRename ? parts[++i] : undefined;
        const mark = markOf(xy);
        if (mark !== undefined)
            put(entry.slice(3), mark);
        if (xy[0] === 'R' && from !== undefined)
            put(from, 'D');
    }
    return marks;
};
/** Each folder that holds a marked file, at any depth, with its strongest mark. */
export const dotsOf = (marks) => {
    const dots = {};
    for (const [path, mark] of Object.entries(marks)) {
        for (let folder = folderOf(path); folder !== ''; folder = folderOf(folder)) {
            const held = dots[folder];
            if (held === undefined || RANK[mark] > RANK[held])
                dots[folder] = mark;
        }
    }
    return dots;
};
const byName = (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
/** A folder's entries as the tree shows them: `.git` out, folders first, each group by name. */
export const sortedOf = (entries) => {
    const shown = entries.filter(entry => entry.name !== HIDDEN);
    return [...shown.filter(entry => entry.isDir).sort(byName), ...shown.filter(entry => !entry.isDir).sort(byName)];
};
/**
 * A folder's entries with what was deleted since the last commit put back where it was: a
 * deleted file, or the folder that held it when that folder is gone too.
 */
export const withDeleted = (folder, entries, marks) => {
    const names = new Set(entries.map(entry => entry.name));
    const extra = [];
    const prefix = folder === '' ? '' : `${folder}/`;
    for (const [path, mark] of Object.entries(marks)) {
        if (mark !== 'D' || !path.startsWith(prefix))
            continue;
        const rest = path.slice(prefix.length);
        const cut = rest.indexOf('/');
        const name = cut < 0 ? rest : rest.slice(0, cut);
        if (names.has(name))
            continue;
        names.add(name);
        extra.push({ name, isDir: cut >= 0, size: 0, mtimeMs: 0 });
    }
    return sortedOf([...entries, ...extra]);
};
/** The tree's rows: each open folder's entries under it, as far as they have been read. */
export const rowsOf = (listings, open, marks) => {
    const isOpen = new Set(open);
    const dots = dotsOf(marks);
    const rows = [];
    const walk = (folder, depth) => {
        const listing = listings[folder];
        if (listing === undefined)
            return;
        if (listing.kind === 'error') {
            rows.push({ kind: 'error', path: folder, depth, message: listing.message });
            return;
        }
        for (const entry of withDeleted(folder, listing.entries, marks)) {
            const path = join(folder, entry.name);
            const isDeleted = marks[path] === 'D' && !listing.entries.some(own => own.name === entry.name);
            const mark = entry.isDir ? dots[path] : marks[path];
            const opened = entry.isDir && isOpen.has(path);
            rows.push({
                kind: 'entry',
                path,
                name: entry.name,
                depth,
                isDir: entry.isDir,
                isOpen: opened,
                ...(mark === undefined ? {} : { mark }),
                isDeleted,
                size: entry.size,
                mtimeMs: entry.mtimeMs,
            });
            if (opened)
                walk(path, depth + 1);
        }
    };
    walk('', 0);
    return rows;
};
/**
 * Which tree rows show in `rows` rows: from `top` once the person scrolled, else with the chosen
 * row in view and two rows above it. When rows are left out, the first and last shown give
 * their place to `↑ n` and `↓ n`, which count the rows they stand for.
 */
export const treeWindow = (total, rows, top, chosen) => {
    const lastTop = Math.max(0, total - rows);
    // A chosen row past the first window is shown below two rows of air, clear of both edges.
    const wanted = top ?? (chosen < rows - 1 ? 0 : chosen - 2);
    const from = Math.max(0, Math.min(wanted, lastTop));
    const to = Math.min(total, from + rows);
    const above = from > 0 ? from + 1 : 0;
    const below = to < total ? total - to + 1 : 0;
    return { from, to, lastTop, above, below };
};
/** Tab and the other control characters a `Text` refuses, made visible as spaces or `?`. */
export const printable = (text) => text.replace(/\t/g, '  ').replace(/[\u0000-\u001f\u007f]/g, '?');
/** A text cut to `cells` cells, the cut marked with `…`. */
export const fit = (text, cells) => text.length <= cells ? text : `${text.slice(0, Math.max(0, cells - 1))}…`;
/** Text with a NUL in it is binary: no text file holds one. */
export const isBinaryText = (text) => text.includes('\0');
/**
 * A text file's lines as the viewer keeps them: at most `MAX_LINES` and `MAX_CHARS`, control
 * characters but tab made `?`, which `Code` would refuse; and how many lines the file has.
 */
export const contentOf = (text) => {
    const all = text.replace(/\r\n?/g, '\n').split('\n');
    if (all[all.length - 1] === '')
        all.pop();
    const kept = [];
    let size = 0;
    for (const line of all) {
        if (kept.length === MAX_LINES || size + line.length + 1 > MAX_CHARS)
            break;
        kept.push(line.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '?'));
        size += line.length + 1;
    }
    return { lines: kept, total: all.length };
};
/**
 * The lines a window of `rows` rows shows from line `top` at `columns` cells, a long line
 * taking as many rows as it wraps to under the gutter of line numbers, or one row when
 * `wraps` is off and it is cut at the edge; clamped so the window never runs past the end.
 */
export const textWindow = (lines, top, rows, columns, wraps = true) => {
    const room = Math.max(8, columns - String(lines.length).length - 1);
    const size = (line) => (wraps ? Math.max(1, Math.ceil(line.replace(/\t/g, '    ').length / room)) : 1);
    let last = lines.length;
    for (let used = 0; last > 0 && used + size(lines[last - 1]) <= rows; last--)
        used += size(lines[last - 1]);
    const first = Math.max(0, Math.min(Number.isFinite(top) ? Math.floor(top) : 0, last));
    let count = 0;
    for (let used = 0; first + count < lines.length && used + size(lines[first + count]) <= rows; count++) {
        used += size(lines[first + count]);
    }
    const shown = Math.max(count, Math.min(1, lines.length - first));
    return { first, count: shown, lastTop: last, total: lines.length };
};
