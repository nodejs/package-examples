---
description: Guide on migrating package.json in CommonJS packages to ESM.
---

# Migrating package.json for a CommonJS package

Examples in this chapter can be found [here](https://github.com/nodejs/package-examples/blob/main/guide/05-cjs-esm-migration/migrating-package-json/).

## The `"type"` field

By default, Node.js treats `.js` files as CommonJS for backward compatibility. This can be overriden with the `"type"` field in the nearest `package.json`.

If a package is migrated to ESM and the ESM code remains in `.js` files, the `"type"` field in `package.json` should be explicitly set to `"module"`.

For example, a CommonJS package might look like this before migration:

```
my-logger/
├── index.js     // Contains CommonJS code
└── package.json  // Either contains "type": "commonjs",
                  // or does not have "type" field and relies on the "commonjs" default
```

After migration, if ESM source remains in `.js`, set `"type": "module"` explicitly so Node.js loads `.js` files as ESM:

```
my-logger/
├── index.js     // Migrated to ESM code now
└── package.json  // Needs to explicitly specify "type": "module" now
```

If you can’t set `"type": "module"` for some reason, use the `.mjs` extension for migrated files. This may be useful during gradual migrations when the package is partially migrated to ESM while some `.js` files remain CommonJS.

```
my-logger/
├── index.mjs     // Migrated to ESM code now
├── utils.js      // Still CommonJS, pending migration
└── package.json  // Either contains "type": "commonjs",
                  // or does not have "type" field and relies on the "commonjs" default
```

## The `"engines"` field

As mentioned in the [chapter about shipping ESM for CommonJS consumers](../../04-cjs-esm-interop/shipping-esm-for-cjs/README.md#engines), when a CommonJS package is migrated to ESM, consider updating the `"engines"` field to limit installs to Node.js versions that support `require(esm)`. Many packages bump the major version when dropping older Node.js support too. For example:

```json
{
  "name": "my-logger",
  "version": "2.0.0",  // bumped from 1.x to 2.0.0
  "type": "module",  // switched to ESM in .js files
  "exports": {
    ".": "./index.js",
    "./package.json": "./package.json"
  },
  "engines": {
    // Requires Node.js versions with require(esm) support
    "node": "^20.19.0 || >=22.12.0"
  }
}
```

This practice is optional but it's a common pattern.
