---
description: Creating a single-file ESM package in Node.js
---

# Single-file ESM package

This is the more modern way of creating a package in Node.js, using the ESM system.

In this example, we have a package named `my-logger` that exports a `Logger` class. The package consists of a single file, `logger.js`, which contains the implementation of the `Logger` class.

```js
// logger.js
export class Logger {
  // ... Logger implementation
};
```

The `package.json` file for this package looks like this:

```json
{
  "name": "my-logger",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    ".": "./logger.js",
    "./package.json": "./package.json"
  }
}
```

So the package structure is as follows:

```
my-logger/
├── logger.js
└── package.json
```

As mentioned in the [previous chapter](../../01-getting-started/package-json.md), it's recommended to:

1. Set the `"type"` field to `"module"` to explicitly indicate that this package uses the ESM module system for `.js` files. It is necessary for single-file packages that do not use the `.mjs` extension.
2. Use the `"exports"` field to define the entry point of the package, even though pointing `"main"` field to it may suffice for a single-file package. This helps to avoid potential issues in the future if the package grows into a multi-file structure.

In addition, we have included an export for `./package.json` in the `"exports"` field. This allows users to import the `package.json` file directly from the package, which can be useful for tools like bundlers when they need to access metadata such as the version number.

When users load this package, they can do so like this:

```js
// app.mjs
import { Logger } from 'my-logger';
const logger = new Logger('debug');
logger.error('This is an error message');
```

Or, from Node.js 20 and above, CommonJS consumers can also load a ESM package like this:

```js
// app.cjs
const { Logger } = require('my-logger');
const logger = new Logger('debug');
logger.error('This is an error message');
```

Usually, a published package is placed in a `node_modules` directory of a project. When you use `import 'my-logger'`, Node.js will start looking for a directory named `my-logger` in the nearest `node_modules` directory up until it reaches the root of the filesystem. The module resolution algorithm for ESM is slightly different from the one used for loading CommonJS modules. You can refer to the [Node.js documentation](https://nodejs.org/api/esm.html#resolution-algorithm-specification) for more details.

You can find an example of this package on [GitHub](https://github.com/nodejs/package-examples/tree/main/guide/02-single-file-package/simple-esm).
