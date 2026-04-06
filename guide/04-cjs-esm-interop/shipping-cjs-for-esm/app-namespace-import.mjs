
//! [doc]
import * as namespace from 'my-logger';
// The `module.exports` object is only accessible via the `default` property.
const { default: defaultLogger } = namespace;
//! [doc]
defaultLogger.log('Hello from namespace import');
