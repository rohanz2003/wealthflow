const LOG_ENABLED = process.env.NODE_ENV !== 'production' || process.env.LOG_LEVEL === 'debug';

const logger = {
  info: (...args) => { console.log('[INFO]', ...args); },
  warn: (...args) => { console.warn('[WARN]', ...args); },
  error: (...args) => { console.error('[ERROR]', ...args); },
  debug: (...args) => { if (LOG_ENABLED) console.log('[DEBUG]', ...args); },
};

module.exports = logger;
