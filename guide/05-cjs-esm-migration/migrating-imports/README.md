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

`before/node_modules/my-module/index.js`:

[import:'default_import'](before/node_modules/my-module/index.js)

can be converted to:

`after/node_modules/my-module/index.js`:

[import:'default_import'](after/node_modules/my-module/index.js)

### Importing specific named exports

If the original CommonJS module destructs from the result returned by  `require()`, it's typical to migrate to `import { namedExport } from 'module'`. This helps with tree-shaking during bundling and allows Node.js to check for missing exports statically. For example:

`before/node_modules/my-module/index.js`:

[import:'named_import'](before/node_modules/my-module/index.js)

`after/node_modules/my-module/index.js`:

[import:'named_import'](after/node_modules/my-module/index.js)

When the provider is CommonJS, its exports can only be imported by name if the names are detectable for ESM imports. See the [CommonJS interoperability guide](../../04-cjs-esm-interop/shipping-cjs-for-esm/README.md#named-imports-from-commonjs-in-esm) for details. If the names are not exported in a detectable way, a typical workaround is to import the default export first, then destructure from it:

`before/node_modules/my-module/index.js`:

[import:'undetectable'](before/node_modules/my-module/index.js)

`after/node_modules/my-module/import-undetectable-invalid.js`:

[import](after/node_modules/my-module/import-undetectable-invalid.js)

`after/node_modules/my-module/index.js`:

[import:'undetectable'](after/node_modules/my-module/index.js)

## Include file extensions in import paths

A CommonJS module may use `require()` to load from a path while omitting the file extension - in that case Node.js [would try to append different supported extensions to the path](https://nodejs.org/api/modules.html#file-modules) and load the first one that exists on the file system. For example:

`before/node_modules/my-module/load-without-extension.js`:

[import](before/node_modules/my-module/load-without-extension.js)

`import` in Node.js, however, [does not support extension probing](https://nodejs.org/api/esm.html#mandatory-file-extensions). In this case, the extension of a path must be fully specified during migration:

`after/node_modules/my-module/load-without-extension.js`:

[import](after/node_modules/my-module/load-without-extension.js)

`after/node_modules/my-module/index.js`:

[import:'ext_import'](after/node_modules/my-module/index.js)

## Directory imports are not supported

A CommonJS module may use `require()` to load from a directory - in that case, Node.js would also [probe at different locations](https://nodejs.org/api/modules.html#folders-as-modules) to find the target module. For example:

`before/node_modules/my-module/index.js`:

[import:'dir_import'](before/node_modules/my-module/index.js)

Similar to the extensionless case, `import` in Node.js does not support loading from directories either. The full path must also be explicitly specified during migration:

`after/node_modules/my-module/import-dir.js`:

[import](after/node_modules/my-module/import-dir.js)

`after/node_modules/my-module/index.js`:

[import:'dir_import'](after/node_modules/my-module/index.js)

## Migrating from dynamic `require()`

Sometimes, a module may have to load its dependencies conditionally or on-demand, then it needs something more flexible than the static `import` syntax. There are a few different options.

### If the dependency is a Node.js built‑in and must be loaded synchronously

In this case, consider using `process.getBuiltinModule()` (available from Node.js v20.16.0+ / v22.3.0+). This is particularly handy if the module may be used in environments other than Node.js and it does not need to support older, end-of-life Node.js versions. For example:

`before/node_modules/my-module/kernel-info.js`:

[import](before/node_modules/my-module/kernel-info.js)

Can be migrated to ESM like this:

`after/node_modules/my-module/kernel-info.js`:

[import](after/node_modules/my-module/kernel-info.js)

### If the dependency is not a built‑in and must be loaded synchronously

In this case, a ESM module can still create a `require()` function using the `module.createRequire()` built-in. For example this:

`before/node_modules/my-module/initialize-plugin-sync.js`:

[import](before/node_modules/my-module/initialize-plugin-sync.js)

can be migrated to ESM like this:

`after/node_modules/my-module/initialize-plugin-sync.js`:

[import](after/node_modules/my-module/initialize-plugin-sync.js)

### If the dependency is not a built‑in and can be loaded asynchronously

If it is acceptable to perform the dynamic loading asynchronously, the [dynamic `import()` expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) can be used. For example, if the CommonJS module previously looked like this:

`before/node_modules/my-module/initialize-plugin-async.js`:

[import](before/node_modules/my-module/initialize-plugin-async.js)

It can be migrated to ESM like this:

`after/node_modules/my-module/initialize-plugin-async.js`:

[import](after/node_modules/my-module/initialize-plugin-async.js)
