---
description: Guide on shipping CommonJS for ESM consumers
---

# Shipping CommonJS for ESM consumers

In Node.js, a CommonJS module can be consumed by ESM using either static `import` or dynamic `import()`. In this chapter, we will explore how it works and the caveats involved due to semantic differences between the two module systems.

Examples in this chapter can be found [here](https://github.com/nodejs/package-examples/blob/main/guide/04-cjs-esm-interop/shipping-cjs-for-esm/).

## How CommonJS exports map to ESM

When a CommonJS module is imported into an ESM module, its entire `module.exports` object is treated as the `default` export.

For example, consider a CommonJS package named `my-logger` that exports a `Logger` class:

`node_modules/my-logger/index.js`:

[import:'logger_start,logger_end'](node_modules/my-logger/index.js)

The `module.exports` object is returned to a CommonJS consumer using `require()`:

`app.cjs`:

[import:'doc'](app.cjs)

And to an ESM consumer using the [default import syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#default_import):

`app-default-export.mjs`:

[import:'doc'](app-default-export.mjs)

### Dynamic `import()` and namespace import

Unlike `require()`, which returns the `module.exports` object directly, the ECMAScript specification requires that a [dynamic `import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) returns a [module namespace object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import#module_namespace_object), not an arbitrary object from the module.

Node.js maps `module.exports` to the ESM `default` export. With dynamic `import()`, `module.exports` is available as the `default` property on the namespace object:

`app-dynamic-import.mjs`:

[import:'doc'](app-dynamic-import.mjs)

The same applies to the [namespace import syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#namespace_import):

`app-namespace-import.mjs`:

[import:'doc'](app-namespace-import.mjs)

## Named imports from CommonJS in ESM

In Node.js, a CommonJS module's exports can also be imported by name in ESM, if they can be statically detected.

The ESM specification requires named imports to be checked. If a module imports an export by name from another module, but the providing module does not export that name, an error must be thrown before the code is executed.

`app-import-non-existent-name.mjs`:

[import](app-import-non-existent-name.mjs)

Node.js statically analyzes CommonJS to detect export names. Because CommonJS exports can be dynamic, detection only works for common, static patterns.

For example, assignments to `exports` with static names can be detected:

`node_modules/my-logger-exports-assignment/index.js`:

[import:'logger_start,logger_end'](node_modules/my-logger-exports-assignment/index.js)

An ESM consumer can load these exports by name:

`app-import-exports-assignment.mjs`:

[import:'doc'](app-import-exports-assignment.mjs)

Assignment to `module.exports` followed by adding properties to it can also be detected:

`node_modules/my-logger-module-exports-assignment/index.js`:

[import:'logger_start,logger_end'](node_modules/my-logger-module-exports-assignment/index.js)

An ESM consumer can load these exports by name:

`app-import-module-exports-assignment.mjs`:

[import:'doc'](app-import-module-exports-assignment.mjs)

Or destructure after using namespace import:

`app-namespace-named-exports.mjs`:

[import:'doc'](app-namespace-named-exports.mjs)

Or with dynamic `import()`:

`app-dynamic-named-exports.mjs`:

[import:'doc'](app-dynamic-named-exports.mjs)

Reassigned `module.exports` can be trickier. If reassigned to an object literal, its static properties are still available as named exports:

`node_modules/my-logger-object-literal/index.js`:

[import:'logger_start,logger_end'](node_modules/my-logger-object-literal/index.js)

Dynamic naming defeats static detection. For example:

`node_modules/my-logger-dynamic/index.js`:

[import:'logger_start,logger_end'](node_modules/my-logger-dynamic/index.js)

These cannot be imported by name in ESM. For example:

`app-dynamic-fail.mjs`:

[import:'doc'](app-dynamic-fail.mjs)

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
