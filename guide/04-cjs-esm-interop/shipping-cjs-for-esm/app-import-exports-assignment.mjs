// The detected properties on the `module.exports` object from the
// CommonJS provider can be imported by name.
import { Logger, LoggerAlias } from 'my-logger-exports-assignment';

const logger = new Logger('info');
logger.log('Hello from Logger');

const aliasLogger = new LoggerAlias('warn');
aliasLogger.log('Hello from LoggerAlias');
