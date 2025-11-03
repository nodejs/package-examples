import { Logger } from 'my-logger-with-default-export';  // [class Logger]
import logger from 'my-logger-with-default-export';  // Logger {}

console.log(logger instanceof Logger);  // true
logger.log('Hello from ESM with module.exports');
