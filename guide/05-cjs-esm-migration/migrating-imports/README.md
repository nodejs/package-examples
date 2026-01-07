---
description: Guide on migrating imports from CommonJS to ESM.
---

# Migrating imports from CommonJS to ESM

Migrating a CommonJS module that load other modules usually involves replacing `require()` with `import` statements, though occasionally other approaches may be needed. This chapter covers the common scenarios and how to handle them.

Examples in this chapter can be found [here](https://github.com/nodejs/package-examples/blob/main/guide/05-cjs-esm-migration/migrating-imports/).

## Migrating `require()` to static `import`

In most CommonJS modules, `require()` are done at the top-level without being guarded behind conditions. These calls can be replaced with static `import` statements, which enables better static analysis and optimization.

### Importing the entire module exports

If the original CommonJS module uses the entire exports object of the dependency, it's common to replace that with the `import defaultExport from 'module'` syntax. For example:

```js
// before/node_modules/my-module/index.js
const fs = require('fs');  // default export of Node.js built-in module
const pkg = require('pkg');  // default export of a third-party package
```

can be converted to:

```js
// after/node_modules/my-module/index.js
import fs from 'node:fs';  // default export of Node.js built-in module
import pkg from 'pkg';  // default export of a third-party package
```

### Importing specific named exports

If the original CommonJS module destructs from the result returned by  `require()`, it's typical to migrate to `import { namedExport } from 'module'`. This helps with tree-shaking during bundling and allows Node.js to check for missing exports statically. For example:
```js
// before/node_modules/my-module/index.js
const { join } = require('path');  // Named export of Node.js built-in module
const { foo } = require('pkg');  // Named export of a third-party package
```

```js
// after/node_modules/my-module/index.js
import { join } from 'node:path';  // Named export of Node.js built-in module
import { foo } from 'pkg';  // Named export of a third-party package
```

When the provider is CommonJS, its exports can only be imported by name if the names are detectable for ESM imports. See the [CommonJS interoperability guide](../../04-cjs-esm-interop/shipping-cjs-for-esm/README.md#named-imports-from-commonjs-in-esm) for details. If the names are not exported in a detectable way, a typical workaround is to import the default export first, then destructure from it:

```js
// before/node_modules/my-module/index.js
// ✅ In CommonJS, this works, because the destructuring happens at run time.
const { bar } = require('cjs-pkg-with-undetectable-name');
```

```js
// after/node_modules/my-module/import-undetectable-invalid.js
// ⛔ In ESM, this throws a SyntaxError, because named import validation happens
// at module linking time and needs to be static.
import { bar } from 'cjs-pkg-with-undetectable-name';
```

```js
// after/node_modules/my-module/index.js
// ✅ To work around undetectable names from CJS, destructure
// from the default export, which is the `module.exports` object of the CommonJS module.
// CommonJS modules always have a default export, so this always works.
import cjsPkg from 'cjs-pkg-with-undetectable-name';
const { bar } = cjsPkg;  // The destructuring happens at run time again.
```

## Include file extensions in import paths

A CommonJS module may use `require()` to load from a path while omitting the file extension - in that case Node.js [would try to append different supported extensions to the path](https://nodejs.org/api/modules.html#file-modules) and load the first one that exists on the file system. For example:

```js
// before/node_modules/my-module/load-without-extension.js
const lib = require('./lib');  // If lib.js exists in the same directory, it will load ./lib.js
```

`import` in Node.js, however, [does not support extension probing](https://nodejs.org/api/esm.html#mandatory-file-extensions). In this case, the extension of a path must be fully specified during migration:

```js
// after/node_modules/my-module/load-without-extension.js
// ⛔ Throws ERR_MODULE_NOT_FOUND because it only attempts to load a file with the exact name './lib'
import lib from './lib';
```

```js
// after/node_modules/my-module/index.js
// ✅ It would only work with a proper path specifying the extension
import lib from './lib.js';
```

## Directory imports are not supported

A CommonJS module may use `require()` to load from a directory - in that case, Node.js would also [probe at different locations](https://nodejs.org/api/modules.html#folders-as-modules) to find the target module. For example:

```js
// before/node_modules/my-module/index.js
const utils = require('./utils-dir'); // If utils-dir/index.js exists, it will load ./utils-dir/index.js
```

Similar to the extensionless case, `import` in Node.js does not support loading from directories either. The full path must also be explicitly specified during migration:

```js
// after/node_modules/my-module/import-dir.js
// ⛔ Throws ERR_UNSUPPORTED_DIR_IMPORT because import does not support loading directories
import utils from './utils-dir';
```

```js
// after/node_modules/my-module/index.js
// ✅ It would only work with a proper path extended into the filename
import utils from './utils-dir/index.js'
```

## Migrating from dynamic `require()`

Sometimes, a module may have to load its dependencies conditionally or on-demand, then it needs something more flexible than the static `import` syntax. There are a few different options.

### If the dependency is a Node.js built‑in and must be loaded synchronously

In this case, consider using `process.getBuiltinModule()` (available from Node.js v20.16.0+ / v22.3.0+). This is particularly handy if the module may be used in environments other than Node.js and it does not need to support older, end-of-life Node.js versions. For example:

```js
// before/node_modules/my-module/kernel-info.js
const isRunningAsCommonJSInNode =
  (typeof module === 'object' && module.exports && typeof require === 'function');

function getKernelInfo() { // A synchronous API that has to remain synchronous
  if (isRunningAsCommonJSInNode) {
    // Running on Node.js as CommonJS, load the 'os' built-in via require().
    const os = require('os');
    return os.version();
  } else {
    return 'unknown';
  }
}

if (isRunningAsCommonJSInNode) {
  module.exports = { getKernelInfo };
} else {
  // Other ways to export in non-CommonJS environments
}
```

Can be migrated to ESM like this:

```js
// after/node_modules/my-module/kernel-info.js
const isRunningOnNode = typeof process?.getBuiltinModule === 'function';
function getKernelInfo() {  // A synchronous API that has to remain synchronous
  if (isRunningOnNode) {
    // Running on Node.js as ESM, load the 'os' built-in via getBuiltinModule().
    const os = process.getBuiltinModule('os');
    return os.version();
  } else {
    return 'unknown';
  }
}
export { getKernelInfo };
```

### If the dependency is not a built‑in and must be loaded synchronously

In this case, a ESM module can still create a `require()` function using the `module.createRequire()` built-in. For example this:

```js
// before/node_modules/my-module/initialize-plugin-sync.js
function initializePluginsSync(plugins) {  // Synchronous API that must remain synchronous.
  const results = [];
  for (const pluginName of plugins) {  //
    const plugin = require(`./sync-plugins/${pluginName}.js`);  // dynamic require()
    results.push(plugin.initialize());  // The plugin initialize() is synchronous
  }
  return results;
}
module.exports = { initializePluginsSync };
```

can be migrated to ESM like this:

```js
// after/node_modules/my-module/initialize-plugin-sync.js
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

function initializePluginsSync(plugins) {  // Synchronous API that must remain synchronous.
  const results = [];
  for (const pluginName of plugins) {  //
    const plugin = require(`./sync-plugins/${pluginName}.js`);  // dynamic require()
    results.push(plugin.initialize());  // The plugin initialize() is synchronous
  }
  return results;
}
export { initializePluginsSync };
```

### If the dependency is not a built‑in and can be loaded asynchronously

If it is acceptable to perform the dynamic loading asynchronously, the [dynamic `import()` expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) can be used. For example, if the CommonJS module previously looked like this:

```js
// before/node_modules/my-module/initialize-plugin-async.js
async function initializePlugins(plugins) {  // Async API that can be async.
  const results = [];
  for (const pluginName of plugins) {
    const plugin = require(`./async-plugins/${pluginName}.js`);  // dynamic require()
    results.push(await plugin.initialize());  // The plugin initialize() is already asynchronous
  }
  return results;
}
module.exports = { initializePlugins };
```

It can be migrated to ESM like this:

```js
// after/node_modules/my-module/initialize-plugin-async.js
async function initializePlugins(plugins) {  // Async API that can be async.
  const results = [];
  for (const pluginName of plugins) {
    const plugin = await import(`./async-plugins/${pluginName}.js`);  // require() -> await import()
    results.push(await plugin.initialize());  // The plugin initialize() is already asynchronous
  }
  return results;
}
export { initializePlugins };
```
