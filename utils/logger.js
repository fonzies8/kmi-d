const util = require('util');

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const env = process.env.NODE_ENV || 'development';
const defaultLevel = process.env.LOG_LEVEL || (env === 'production' ? 'error' : 'info');
let CURRENT_LEVEL = LEVELS[defaultLevel] !== undefined ? LEVELS[defaultLevel] : LEVELS.debug;

function formatArgs(level, args) {
    const ts = new Date().toISOString();
    const prefix = `[${ts}] [${level.toUpperCase()}]`;
    return [prefix, ...args.map(a => (typeof a === 'object' ? util.inspect(a, { depth: 2 }) : a))];
}

module.exports = {
    setLevel: (level) => {
        if (LEVELS[level] !== undefined) CURRENT_LEVEL = LEVELS[level];
    },
    error: (...args) => {
        if (CURRENT_LEVEL >= LEVELS.error) console.error(...formatArgs('error', args));
    },
    warn: (...args) => {
        if (CURRENT_LEVEL >= LEVELS.warn) console.warn(...formatArgs('warn', args));
    },
    info: (...args) => {
        if (CURRENT_LEVEL >= LEVELS.info) console.log(...formatArgs('info', args));
    },
    debug: (...args) => {
        if (CURRENT_LEVEL >= LEVELS.debug) console.log(...formatArgs('debug', args));
    }
};
