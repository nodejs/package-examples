---
description: Guide on how to create multi-file packages in Node.js.
---

# Multi-file package configurations

As packages grow, they usually need to split code across multiple files. This chapter shows how to structure and configure multi-file Node.js packages.

Consider a `my-logger` package that exports a `Logger` class. The package consists of multiple files, including `src/logger.js`, `lib/utils.js`, and `index.js`. In addition, it has tests that should not be included in the published package.

```
my-logger/
├── lib/utils.js
├── src/logger.js
├── test/logger.test.js
├── index.js
└── package.json
```

```js
// lib/utils.js
export const LEVELS = { /* ... log levels ... */ };
```

```js
// src/logger.js
import { LEVELS } from '../lib/utils.js';
export class Logger {
  // ... Logger implementation
};  
```

```js
// index.js
export { Logger } from './src/logger.js';
```

The `package.json` file for this package would typically look like this:

```json
{
  "name": "my-logger",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "test": "node --test"
  },
  "exports": {
    ".": "./index.js",
    "./package.json": "./package.json"
  },
  "files": [
    "lib/",
    "src/",
    "index.js"
  ]
}
```

When this package is published, because `test` is not listed in `files`, this directory will be excluded in the published package. Here we use `npm pack` to verify it (though this convention is generally respected by most package managers):

```
$ cd /path/to/my-logger
$ npm pack
$ tar -tf my-logger-1.0.0.tgz

package/index.js
package/src/logger.js
package/lib/utils.js
package/package.json
```

In addition, when users load this package, they can only access `index.js` and `package.json`, but not the internal files. This allows maintainers to change the internal structure of the package without breaking users who may come to assume the internal files are part of the public API.

```js
// app.mjs
import { Logger } from 'my-logger';
const logger = new Logger('debug');
logger.error('This is an error message');

// This will throw ERR_PACKAGE_PATH_NOT_EXPORTED
await import('my-logger/lib/utils.js');
```

This works similarly for CommonJS consumers (since the package is ESM, they will need to use Node.js 20 or above to load it from `require()`):

```js
// app.cjs
const { Logger } = require('my-logger');
const logger = new Logger('debug');
logger.error('This is an error message');

// This will throw ERR_PACKAGE_PATH_NOT_EXPORTED
require('my-logger/lib/utils.js');
```

You can find an example of this package on [GitHub](https://github.com/nodejs/package-examples/tree/main/guide/03-multi-file-package/example).
