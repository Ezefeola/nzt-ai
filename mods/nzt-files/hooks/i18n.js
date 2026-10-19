/** The mod's `language` option; anything else, unset included, is the default. */
export const langOf = (value) => (value === 'en' ? 'en' : 'es');
/** A size in bytes as a person reads it, with the language's decimal mark. */
const sizeIn = (decimal) => (bytes) => {
    if (bytes < 1024)
        return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024)
        return `${Math.round(kb)} KB`;
    return `${(kb / 1024).toFixed(1).replace('.', decimal)} MB`;
};
const thousands = (sep) => (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, sep);
const es = thousands('.');
const en = thousands(',');
const MINUTE = 60000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
/** A day as the language writes it short, with the year only when it is not this one. */
const dayIn = (months, order) => (ms, now) => {
    const when = new Date(ms);
    const day = when.getDate();
    const month = months[when.getMonth()];
    const year = when.getFullYear() === new Date(now).getFullYear() ? '' : ` ${when.getFullYear()}`;
    return (order === 'day-month' ? `${day} ${month}` : `${month} ${day}`) + year;
};
/** How long ago, in its largest unit; past a week, the day. */
const ageIn = (justNow, day) => (ms, now) => {
    const ago = Math.max(0, now - ms);
    if (ago < MINUTE)
        return justNow;
    if (ago < HOUR)
        return `${Math.floor(ago / MINUTE)}m`;
    if (ago < DAY)
        return `${Math.floor(ago / HOUR)}h`;
    if (ago < 7 * DAY)
        return `${Math.floor(ago / DAY)}d`;
    return day(ms, now);
};
const dayEs = dayIn(['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'], 'day-month');
const dayEn = dayIn(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], 'month-day');
export const TEXTS = {
    es: {
        title: 'Archivos',
        commandDescription: 'Abre o cierra el explorador del proyecto: carpetas, marcas de git y el archivo elegido',
        paneOpened: 'Explorador abierto.',
        paneClosed: 'Explorador cerrado.',
        paneWaiting: (reason) => `El explorador está esperando: ${reason}`,
        paneInlineNoFullscreen: 'Explorador abierto sobre el prompt: Claude Code lo pone al costado de la conversación solo en pantalla completa.',
        paneInlineNarrow: (columns, floor) => `Explorador abierto sobre el prompt: la terminal tiene ${columns} columnas y al costado hacen falta ${floor}.`,
        changed: (n) => `${n} ${n === 1 ? 'cambiado' : 'cambiados'}`,
        noGit: 'sin git',
        close: 'Cerrar',
        pick: 'Elegí un archivo del árbol.',
        reading: 'Leyendo el proyecto…',
        loading: 'Leyendo el archivo…',
        marks: { M: 'M modificado', U: 'U nuevo', A: 'A nuevo', D: 'D borrado' },
        image: (format) => `imagen ${format}`,
        text: 'texto',
        size: sizeIn(','),
        lineCount: (n) => `${es(n)} ${n === 1 ? 'línea' : 'líneas'}`,
        shownOf: (n) => ` · se ven ${es(n)}`,
        lines: (from, to, total, isCut) => `líneas ${es(from)}–${es(to)} de ${es(total)}${isCut ? ' · sigue' : ''}`,
        allLines: (total) => `${es(total)} ${total === 1 ? 'línea' : 'líneas'}`,
        empty: 'El archivo está vacío.',
        binary: 'Archivo binario: no se muestra su contenido.',
        tooBig: 'Es más grande de lo que Claude Code deja leer a un mod (4 MiB).',
        deleted: 'Se borró desde el último commit.',
        deletedHint: 'Su diff está en /nzt-changes.',
        gone: 'Este archivo ya no existe.',
        unreadable: 'No se pudo leer el archivo.',
        folderUnreadable: (message) => `no se pudo leer: ${message}`,
        above: (n) => `↑ ${n} más`,
        below: (n) => `↓ ${n} más`,
        search: 'Buscar (s)',
        noMatch: (query) => `Nada con «${query}»`,
        markdown: 'Markdown',
        wrap: 'Ajustar',
        expand: 'Ampliar',
        back: '← Árbol',
        copy: 'Copiar ruta',
        open: 'Abrir ↗',
        copied: (path) => `Ruta copiada: ${path}`,
        copyFailed: 'No se pudo copiar la ruta.',
        openFailed: (reason) => `No se pudo abrir: ${reason}`,
        noApp: 'no hay una app para este tipo de archivo',
        markdownHuge: 'Se ve como fuente: un bloque es más grande de lo que Claude Code dibuja de una vez.',
        blockLines: (from, to, total) => `líneas ${es(from)}–${es(to)} de ${es(total)} · de a bloque`,
        gitRunning: (op) => `haciendo ${op}…`,
        gitDone: (op) => `${op} hecho`,
        gitFailed: (op) => `${op} falló`,
        gitOps: { pr: 'pull request' },
        noGitHint: 'Las marcas de git aparecen después de git init.',
        age: ageIn('ahora', dayEs),
        day: dayEs,
    },
    en: {
        title: 'Files',
        commandDescription: "Opens or closes the project's explorer: folders, git marks and the chosen file",
        paneOpened: 'Explorer opened.',
        paneClosed: 'Explorer closed.',
        paneWaiting: (reason) => `The explorer is waiting: ${reason}`,
        paneInlineNoFullscreen: 'Explorer opened above the prompt: Claude Code docks it beside the conversation only in fullscreen.',
        paneInlineNarrow: (columns, floor) => `Explorer opened above the prompt: the terminal has ${columns} columns and docking needs ${floor}.`,
        changed: (n) => `${n} changed`,
        noGit: 'no git',
        close: 'Close',
        pick: 'Pick a file from the tree.',
        reading: 'Reading the project…',
        loading: 'Reading the file…',
        marks: { M: 'M modified', U: 'U untracked', A: 'A added', D: 'D deleted' },
        image: (format) => `${format} image`,
        text: 'text',
        size: sizeIn('.'),
        lineCount: (n) => `${en(n)} ${n === 1 ? 'line' : 'lines'}`,
        shownOf: (n) => ` · ${en(n)} shown`,
        lines: (from, to, total, isCut) => `lines ${en(from)}–${en(to)} of ${en(total)}${isCut ? ' · more' : ''}`,
        allLines: (total) => `${en(total)} ${total === 1 ? 'line' : 'lines'}`,
        empty: 'The file is empty.',
        binary: 'Binary file: its content is not shown.',
        tooBig: 'It is larger than Claude Code lets a mod read (4 MiB).',
        deleted: 'Deleted since the last commit.',
        deletedHint: 'Its diff is in /nzt-changes.',
        gone: 'This file no longer exists.',
        unreadable: 'The file could not be read.',
        folderUnreadable: (message) => `could not be read: ${message}`,
        above: (n) => `↑ ${n} more`,
        below: (n) => `↓ ${n} more`,
        search: 'Search (s)',
        noMatch: (query) => `Nothing with “${query}”`,
        markdown: 'Markdown',
        wrap: 'Wrap',
        expand: 'Expand',
        back: '← Tree',
        copy: 'Copy path',
        open: 'Open ↗',
        copied: (path) => `Path copied: ${path}`,
        copyFailed: 'The path could not be copied.',
        openFailed: (reason) => `Could not open: ${reason}`,
        noApp: 'no app is set for this kind of file',
        markdownHuge: 'Shown as source: a block is larger than Claude Code draws at once.',
        blockLines: (from, to, total) => `lines ${en(from)}–${en(to)} of ${en(total)} · by block`,
        gitRunning: (op) => `running ${op}…`,
        gitDone: (op) => `${op} done`,
        gitFailed: (op) => `${op} failed`,
        gitOps: { pr: 'pull request' },
        noGitHint: 'Git marks show after git init.',
        age: ageIn('now', dayEn),
        day: dayEn,
    },
};
