import { folderOf } from './tree';
/**
 * The branch from the first entry `git status --porcelain=v1 -z --branch` gives:
 * `## main...origin/main [ahead 2, behind 1]`, `## main` with no remote one, `## HEAD (no
 * branch)` on a loose commit (its id is asked apart), `## No commits yet on main`.
 */
export const branchOf = (out) => {
    const line = out.split('\0')[0] ?? '';
    if (!line.startsWith('## '))
        return undefined;
    const rest = line.slice(3);
    if (rest.startsWith('HEAD (no branch)'))
        return 'detached';
    const unborn = /^(?:No commits yet on|Initial commit on) (.+)$/.exec(rest);
    if (unborn !== null)
        return { kind: 'branch', name: unborn[1], ahead: 0, behind: 0 };
    const found = /^(.+?)(?:\.\.\.(\S+))?(?: \[(.+)\])?$/.exec(rest);
    if (found === null)
        return undefined;
    const counts = found[3] ?? '';
    const ahead = /ahead (\d+)/.exec(counts);
    const behind = /behind (\d+)/.exec(counts);
    return {
        kind: 'branch',
        name: found[1],
        ...(found[2] === undefined ? {} : { upstream: found[2] }),
        ahead: ahead === null ? 0 : Number(ahead[1]),
        behind: behind === null ? 0 : Number(behind[1]),
    };
};
/**
 * The lines each file gained and lost, from `git diff HEAD --numstat -z`, by path from the
 * project's folder (`prefix` as in marksOf). A binary file, which git counts as `-`, is left
 * out; a rename counts on its new path.
 */
export const linesOf = (out, prefix = '') => {
    const parts = out.split('\0');
    const lines = {};
    for (let i = 0; i < parts.length; i++) {
        const found = /^(\d+|-)\t(\d+|-)\t(.*)$/s.exec(parts[i] ?? '');
        if (found === null)
            continue;
        let path = found[3];
        // A rename leaves the path empty and gives the old and the new one next.
        if (path === '') {
            i++;
            path = parts[++i] ?? '';
        }
        if (found[1] === '-' || !path.startsWith(prefix))
            continue;
        lines[path.slice(prefix.length)] = [Number(found[1]), Number(found[2])];
    }
    return lines;
};
/** How many files of each mark every folder holds, at any depth. */
export const countsOf = (marks) => {
    const counts = {};
    for (const [path, mark] of Object.entries(marks)) {
        for (let folder = folderOf(path); folder !== ''; folder = folderOf(folder)) {
            const own = (counts[folder] ??= {});
            own[mark] = (own[mark] ?? 0) + 1;
        }
    }
    return counts;
};
/** The order a folder's counts are written in, as the explorer of VS Code reads them. */
export const COUNT_ORDER = ['U', 'A', 'M', 'D'];
/** The git and GitHub operations the last row of the pane follows. */
const OPS = new Set(['commit', 'push', 'pull', 'fetch', 'checkout', 'switch', 'merge', 'rebase', 'stash', 'reset', 'tag']);
/** Options of git that take the next word as their value, so it is not the subcommand. */
const VALUED = new Set(['-C', '-c', '--git-dir', '--work-tree', '--namespace']);
/** A command line cut into the commands it chains: `&&`, `||`, `;`, `|` and new lines. */
export const segmentsOf = (command) => command
    .split(/&&|\|\||[;|\n]/)
    .map(segment => wordsOf(segment.trim()))
    .filter(words => words.length > 0);
/** A command's words, with the quotes around a word taken off. */
export const wordsOf = (segment) => [...segment.matchAll(/"([^"]*)"|'([^']*)'|(\S+)/g)].map(found => found[1] ?? found[2] ?? found[3]);
/**
 * The git operations a shell command runs, in order, each once: `git commit`, `git -C x push`,
 * `gh pr create` as `pr`. Anything else is not one.
 */
export const gitOpsOf = (command) => {
    const ops = [];
    for (const words of segmentsOf(command)) {
        const tool = (words[0] ?? '').replace(/\.exe$/i, '').toLowerCase();
        let op;
        if (tool === 'git') {
            let i = 1;
            while (i < words.length && words[i].startsWith('-'))
                i += VALUED.has(words[i]) ? 2 : 1;
            const sub = words[i];
            if (sub !== undefined && OPS.has(sub))
                op = sub;
        }
        else if (tool === 'gh' && words[1] === 'pr')
            op = 'pr';
        if (op !== undefined && !ops.includes(op))
            ops.push(op);
    }
    return ops;
};
