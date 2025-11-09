// Using dynamic import
const { default: defaultLogger } = await import('my-logger');
defaultLogger.log('Hello from dynamic import');
