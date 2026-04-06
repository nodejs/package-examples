---
description: Guide on how to create multi-file packages in Node.js.
---

# Multi-file package configurations

As packages grow, they usually need to split code across multiple files. This chapter shows how to structure and configure multi-file Node.js packages.

Consider a `my-logger` package that exports a `Logger` class. The package consists of multiple files, including `src/logger.js`, `lib/utils.js`, and `index.js`. In addition, it has tests that should not be included in the published package.

```
my-logger/
├── lib/utils.js
├── src/logger.js
├── test/logger.test.js
├── index.js
└── package.json
```

`lib/utils.js`:

[import:'abbrev,abbrev_end'](example/node_modules/my-logger/lib/utils.js)

`src/logger.js`:

[import:'logger_start,logger_end'](example/node_modules/my-logger/src/logger.js)

`index.js`:

[import](example/node_modules/my-logger/index.js)

The `package.json` file for this package would typically look like this:

`package.json`:

[import](example/node_modules/my-logger/package.json)

When this package is published, because `test` is not listed in `files`, this directory will be excluded in the published package. Here we use `npm pack` to verify it (though this convention is generally respected by most package managers):

<!-- TODO(ljharb): this documents the most typical configuration using the files field. Some maintainers may prefer to use package manager-specific features like .npmignore. Add a separate page to discuss its pros/cons, and link to it here. -->

```
$ cd /path/to/my-logger
$ npm pack
$ tar -tf my-logger-1.0.0.tgz

package/index.js
package/src/logger.js
package/lib/utils.js
package/package.json
```

In addition, when users load this package, they can only access `index.js` and `package.json`, but not the internal files. This allows maintainers to change the internal structure of the package without breaking users who may come to assume the internal files are part of the public API.

`app.mjs`:

[import](example/app.mjs)

This works similarly for CommonJS consumers (since the package is ESM, they will need to use Node.js 20 or above to load it from `require()`):

`app.cjs`:

[import:'doc'](example/app.cjs)

You can find an example of this package on [GitHub](https://github.com/nodejs/package-examples/tree/main/guide/03-multi-file-package/example).
