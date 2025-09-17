---
description: Creating a single-file CommonJS package in Node.js
---

# Single-file CommonJS package

This is the most traditional way of creating a package in Node.js, using the CommonJS module system. This is less commonly used by new packages these days, but you may still encounter many existing packages using this approach.

In this example, the `my-logger` package consists of a single file, logger.js, that implements and exports the `Logger` class.

```js
// logger.js
class Logger {
  // ... Logger implementation
};
exports.Logger = Logger;
```

The `package.json` file for this package looks like this:

```json
{
  "name": "my-logger",
  "version": "1.0.0",
  "type": "commonjs",
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

1. Set the `"type"` field to `"commonjs"` to explicitly indicate that this package uses the CommonJS module system for `.js` files, even though it is the default.
2. Use the `"exports"` field to define the entry point of the package, even though using `index.js` or pointing the `"main"` field to it may suffice for a single-file package. This helps to avoid potential issues in the future if the package grows into a multi-file structure.

In addition, we have included an export for `./package.json` in the `"exports"` field. This allows users to import the `package.json` file directly from the package, which can be useful for tools like bundlers when they need to access metadata such as the version number.

When users load this package, they can do so like this:

```js
// app.cjs
const { Logger } = require('my-logger');
const logger = new Logger('debug');
logger.error('This is an error message');
```

Or, a ESM consumer can load this package like this:

```js
// app.mjs
import { Logger } = require('my-logger');
const logger = new Logger('debug');
logger.error('This is an error message');
```

Usually, a published package is placed in a `node_modules` directory of a project. When you use `require('my-logger')`, Node.js will start looking for a directory named `my-logger` in the nearest `node_modules` directory up until it reaches the root of the filesystem. You can refer to the [Node.js documentation](https://nodejs.org/api/modules.html#all-together) for more details about the module resolution algorithm.

You can find an example of this package on [GitHub](https://github.com/nodejs/package-examples/tree/main/guide/02-single-file-package/classic-commonjs).
