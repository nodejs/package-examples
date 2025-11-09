// Using the .js suffix for cross-environment support.
let logger;
// Suppose this function has to be synchronous for some reason.
function logError(msg) {
  // If loaded as CJS by Node.js versions where require(esm) is supported, enhance it.
  if (globalThis?.process?.features?.require_module) {
    logger ??= new (require('my-logger').Logger)('error');
    logger.log(msg);
  } else {
    // In older Node.js versions, or in other environments like browsers,
    // fall back to something less fancy.
    console.error(msg);
  }
}

logError('An error occurred');
