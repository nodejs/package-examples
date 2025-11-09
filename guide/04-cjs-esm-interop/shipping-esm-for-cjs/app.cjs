// The namespace object looks like { Logger: [class Logger], default: Logger {} }
const namespace = require('my-logger');

// The named export `Logger` is available by name on the namespace object.
const { Logger } = namespace;

// The default export logger instance is available as the `default` property.
const { default: logger } = namespace;

console.log(logger instanceof Logger);  // true
logger.log('Hello from CommonJS requiring ESM');
