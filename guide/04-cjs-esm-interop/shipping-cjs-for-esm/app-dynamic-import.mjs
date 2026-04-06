
//! [doc]
// When dynamic `import()` is used, get the default export from the `default` property.
// By contrast, `require('my-logger')` returns `module.exports` directly.
const { default: defaultLogger } = await import('my-logger');
//! [doc]
defaultLogger.log('Hello from dynamic import');
