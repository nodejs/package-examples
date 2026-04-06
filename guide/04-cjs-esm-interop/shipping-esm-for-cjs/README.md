---
description: Guide on shipping ESM for CommonJS consumers
---

# Shipping ESM for CommonJS consumers

Since Node.js v20.19.0/v22.12.0, CommonJS can load ESM via `require()`, as long as the ESM does not use [top-level `await`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await#top_level_await). Similar to [providing CommonJS to ESM consumers](../shipping-cjs-for-esm/README.md), semantic differences between CommonJS and ESM can introduce some caveats when providing ESM to CommonJS consumers. Let's explore how it works in this chapter.

Examples in this chapter can be found [here](https://github.com/nodejs/package-examples/blob/main/guide/04-cjs-esm-interop/shipping-esm-for-cjs/).

## How ESM exports map to `require(esm)`

`require(esm)` mostly mirrors synchronous [dynamic `import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import). By default, it returns the ESM [module namespace object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import#module_namespace_object), which exposes named exports as properties and a `default` property for the default export.

Consider the following ESM provider:

`node_modules/my-logger/index.js`:

[import:'logger_start,logger_end'](node_modules/my-logger/index.js)

Dynamic `import()` returns the module namespace object:

`app.mjs`:

[import:'doc'](app.mjs)

Likewise, `require()` returns the module namespace object:

`app.cjs`:

[import:'doc'](app.cjs)

### Customize `require(esm)` via the `'module.exports'` export

If the ESM has an export named `'module.exports'`, `require(esm)` returns that value instead of the namespace object. This is useful when migrating from CommonJS to ESM while preserving existing CommonJS consumers. See [CommonJS to ESM migration](../../05-cjs-esm-migration/migrating-exports/README.md#migrating-other-moduleexports-reassignments) for more details.

Let's revisit the logger example and add a named export `'module.exports'` for the default logger instance:

`node_modules/my-logger-with-default-export/index.js`:

[import:'logger_start,logger_end'](node_modules/my-logger-with-default-export/index.js)

ESM consumers will see that the results from static or dynamic import are unchanged, but for CommonJS consumers, `require()` now returns the default `logger` instance, as specified by the `'module.exports'` export:

`app-with-default-export.cjs`:

[import:'doc'](app-with-default-export.cjs)

This aligns CommonJS usage with the ESM equivalent:

`app-with-default-export.mjs`:

[import:'doc'](app-with-default-export.mjs)

## Limitations

When shipping ESM for CommonJS via `require(esm)`, note:

1. **Synchronous graph only**: `require(esm)` is synchronous; When the ESM loaded by `require()` or any of its dependencies contain top‑level `await`, an [`ERR_REQUIRE_ASYNC_MODULE`](https://nodejs.org/api/errors.html#err_require_async_module) is thrown.
2. **No ESM <-> CJS cycles**: To maintain [ECMAScript invariants](https://tc39.es/ecma262/#sec-innermoduleevaluation), cycles that cross the CommonJS/ESM boundary are unsupported and throw [`ERR_REQUIRE_CYCLE_MODULE`](https://nodejs.org/api/errors.html#err_require_cycle_module).

`cycle-error/a.mjs`:

[import](cycle-error/a.mjs)

`cycle-error/b.cjs`:

[import](cycle-error/b.cjs)

A typical workaround would be loading one side lazily (not at module load time).

`cycle-lazy/b.cjs`:

[import:'doc'](cycle-lazy/b.cjs)

Only cross‑boundary cycles fail; pure CommonJS or pure ESM cycles still work.

## `require(esm)` feature detection

`require(esm)` is only supported in Node.js v20.19.0/v22.12.0 and above. When it's necessary to support older Node.js versions, there are several ways to detect whether `require(esm)` is supported.

### `process.features.require_module`

In code, use [`process.features.require_module`](https://nodejs.org/api/process.html#processfeaturesrequire_module) to detect support. This helps when an ESM dependency is optional and the consumer code must be synchronous.

`log-with-feature-detection.js`:

[import](log-with-feature-detection.js)

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
