const { Logger } = require('my-logger-with-default-export');  // [class Logger]
// Logger {} - no need to destruct from `default`
const logger = require('my-logger-with-default-export');

console.log(logger instanceof Logger);  // true
logger.log('Hello from CommonJS with module.exports');
