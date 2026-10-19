const NAMED = {
    md: 'Markdown',
    markdown: 'Markdown',
    json: 'JSON',
    jsonc: 'JSON',
    yml: 'YAML',
    yaml: 'YAML',
    ts: 'TypeScript',
    tsx: 'TypeScript',
    mts: 'TypeScript',
    cts: 'TypeScript',
    js: 'JavaScript',
    jsx: 'JavaScript',
    mjs: 'JavaScript',
    cjs: 'JavaScript',
    cs: 'C#',
    html: 'HTML',
    htm: 'HTML',
    css: 'CSS',
    py: 'Python',
    sh: 'Shell',
    ps1: 'PowerShell',
    xml: 'XML',
    sql: 'SQL',
};
const IMAGES = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'svg']);
export const kindOf = (path) => {
    const name = path.slice(path.lastIndexOf('/') + 1);
    const dot = name.lastIndexOf('.');
    // A name that only starts with a dot (.gitignore) has no extension.
    if (dot <= 0 || dot === name.length - 1)
        return undefined;
    const extension = name.slice(dot + 1).toLowerCase();
    const named = NAMED[extension];
    if (named !== undefined)
        return { kind: 'named', name: named };
    if (IMAGES.has(extension))
        return { kind: 'image', format: extension === 'jpeg' ? 'JPG' : extension.toUpperCase() };
    if (extension === 'txt')
        return { kind: 'text' };
    return { kind: 'named', name: extension.toUpperCase() };
};
/** An image the viewer does not read: its bytes are not text. SVG is text, and is read. */
export const isPictureFile = (path) => {
    const kind = kindOf(path);
    return kind?.kind === 'image' && kind.format !== 'SVG';
};
