---
description: Guide on shipping ESM for CommonJS consumers
---

# Shipping ESM for CommonJS consumers

Since Node.js v20.19.0/v22.12.0, CommonJS can load ESM via `require()`, as long as the ESM does not use [top-level `await`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await#top_level_await). Similar to [providing CommonJS to ESM consumers](../shipping-cjs-for-esm/README.md), semantic differences between CommonJS and ESM can introduce some caveats when providing ESM to CommonJS consumers. Let's explore how it works in this chapter.

Examples in this chapter can be found [here](https://github.com/nodejs/package-examples/blob/main/guide/04-cjs-esm-interop/shipping-esm-for-cjs/).

## How ESM exports map to `require(esm)`

`require(esm)` mostly mirrors synchronous [dynamic `import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import). By default, it returns the ESM [module namespace object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import#module_namespace_object), which exposes named exports as properties and a `default` property for the default export.

Consider the following ESM provider:

```js
// node_modules/my-logger/index.js
export class Logger {
  // ... Logger implementation
};
const logger = new Logger('debug');
export default logger;
```

Dynamic `import()` returns the module namespace object:

```js
// app.mjs
// The namespace object looks like { Logger: [class Logger], default: Logger {} }
const namespace = await import('my-logger');

// The named export `Logger` is available by name on the namespace object.
const { Logger } = namespace;

// The default export logger instance is available as the `default` property.
const { default: logger } = namespace;

console.log(logger instanceof Logger);  // true
```

Likewise, `require()` returns the module namespace object:

```js
// app.cjs
// The namespace object looks like { Logger: [class Logger], default: Logger {} }
const namespace = require('my-logger');

// The named export `Logger` is available by name on the namespace object.
const { Logger } = namespace;

// The default export logger instance is available as the `default` property.
const { default: logger } = namespace;

console.log(logger instanceof Logger);  // true
```

### Customize `require(esm)` via the `'module.exports'` export

If the ESM has an export named `'module.exports'`, `require(esm)` returns that value instead of the namespace object. This is useful when migrating from CommonJS to ESM while preserving existing CommonJS consumers. See [CommonJS to ESM migration](../../05-cjs-esm-migration/migrating-exports/README.md#migrating-other-moduleexports-reassignments) for more details.

Let's revisit the logger example and add a named export `'module.exports'` for the default logger instance:

```js
// node_modules/my-logger-with-default-export/index.js
export class Logger {
  // ... Logger implementation
};
const logger = new Logger('debug');
export default logger;

// Exposes the Logger class as a destructurable property on the default export.
logger.Logger = Logger;
export { logger as 'module.exports' };
```

ESM consumers will see that the results from static or dynamic import are unchanged, but for CommonJS consumers, `require()` now returns the default `logger` instance, as specified by the `'module.exports'` export:

```js
// app-with-default-export.cjs
const { Logger } = require('my-logger-with-default-export');  // [class Logger]
// Logger {} - no need to destructure from `default`
const logger = require('my-logger-with-default-export');
```

This aligns CommonJS usage with the ESM equivalent:

```js
// app-with-default-export.mjs
import { Logger } from 'my-logger-with-default-export';  // [class Logger]
import logger from 'my-logger-with-default-export';  // Logger {}
```

## Limitations

When shipping ESM for CommonJS via `require(esm)`, note:

1. **Synchronous graph only**: `require(esm)` is synchronous; When the ESM loaded by `require()` or any of its dependencies contain top‑level `await`, an [`ERR_REQUIRE_ASYNC_MODULE`](https://nodejs.org/api/errors.html#err_require_async_module) is thrown.
2. **No ESM↔CJS cycles**: To maintain [ECMAScript invariants](https://tc39.es/ecma262/#sec-innermoduleevaluation), cycles that cross the CommonJS/ESM boundary are unsupported and throw [`ERR_REQUIRE_CYCLE_MODULE`](https://nodejs.org/api/errors.html#err_require_cycle_module).

  ```js
  // cycle-error/a.mjs
  import './b.cjs';
  ```

  ```js
  // cycle-error/b.cjs
  require('./a.mjs');  // Throws ERR_REQUIRE_CYCLE_MODULE
  ```

  A typical workaround would be loading one side lazily (not at module load time).

  ```js
  // cycle-lazy/b.cjs
  let a;
  function runOnlyWhenUsed() {
    a = require('./a.mjs');
  }
  ```

  Only cross‑boundary cycles fail; pure CommonJS or pure ESM cycles still work.

## `require(esm)` feature detection

`require(esm)` is only supported in Node.js v20.19.0/v22.12.0 and above. When it's necessary to support older Node.js versions, there are several ways to detect whether `require(esm)` is supported.

### `process.features.require_module`

In code, use [`process.features.require_module`](https://nodejs.org/api/process.html#processfeaturesrequire_module) to detect support. This helps when an ESM dependency is optional and the consumer code must be synchronous.

```js
// log-with-feature-detection.js
// Using the .js suffix for cross-environment support.
let logger;
// Suppose this function has to be synchronous for some reason.
function logError(msg) {
  // If loaded as CJS by Node.js versions where require(esm) is supported, enhance it.
  if (globalThis?.process?.features?.require_module) {
    logger ??= new (require('my-logger').Logger)('error');
    logger.log(msg);
  } else {
    // In older Node.js versions, or in other environments like browsers,
    // fall back to something less fancy.
    console.error(msg);
  }
}
logError('An error occurred');
```

## Useful `package.json` fields

### `"engines"`

As of May 2025, all active LTS versions of Node.js support `require(esm)`. This includes:

- Node.js v20.x (from v20.19.0)
- Node.js v22.x (from v22.12.0)
- (Node.js 23 also supports it from v23.0.0, though it has already reached end-of-life)
- Node.js v24.x (from v24.0.0)
- And any future Node.js versions

To target only Node.js versions that support `require(esm)`, this version range can be used:

```json
{
  "engines": {
    "node": "^20.19.0 || >=22.12.0"
  }
}
```

### `"module-sync"` in export conditions

**Before you dive into this section**: as of May 2025, all Node.js versions that do not support `require(esm)` have already reached end-of-life. If a package does not want to support these end-of-life versions of Node.js, the `"module-sync"` condition should be irrelevant. Simply pointing the `default` exports condition to the ESM build should be sufficient.

Node.js versions that support `require(esm)` also support the [`"module-sync"` export condition](https://nodejs.org/api/packages.html#conditional-exports). Packages can use it to expose a synchronous entry point, which works for `require(esm)` and ESM on newer Node.js, and fall back via other conditions on older Node.js, where `"module-sync"` is not recognized. For example:

```json
{
  "exports": {
    ".": {
      // Use ESM build for both CommonJS and ESM consumers on newer Node.js versions.
      "module-sync": "./index.js",
      // Falls back to the CommonJS build for older Node.js versions.
      "default": "./dist/index.cjs"
    }
  }
}
```

This can be useful when migrating dual packages to ESM‑only while still supporting older, end‑of‑life Node.js versions that do not support `require(esm)`. See [migrating from dual packaging to ESM-only](../../07-dual-packages/migrating-to-esm-only/README.md) for more details.
