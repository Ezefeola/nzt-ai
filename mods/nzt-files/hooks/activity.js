import { segmentsOf } from './git';
/** The most files one search of Claude's paints. */
export const MAX_FOUND = 60;
/** How long a color takes to go out once its tool ended well. */
export const FADE_MS = 3000;
const pathField = (value) => (typeof value === 'string' && value !== '' ? [value] : []);
/** What a tool does to files, by its name and arguments; undefined for one the tree does not follow. */
export const touchOf = (tool, input) => {
    switch (tool) {
        case 'Read':
            return { kind: 'read', paths: pathField(input.file_path) };
        case 'Write':
        case 'Edit':
        case 'MultiEdit':
            return { kind: 'write', paths: pathField(input.file_path) };
        case 'NotebookEdit':
            return { kind: 'write', paths: pathField(input.notebook_path) };
        case 'Grep':
        case 'Glob':
            return { kind: 'search' };
        case 'Bash':
        case 'PowerShell':
            return typeof input.command === 'string' ? { kind: 'shell', command: input.command } : undefined;
        default:
            return undefined;
    }
};
/** The files a search found, as many as the tree paints. */
export const foundOf = (result) => {
    const names = result?.filenames;
    if (!Array.isArray(names))
        return [];
    return names.filter((name) => typeof name === 'string').slice(0, MAX_FOUND);
};
/** Shell commands that only read the files they name, lowercase, without `.exe`. */
const READERS = new Set([
    'cat',
    'head',
    'tail',
    'less',
    'more',
    'grep',
    'egrep',
    'fgrep',
    'rg',
    'wc',
    'file',
    'stat',
    'sort',
    'uniq',
    'cut',
    'diff',
    'type',
    'get-content',
    'gc',
    'select-string',
    'sls',
    'get-item',
    'get-filehash',
    'select-object',
    'measure-object',
    'sort-object',
    'where-object',
    'out-string',
]);
/** Redirections that write nowhere: to the null device or to the other stream. */
const QUIET = /\d?\*?>\s*(?:\/dev\/null|\$null|&\d)/g;
/**
 * The words a shell command that only reads names as files, for the caller to keep those
 * that are files of the project; undefined when some part of it may write, moves elsewhere,
 * or is a command this list does not know, so nothing is guessed.
 */
export const shellReadOf = (command) => {
    const quiet = command.replace(QUIET, ' ');
    if (quiet.includes('>'))
        return undefined;
    const segments = segmentsOf(quiet);
    if (segments.length === 0)
        return undefined;
    const named = [];
    for (const [head, ...rest] of segments) {
        if (!READERS.has(head.toLowerCase().replace(/\.exe$/, '')))
            return undefined;
        for (const word of rest)
            if (!word.startsWith('-') && !named.includes(word))
                named.push(word);
    }
    return named;
};
/** Whether the setting paints this kind of work. */
export const isShown = (shown, kind) => shown !== 'none' && (kind === 'commit' || shown === 'read-write' || shown === kind);
