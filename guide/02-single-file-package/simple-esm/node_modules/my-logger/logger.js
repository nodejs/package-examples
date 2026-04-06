const LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

//! [logger_start]
export class Logger {
  // ... Logger implementation
//! [logger_start]
  constructor(level = 'info') {
    this.level = LEVELS[level];
  }

  print(level, msg) {
    if (LEVELS[level] > this.level) {
      // If the log level is higher than the current level, do not log
      return;
    }
    const ts = new Date().toISOString();
    console.log(`[${ts}] ${level.toUpperCase()} ${msg}`);
  }

  error(msg) { this.print('error', msg); }
  warn(msg)  { this.print('warn',  msg); }
  info(msg)  { this.print('info',  msg); }
  debug(msg) { this.print('debug', msg); }
//! [logger_end]
};
//! [logger_end]
