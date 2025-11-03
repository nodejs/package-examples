// The detected properties on the `module.exports` object from the
// CommonJS provider can be imported by name.
import { Logger, LoggerAlias } from 'my-logger-module-exports-assignment';
// The `module.exports` object from the CommonJS provider can be
// imported as if it's the default export.
import defaultLogger from 'my-logger-module-exports-assignment';

defaultLogger.log('Hello from default logger');

const customLogger = new Logger('info');
customLogger.log('Hello from custom Logger');

const aliasLogger = new LoggerAlias('error');
aliasLogger.log('Hello from LoggerAlias');
