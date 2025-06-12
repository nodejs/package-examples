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

CommonJS is the original module system in Node.js, available since 2009, which uses `require` to import modules and `module.exports` to export them. It is synchronous and designed for server-side applications.

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

## What is an ECMAScript module

ECMAScript modules (ESM) are the standardized module system in JavaScript, introduced in ES2015. They use `import` and `export` statements, and are designed to work in all JavaScript environments, including browsers and Node.js.

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

## What's next?

Now that we know what these files should look like, let's look at how we can structure these files into a package.
