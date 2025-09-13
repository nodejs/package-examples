---
description: Introduction to the CommonJS and ECMAScript module systems in Node.js.
---

<!-- The ultimate source of truth should be https://nodejs.org/api/modules.html and https://nodejs.org/api/esm.html. Here we just give a brief overview. -->

# Introduction to the module systems in Node.js

When writing Node.js applications, oftentimes you may find yourself developing utilities or libraries that you want to share with other people, or with other parts of your application.

Suppose we have developed a logging library that we want to share with others.

```js
const LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

class Logger {
  constructor(level = 'info') {
    this.level = LEVELS[level];
  }

  print(level, msg) {
    if (LEVELS[level] > this.level) {
      // If the log level is higher than the current level, do not log
      return;
    }
    const ts = new Date().toISOString();
    console.log(`[${ts}] ${level.toUpperCase()} ${msg}`);
  }

  error(msg) { this.print('error', msg); }
  warn(msg)  { this.print('warn',  msg); }
  info(msg)  { this.print('info',  msg); }
  debug(msg) { this.print('debug', msg); }
}
```

Node.js provides two main module systems to help you organize your code: CommonJS and ECMAScript modules (ESM).

## What is a CommonJS module

CommonJS is the older module system in Node.js, available since 2009, which uses `require` to import modules and `module.exports` to export them. It is synchronous and designed for server-side applications.

> To learn more about CommonJS, check out the [Node.js documentation on modules](https://nodejs.org/api/modules.html#modules-commonjs-modules). This guide only provides a brief overview.

### Basic structure of a CommonJS module

A CommonJS module is simply a JavaScript file that exports functionality using `module.exports`, or the `exports` shorthand when the entire object that will be returned by `require` is not reassigned.

```js
// logger.js
// Following the Logger implementation in the previous section, one way to export the Logger
// class is to add it to `module.exports` or `exports` as a property. By default, `exports`
// is a per-file empty object.
exports.Logger = Logger;
```

```js
// app.js
const { Logger } = require('./logger.js');
const logger = new Logger('debug');
logger.error('This is an error message');
```

We can also reassign `module.exports` to customize what gets returned by `require()` directly.

```js
// logger.js
// Another way to export the Logger class is to reassign `module.exports`
module.exports = Logger;
```

```js
// app.js
const Logger = require('./logger.js');
const logger = new Logger('debug');
logger.error('This is an error message');
```

### Identifying CommonJS modules

In Node.js, a `.js` file is treated as a CommonJS module by default. However, you can explicitly indicate that a file is a CommonJS module by setting the `type` field in the closest `package.json` file to `"commonjs"`.

```json
{
  "type": "commonjs"
}
```

To learn more about the `package.json` file, see [package.json fields](./package-json.md).

When the `type` field is set to `"module"`, Node.js will treat all `.js` files in that package as ECMAScript modules. In that case, you can use the `.cjs` file extension to indicate that a file is a CommonJS module.

## What is an ECMAScript module

ECMAScript modules (ESM) are the standardized module system in JavaScript, introduced in ES2015. They use `import` and `export` statements, and are designed to work in all JavaScript environments, including browsers and Node.js.

> To learn more about ECMAScript modules, check out the [Node.js documentation on ESM](https://nodejs.org/api/esm.html). This guide only provides a brief overview.

### Basic structure of an ECMAScript module

An ECMAScript module is also a JavaScript file, but it uses the `export` syntax to export functionality and `import` to import it.

```js
// logger.js
// Following the Logger implementation in the previous section, to export the Logger class
// individually, we can use the `export` keyword.
export { Logger };
```

```js
// app.js
import { Logger } from './logger.js';
const logger = new Logger('debug');
```

We can also export the Logger class as the default export, which allows us to import it without destructuring.

```js
// logger.js
// To export the Logger class as the default export, we can use the `export default` syntax.
export default Logger;
```

```js
// app.js
import Logger from './logger.js';
const logger = new Logger('debug');
```

### Identifying ECMAScript modules

In Node.js, a `.js` file is treated as an ECMAScript module when the `type` field in the `package.json` file is set to `"module"`. Without it, you can explicitly indicate that a file is an ECMAScript module by using the `.mjs` file extension.

To learn more about the `package.json` file, see [package.json fields](./package-json.md).

## Differences between CommonJS and ESM

The main differences between CommonJS and ESM are:

- **Syntax**: CommonJS uses `require`, `exports` and `module.exports`, while ESM uses `import` and `export`.
- **Top-level await**: In ESM, you can use `await` at the top level, while CommonJS does not support this.
- **Runtime support**: ESM is supported in both Node.js and browsers, while CommonJS is primarily used in Node.js. Though there are also popular tools that support bundling CommonJS modules into a format that can be used in browsers.
- **Dependency evaluation**:
    - In CommonJS, each dependency is resolved, compiled and executed sequentially in the order they are `require`d. If a dependency cannot be resolved, that resolution error would only surface after the previous dependency is already loaded and executed.
    - In ESM, dependencies are resolved and compiled first, and the execution of the code in the dependencies happens after all dependencies are successfully resolved and compiled. If a dependency cannot be resolved, the error will surface before any dependency code is executed.
- **Static analysis**: The ESM syntax allows for better static analysis of dependencies, which can enable better tree-shaking and dead code elimination in tools. Some tools support static analysis for CommonJS too, but it's less accurate due to the dynamic nature of `require()` calls.

Contrary to popular belief, ESM does not have to be asynchronously loaded. Since ESM loading is separated into two phases - resolution and execution - Node.js can perform the resolution synchronously. The execution is only asynchronous when the module has top-level `await` expressions.

In Node.js, ESM and CommonJS can load each other. See [Chapter 4: CommonJS and ESM interoperability](../04-cjs-esm-interop/).

Nowadays, CommonJS is still present in many older code bases. When you are publishing code from an older code base, or maintaining a library that has a bit of history, you may still encounter this format. Nonetheless, it's recommended to use ECMAScript modules (ESM) for new code, as they are the standardized module system in JavaScript and are supported in both Node.js and browsers.

## What's next?

Now that we know what these files should look like, let's look at how we can structure these files into a package.
