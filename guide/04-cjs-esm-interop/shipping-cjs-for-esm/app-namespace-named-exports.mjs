// The detected named exports on the `module.exports` object are properties on the
// module namespace object, while the `module.exports` object is in
// a property named `default`.
import * as namespace from 'my-logger-module-exports-assignment';
const { Logger, LoggerAlias } = namespace;
const { default: defaultLogger } = namespace;

defaultLogger.log('Hello from namespace with named exports');

const logger = new Logger('info');
logger.log('Hello from namespace Logger');
