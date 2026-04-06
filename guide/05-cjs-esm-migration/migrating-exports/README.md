---
description: Guide on migrating exports in CommonJS to ESM.
---

# Migrating exports in CommonJS

When migrating a CommonJS module to ESM, there are two main considerations:

1. Migrating `exports` and `module.exports` access to [the `export` syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export).
2. Maintaining backward compatibility:
  - For ESM consumers: always provide a default export.
  - For CommonJS consumers: if `module.exports` was reassigned to a non-object literal, provide the special `'module.exports'` named export.

Examples in this chapter can be found [here](https://github.com/nodejs/package-examples/blob/main/guide/05-cjs-esm-migration/migrating-exports/).

## Migrating to the `export` syntax

In CommonJS, exports are typically done by writing to [the `module.exports` object or the `exports` shortcut](https://nodejs.org/api/modules.html#moduleexports). In ESM, exports are declared using [the `export` syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export).

### Migrating `exports.foo = ...` or `module.exports.foo = ...`

Static property assignments to `exports` or `module.exports` can be directly translated to [named exports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export#using_named_exports) in ESM. For example, if a CommonJS module contains:

`before/node_modules/my-module/named-only.js`:

[import:'main'](before/node_modules/my-module/named-only.js)

This can be migrated to direct `export` statements:

`after/node_modules/my-module/named-only.js`:

[import:'main'](after/node_modules/my-module/named-only.js)

Aliases can be migrated using the `export ... as ...` syntax:

`before/node_modules/my-module/named-only.js`:

[import:'alias'](before/node_modules/my-module/named-only.js)

`after/node_modules/my-module/named-only.js`:

[import:'alias'](after/node_modules/my-module/named-only.js)

### Migrating `module.exports = { foo, ... }`

Some CommonJS modules provide named exports by reassigning `module.exports` to an object literal with static value properties. This can be migrated with the `export { ... }` syntax. For example:

`before/node_modules/my-module/named-only-object-literal.js`:

[import](before/node_modules/my-module/named-only-object-literal.js)

can be migrated to:

`after/node_modules/my-module/named-only-object-literal.js`:

[import](after/node_modules/my-module/named-only-object-literal.js)

### Migrating `module.exports = notAnObjectLiteral`

If `module.exports` is set to a value that is not an object literal, e.g. a function or a class, use the [`export default` syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export#using_the_default_export). For example:

`before/node_modules/my-module/default-export.js`:

[import](before/node_modules/my-module/default-export.js)

can be migrated to ESM as follows:

`after/node_modules/my-module/default-export.js`:

[import:'main'](after/node_modules/my-module/default-export.js)

Note: in this case, additional care must be taken to if backward compatibilty for CommonJS consumers is needed. See the [maintaining backward compatibility section](#for-commonjs-consumers-if-moduleexports-was-reassigned-to-a-non-object-literal) for details.

### Re-exporting default exports from internal modules

CommonJS modules can re-export from other modules by assigning properties from the required module to `exports` or `module.exports`. Translate these to ESM [`export ... from` statements](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export#using_export_from).

For example, this CommonJS module:

`before/node_modules/my-module/re-export-defaults.js`:

[import](before/node_modules/my-module/re-export-defaults.js)

can be migrated to ESM like this:

`after/node_modules/my-module/re-export-defaults.js`:

[import](after/node_modules/my-module/re-export-defaults.js)

### Re-exporting named exports from internal modules

CommonJS modules can re-export selected named exports from another module:

`before/node_modules/my-module/re-export-names.js`:

[import](before/node_modules/my-module/re-export-names.js)

this can be migrated to ESM with [`export ... from` statements](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export#using_export_from) too:

`after/node_modules/my-module/re-export-names.js`:

[import](after/node_modules/my-module/re-export-names.js)

### Re-exporting all exports from internal modules

CommonJS modules may re-export all exports from another module:

`before/node_modules/my-module/re-export-all.js`:

[import](before/node_modules/my-module/re-export-all.js)

To migrate to ESM, use `export * from` for named exports and add `export { default } from` for the default export omitted by `export * from`:

`after/node_modules/my-module/re-export-all.js`:

[import](after/node_modules/my-module/re-export-all.js)

### Aggregating named exports from multiple modules

If the CommonJS module aggregates exports from multiple internal modules:

`before/node_modules/my-module/re-export-aggregate.js`:

[import](before/node_modules/my-module/re-export-aggregate.js)

it can be migrated to ESM like this:

`after/node_modules/my-module/re-export-aggregate.js`:

[import](after/node_modules/my-module/re-export-aggregate.js)

## Maintaining backward compatibility

### For ESM consumers: always provide a default export

When a CommonJS module is loaded by a ESM consumer, its `module.exports` object is always available as a default export. When the module gets migrated to ESM, Node.js no longer adds this default export automatically; instead, the ESM provider is left to decide what should be the default export provided to ESM consumers.

To maintain compatibility for ESM consumers, ESM migrated from CommonJS should always provide a default export in its external interface, even if it seemingly only provides named exports.

Consider the following CommonJS module:

`before/node_modules/my-module/named-only.js`:

[import:'main,alias'](before/node_modules/my-module/named-only.js)

If only convert the named exports:

`after/node_modules/my-module/named-only-partial.js`:

[import](after/node_modules/my-module/named-only-partial.js)

the default export would be missing after migration, which would break ESM consumers that have been using the automatically added default export from the CommonJS external interface::

`after/app-importing-default-from-named-only-partial.mjs`:

[import](after/app-importing-default-from-named-only-partial.mjs)

To close this gap, provide a default export in the migrated ESM, which typically aggregates the named exports:

`after/node_modules/my-module/named-only.js`:

[import:'main,alias,compat'](after/node_modules/my-module/named-only.js)

`after/app-importing-default-from-named-only.mjs`:

[import](after/app-importing-default-from-named-only.mjs)

### If `module.exports` was reassigned to a non-object-literal

If the CommonJS module previously reassigned `module.exports` to a value, unless that value is an object literal with static names (in which case, it essentially only contained named exports, and the `module.exports` value itself is likely insignificant), CommonJS consumers would expect to `require()` to continue to return that value. In this case, use the special `'module.exports'` named export in ESM to customize what `require(esm)` returns for CommonJS consumers.

For example, if the CommonJS module contained:

`before/node_modules/my-module/default-export.js`:

[import](before/node_modules/my-module/default-export.js)

as mentioned before, this is typically migrated to ESM like below.

`after/node_modules/my-module/default-export-partial.js`:

[import](after/node_modules/my-module/default-export-partial.js)

This is done so that ESM consumers can continue importing the function as the default export:

`after/app-importing-default-export.mjs`:

[import](after/app-importing-default-export.mjs)

However, as discussed in [the ESM interoperability guide](../../04-cjs-esm-interop/shipping-esm-for-cjs/README.md#how-esm-exports-map-to-requireesm), per the ESM specification, the default export of that ESM would only be available as the `'default'` property on the module namespace object, which is returned by `require(esm)` directly by default:

`after/app-requiring-default-export-partial.cjs`:

[import](after/app-requiring-default-export-partial.cjs)

To address this disparity, Node.js recognizes a special `'module.exports'` named export for ESM. When provided, `require(esm)` returns its value directly instead of the module namespace object.

`after/node_modules/my-module/default-export.js`:

[import:'main,compat'](after/node_modules/my-module/default-export.js)

`after/app-requiring-default-export.cjs`:

[import](after/app-requiring-default-export.cjs)

## Dynamic exports

Dynamically-added exports cannot be directly translated to ESM. ESM exports are static and must be known at compile time.

One typical approximation is to use a static export shape with `undefined` placeholders and conditionally initialize the bindings.

For example, this CommonJS pattern:

`before/node_modules/my-module/dynamic-exports.js`:

[import](before/node_modules/my-module/dynamic-exports.js)

cannot be directly migrated to ESM. However, it can be restructured if consumers do not require uninitialized exports to be absent from the export list:

`after/node_modules/my-module/dynamic-exports.js`:

[import](after/node_modules/my-module/dynamic-exports.js)

`before/app-using-dynamic-exports.mjs`:

[import](before/app-using-dynamic-exports.mjs)

`after/app-using-dynamic-exports.mjs`:

[import](after/app-using-dynamic-exports.mjs)

<!-- TODO(joyeecheung): document patterns that have no direct ESM equivalent e.g. exports with accessors, export with attributes -->
