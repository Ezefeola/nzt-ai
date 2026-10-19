/** The most characters the engine's `Markdown` draws in one drawing. */
export const MARKDOWN_LIMIT = 100000;
const FENCE = /^\s{0,3}(`{3,}|~{3,})/;
export const isMarkdownFile = (path) => /\.(md|markdown|mdx)$/i.test(path);
/**
 * A Markdown file's lines cut into the blocks it draws as: a fenced block whole, blank lines
 * within it included; a heading by itself; any other run of lines that are not blank, one
 * block. `from` and `to` are line indexes, `to` past the last.
 */
export const blocksOf = (lines) => {
    const blocks = [];
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        if (line.trim() === '') {
            i++;
            continue;
        }
        const from = i;
        const fence = FENCE.exec(line);
        if (fence !== null) {
            const mark = fence[1];
            i++;
            while (i < lines.length && !lines[i].trimStart().startsWith(mark))
                i++;
            i = Math.min(lines.length, i + 1);
        }
        else if (/^\s{0,3}#{1,6}\s/.test(line)) {
            i++;
        }
        else {
            while (i < lines.length && lines[i].trim() !== '' && !FENCE.test(lines[i]) && !/^\s{0,3}#{1,6}\s/.test(lines[i]))
                i++;
        }
        blocks.push({ from, to: i, text: lines.slice(from, i).join('\n') });
    }
    return blocks;
};
/**
 * The rows a block takes once drawn, as near as can be told without drawing it: its lines
 * wrapped at `columns`, a table's border rows, and the blank row after it.
 */
export const rowsOfBlock = (block, columns) => {
    const lines = block.text.split('\n');
    const wrapped = lines.reduce((rows, line) => rows + Math.max(1, Math.ceil(line.length / Math.max(8, columns))), 0);
    const isTable = lines.length > 1 && lines.every(line => line.trimStart().startsWith('|'));
    return wrapped + (isTable ? 2 : 0) + 1;
};
/**
 * The blocks a window of `rows` rows shows from block `top`, whole blocks only, so a table or
 * a code block is never seen cut from above; at least one, which the window clips from below
 * when it is taller than all of it. Clamped so the window never runs past the end.
 */
export const blockWindow = (blocks, top, rows, columns) => {
    const size = blocks.map(block => rowsOfBlock(block, columns));
    let lastTop = blocks.length;
    for (let used = 0; lastTop > 0 && used + size[lastTop - 1] <= rows; lastTop--)
        used += size[lastTop - 1];
    lastTop = Math.min(lastTop, Math.max(0, blocks.length - 1));
    const first = Math.max(0, Math.min(Number.isFinite(top) ? Math.floor(top) : 0, lastTop));
    let count = 0;
    for (let used = 0; first + count < blocks.length && used + size[first + count] <= rows; count++) {
        used += size[first + count];
    }
    return { first, count: Math.max(count, Math.min(1, blocks.length - first)), lastTop };
};
/** Whether some block is larger than the engine draws at once, so the file shows as source. */
export const hasHugeBlock = (blocks) => blocks.some(block => block.text.length > MARKDOWN_LIMIT);
