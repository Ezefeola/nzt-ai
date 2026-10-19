const oneOf = (value, options, fallback) => options.includes(value) ? value : fallback;
const flag = (value, fallback) => (typeof value === 'boolean' ? value : fallback);
/** The settings from the mod's options; anything missing or unknown is its default. */
export const settingsOf = (options) => ({
    activity: oneOf(options.activity, ['read-write', 'write', 'read', 'none'], 'read-write'),
    follow: flag(options.follow, true),
    openAtStart: flag(options.openAtStart, true),
    column: oneOf(options.column, ['date', 'age', 'size'], 'date'),
    openWith: typeof options.openWith === 'string' ? options.openWith.trim() : '',
    icons: oneOf(options.icons, ['auto', 'nerd', 'unicode'], 'auto'),
    notices: flag(options.notices, true),
});
