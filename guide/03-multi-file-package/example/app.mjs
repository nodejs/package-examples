import { Logger } from 'my-logger';
const logger = new Logger('debug');
logger.error('This is an error message');

try {
  // This will throw ERR_PACKAGE_PATH_NOT_EXPORTED
  await import('my-logger/lib/utils.js');
} catch (e) {
  console.error(e.code, e.message);
}
