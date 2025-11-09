const namespace = await import('my-logger-module-exports-assignment');
const { Logger, LoggerAlias } = namespace;
const { default: defaultLogger } = namespace;

defaultLogger.log('Hello from dynamic import with named exports');

const logger = new Logger('trace');
logger.log('Hello from dynamic Logger');

const aliasLogger = new LoggerAlias('debug');
aliasLogger.log('Hello from dynamic LoggerAlias');
