import { kindOf } from './kinds';
// Nerd Font code points. A terminal without the font draws them as boxes, and a mod cannot
// ask which font the terminal uses, so `auto` keeps to plain Unicode.
const NERD_FOLDER = { closed: '\u{f07b}', open: '\u{f07c}' };
const NERD_FILE = '\u{f15b}';
const NERD_BY_KIND = {
    TypeScript: '\u{e628}',
    JavaScript: '\u{e74e}',
    JSON: '\u{e60b}',
    Markdown: '\u{e609}',
    'C#': '\u{f031b}',
    HTML: '\u{e736}',
    CSS: '\u{e749}',
    Python: '\u{e73c}',
    Shell: '\u{e795}',
    PowerShell: '\u{e795}',
    SQL: '\u{e706}',
};
const NERD_IMAGE = '\u{f1c5}';
/**
 * The glyph a row starts with: plain Unicode draws a folder's `▸` or `▾` and nothing for a
 * file; Nerd Font adds the folder's or the file type's icon after it.
 */
export const iconOf = (icons, path, isDir, isOpen) => {
    const arrow = isDir ? (isOpen ? '▾ ' : '▸ ') : '  ';
    if (icons !== 'nerd')
        return arrow;
    if (isDir)
        return `${arrow}${isOpen ? NERD_FOLDER.open : NERD_FOLDER.closed} `;
    const kind = kindOf(path);
    const glyph = kind?.kind === 'image' ? NERD_IMAGE : kind?.kind === 'named' ? (NERD_BY_KIND[kind.name] ?? NERD_FILE) : NERD_FILE;
    return `${arrow}${glyph} `;
};
