---
description: Guide on shipping CommonJS for ESM consumers
---

# Shipping CommonJS for ESM consumers

In Node.js, a CommonJS module can be consumed by ESM using either static `import` or dynamic `import()`. In this chapter, we will explore how it works and the caveats involved due to semantic differences between the two module systems.

Examples in this chapter can be found [here](https://github.com/nodejs/package-examples/blob/main/guide/04-cjs-esm-interop/shipping-cjs-for-esm/).

## How CommonJS exports map to ESM

When a CommonJS module is imported into an ESM module, its entire `module.exports` object is treated as the `default` export.

For example, consider a CommonJS package named `my-logger` that exports a `Logger` class:

```js
// node_modules/my-logger/index.js
class Logger {
  // ... Logger implementation
};
const defaultLogger = new Logger('debug');
// This is equivalent to `export default defaultLogger` in ESM
module.exports = defaultLogger;
```

The `module.exports` object is returned to a CommonJS consumer using `require()`:

```js
// app.cjs
const defaultLogger = require('my-logger');  // Returns the `module.exports` object
```

And to an ESM consumer using the [default import syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#default_import):

```js
// app-default-export.mjs
import defaultLogger from 'my-logger';
```

### Dynamic `import()` and namespace import

Unlike `require()`, which returns the `module.exports` object directly, the ECMAScript specification requires that a [dynamic `import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) returns a [module namespace object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import#module_namespace_object), not an arbitrary object from the module.

Node.js maps `module.exports` to the ESM `default` export. With dynamic `import()`, `module.exports` is available as the `default` property on the namespace object:

```js
// app-dynamic-import.mjs
// When dynamic `import()` is used, get the default export from the `default` property.
// By contrast, `require('my-logger')` returns `module.exports` directly.
const { default: defaultLogger } = await import('my-logger');
```

The same applies to the [namespace import syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#namespace_import):

```js
// app-namespace-import.mjs
import * as namespace from 'my-logger';
// The `module.exports` object is only accessible via the `default` property.
const { default: defaultLogger } = namespace;
```

## Named imports from CommonJS in ESM

In Node.js, a CommonJS module's exports can also be imported by name in ESM, if they can be statically detected.

The ESM specification requires named imports to be checked. If a module imports an export by name from another module, but the providing module does not export that name, an error must be thrown before the code is executed.

```js
// app-import-non-existent-name.mjs
// Throws a SyntaxError before any code in my-logger or in this script is executed
import { DoesNotExist } from 'my-logger';
```

Node.js statically analyzes CommonJS to detect export names. Because CommonJS exports can be dynamic, detection only works for common, static patterns.

For example, assignments to `exports` with static names can be detected:

```js
// node_modules/my-logger-exports-assignment/index.js
class Logger {
  // ... Logger implementation
};

// This can be thought of as `export { Logger as Logger }` in ESM
exports.Logger = Logger;
// This can be thought of as `export { Logger as LoggerAlias }` in ESM
exports.LoggerAlias = Logger;
```

An ESM consumer can load these exports by name:

```js
// app-import-exports-assignment.mjs
// The detected properties on the `module.exports` object from the
// CommonJS provider can be imported by name.
import { Logger, LoggerAlias } from 'my-logger-exports-assignment';
```

Assignment to `module.exports` followed by adding properties to it can also be detected:

```js
// node_modules/my-logger-module-exports-assignment/index.js
class Logger {
  // ... Logger implementation
};
const defaultLogger = new Logger('debug');
// This can be thought of as:
// `export { defaultLogger as default, Logger, Logger as LoggerAlias }`
// in ESM.
module.exports = defaultLogger;
module.exports.Logger = Logger;
module.exports.LoggerAlias = Logger;
```

An ESM consumer can load these exports by name:

```js
// app-import-module-exports-assignment.mjs
// The detected properties on the `module.exports` object from the
// CommonJS provider can be imported by name.
import { Logger, LoggerAlias } from 'my-logger-module-exports-assignment';
// The `module.exports` object from the CommonJS provider can be
// imported as if it's the default export.
import defaultLogger from 'my-logger-module-exports-assignment';
```

Or destructure after using namespace import:

```js
// app-namespace-named-exports.mjs
// The detected named exports on the `module.exports` object are properties on the
// module namespace object, while the `module.exports` object is in
// a property named `default`.
import * as namespace from 'my-logger-module-exports-assignment';
const { Logger, LoggerAlias } = namespace;
const { default: defaultLogger } = namespace;
```

Or with dynamic `import()`:

```js
// app-dynamic-named-exports.mjs
const namespace = await import('my-logger-module-exports-assignment');
const { Logger, LoggerAlias } = namespace;
const { default: defaultLogger } = namespace;
```

Reassigned `module.exports` can be trickier. If reassigned to an object literal, its static properties are still available as named exports:

```js
// node_modules/my-logger-object-literal/index.js
class Logger {
  // ... Logger implementation
};
module.exports = {
  Logger,  // This can be detected as a named export
};
```

Dynamic naming defeats static detection. For example:

```js
// node_modules/my-logger-dynamic/index.js
class Logger {
  // ... Logger implementation
};

module['exports'] = { Logger };  // ❌ non-dot access to module.exports

const e = module.exports;
e.Logger = Logger;  // ❌ assignment via an alias

const key = 'Logger';
module.exports[key] = Logger;  // ❌ assignment via a computed property

Object.defineProperty(module.exports, 'Logger', {  // ❌ assignment via a property descriptor
  enumerable: true,
  get: () => Logger,
});
```

These cannot be imported by name in ESM. For example:

```js
// app-dynamic-fail.mjs
import { Logger } from 'my-logger-dynamic';
```

This throws:

```
import { Logger } from 'my-logger-dynamic';
        ^^^^^^
SyntaxError: Named export 'Logger' not found. The requested module './logger.js' is a CommonJS module, which may not support all module.exports as named exports.
CommonJS modules can always be imported via the default export, for example using:

import pkg from 'my-logger-dynamic';
const { Logger } = pkg;
```

Therefore, prefer detectable export patterns when shipping CommonJS for ESM consumers. For a comprehensive list of detectable patterns, see the [cjs-module-lexer documentation](https://github.com/nodejs/cjs-module-lexer/).
