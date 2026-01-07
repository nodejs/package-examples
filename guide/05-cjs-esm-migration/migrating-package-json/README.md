---
description: Guide on migrating package.json in CommonJS packages to ESM.
---

# Migrating package.json for a CommonJS package

Examples in this chapter can be found [here](https://github.com/nodejs/package-examples/blob/main/guide/05-cjs-esm-migration/migrating-package-json/).

## The `"type"` field

When migrating a CommonJS package to ESM, there are two options to inform Node.js that the JavaScript files should be treated as ESM:

- Use the `.mjs` file extension for ESM files.
- Set the `"type"` field in `package.json` to `"module"`.

For example, a CommonJS package might look like this before migration:

```
my-logger/
├── index.js       // Contains CommonJS code
├── utils.js       // Contains CommonJS code
└── package.json   // Either contains "type": "commonjs",
                   // or does not have "type" field and relies on the "commonjs" default
```

After migrating some or all files to ESM, the migrated files can be renamed to use the `.mjs` extension. If the `package.json` continues to have `"type": "commonjs"` or leaves the `"type"` field absent, Node.js will still treat any remaining `.js` files as CommonJS modules.

```
my-logger/
├── index.mjs     // Migrated to ESM
├── utils.js      // Still CommonJS, pending migration
└── package.json  // Either contains "type": "commonjs",
                  // or does not have "type" field and relies on the "commonjs" default
```

Alternatively, to keep using the `.js` extension after migrating to ESM, set the `"type"` field in `package.json` to `"module"`. This tells Node.js to treat all `.js` files in the package as ESM. See [the `type` field](../../01-getting-started/package-json.md#the-type-field) for more details.

```
my-logger/
├── index.js      // Migrated to ESM
├── utils.js      // Migrated to ESM
└── package.json  // Contains "type": "module"
```

The `"type": "module"` approach allows retaining the `.js` extension, which can be useful when filenames cannot be changed or when files need to be consumed by tools that expect the `.js` extension. However, this approach incurs a performance overhead during module loading compared to using the `.mjs` extension, because Node.js must read the `package.json` to determine the module type. Choose the approach that best fits your project's needs.

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
