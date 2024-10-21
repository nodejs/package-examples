# Node.js package shipping patterns

> [!NOTE]  
> This repository is currently under construction. It's meant to replace the sections in the Node.js package documentation for documenting package shipping patterns, the pros and cons, and guidelines for CJS to ESM migration.

## Previous documents from package.md in Node.js API documentation

> [!NOTE]  
> This is currently copied from the old package.md as-is. A lot of the information has been outdated since Node.js started to support `require(esm)`. We are still working on an update. Do not follow the documentation below for new packages for the time being.

Prior to the introduction of support for ES modules in Node.js, it was a common
pattern for package authors to include both CommonJS and ES module JavaScript
sources in their package, with `package.json` [`"main"`][] specifying the
CommonJS entry point and `package.json` `"module"` specifying the ES module
entry point.
This enabled Node.js to run the CommonJS entry point while build tools such as
bundlers used the ES module entry point, since Node.js ignored (and still
ignores) the top-level `"module"` field.

Node.js can now run ES module entry points, and a package can contain both
CommonJS and ES module entry points (either via separate specifiers such as
`'pkg'` and `'pkg/es-module'`, or both at the same specifier via [Conditional
exports][]). Unlike in the scenario where top-level `"module"` field is only used by bundlers,
or ES module files are transpiled into CommonJS on the fly before evaluation by
Node.js, the files referenced by the ES module entry point are evaluated as ES
modules.

### Dual package hazard

When an application is using a package that provides both CommonJS and ES module
sources, there is a risk of certain bugs if both versions of the package get
loaded. This potential comes from the fact that the `pkgInstance` created by
`const pkgInstance = require('pkg')` is not the same as the `pkgInstance`
created by `import pkgInstance from 'pkg'` (or an alternative main path like
`'pkg/module'`). This is the “dual package hazard,” where two versions of the
same package can be loaded within the same runtime environment. While it is
unlikely that an application or package would intentionally load both versions
directly, it is common for an application to load one version while a dependency
of the application loads the other version. This hazard can happen because
Node.js supports intermixing CommonJS and ES modules, and can lead to unexpected
behavior.

If the package main export is a constructor, an `instanceof` comparison of
instances created by the two versions returns `false`, and if the export is an
object, properties added to one (like `pkgInstance.foo = 3`) are not present on
the other. This differs from how `import` and `require` statements work in
all-CommonJS or all-ES module environments, respectively, and therefore is
surprising to users. It also differs from the behavior users are familiar with
when using transpilation via tools like [Babel][] or [`esm`][].

### Writing dual packages while avoiding or minimizing hazards

First, the hazard described in the previous section occurs when a package
contains both CommonJS and ES module sources and both sources are provided for
use in Node.js, either via separate main entry points or exported paths. A
package might instead be written where any version of Node.js receives only
CommonJS sources, and any separate ES module sources the package might contain
are intended only for other environments such as browsers. Such a package
would be usable by any version of Node.js, since `import` can refer to CommonJS
files; but it would not provide any of the advantages of using ES module syntax.

A package might also switch from CommonJS to ES module syntax in a [breaking
change](https://semver.org/) version bump. This has the disadvantage that the
newest version of the package would only be usable in ES module-supporting
versions of Node.js.

Every pattern has tradeoffs, but there are two broad approaches that satisfy the
following conditions:

1. The package is usable via both `require` and `import`.
2. The package is usable in both current Node.js and older versions of Node.js
   that lack support for ES modules.
3. The package main entry point, e.g. `'pkg'` can be used by both `require` to
   resolve to a CommonJS file and by `import` to resolve to an ES module file.
   (And likewise for exported paths, e.g. `'pkg/feature'`.)
4. The package provides named exports, e.g. `import { name } from 'pkg'` rather
   than `import pkg from 'pkg'; pkg.name`.
5. The package is potentially usable in other ES module environments such as
   browsers.
6. The hazards described in the previous section are avoided or minimized.

#### Approach #1: Use an ES module wrapper

Write the package in CommonJS or transpile ES module sources into CommonJS, and
create an ES module wrapper file that defines the named exports. Using
[Conditional exports][], the ES module wrapper is used for `import` and the
CommonJS entry point for `require`.

```json
// ./node_modules/pkg/package.json
{
  "type": "module",
  "exports": {
    "import": "./wrapper.mjs",
    "require": "./index.cjs"
  }
}
```

The preceding example uses explicit extensions `.mjs` and `.cjs`.
If your files use the `.js` extension, `"type": "module"` will cause such files
to be treated as ES modules, just as `"type": "commonjs"` would cause them
to be treated as CommonJS.
See [Enabling ESM][].

```cjs
// ./node_modules/pkg/index.cjs
exports.name = 'value';
```

```js
// ./node_modules/pkg/wrapper.mjs
import cjsModule from './index.cjs';
export const name = cjsModule.name;
```

In this example, the `name` from `import { name } from 'pkg'` is the same
singleton as the `name` from `const { name } = require('pkg')`. Therefore `===`
returns `true` when comparing the two `name`s and the divergent specifier hazard
is avoided.

If the module is not simply a list of named exports, but rather contains a
unique function or object export like `module.exports = function () { ... }`,
or if support in the wrapper for the `import pkg from 'pkg'` pattern is desired,
then the wrapper would instead be written to export the default optionally
along with any named exports as well:

```js
import cjsModule from './index.cjs';
export const name = cjsModule.name;
export default cjsModule;
```

This approach is appropriate for any of the following use cases:

* The package is currently written in CommonJS and the author would prefer not
  to refactor it into ES module syntax, but wishes to provide named exports for
  ES module consumers.
* The package has other packages that depend on it, and the end user might
  install both this package and those other packages. For example a `utilities`
  package is used directly in an application, and a `utilities-plus` package
  adds a few more functions to `utilities`. Because the wrapper exports
  underlying CommonJS files, it doesn't matter if `utilities-plus` is written in
  CommonJS or ES module syntax; it will work either way.
* The package stores internal state, and the package author would prefer not to
  refactor the package to isolate its state management. See the next section.

A variant of this approach not requiring conditional exports for consumers could
be to add an export, e.g. `"./module"`, to point to an all-ES module-syntax
version of the package. This could be used via `import 'pkg/module'` by users
who are certain that the CommonJS version will not be loaded anywhere in the
application, such as by dependencies; or if the CommonJS version can be loaded
but doesn't affect the ES module version (for example, because the package is
stateless):

```json
// ./node_modules/pkg/package.json
{
  "type": "module",
  "exports": {
    ".": "./index.cjs",
    "./module": "./wrapper.mjs"
  }
}
```

#### Approach #2: Isolate state

A [`package.json`][] file can define the separate CommonJS and ES module entry
points directly:

```json
// ./node_modules/pkg/package.json
{
  "type": "module",
  "exports": {
    "import": "./index.mjs",
    "require": "./index.cjs"
  }
}
```

This can be done if both the CommonJS and ES module versions of the package are
equivalent, for example because one is the transpiled output of the other; and
the package's management of state is carefully isolated (or the package is
stateless).

The reason that state is an issue is because both the CommonJS and ES module
versions of the package might get used within an application; for example, the
user's application code could `import` the ES module version while a dependency
`require`s the CommonJS version. If that were to occur, two copies of the
package would be loaded in memory and therefore two separate states would be
present. This would likely cause hard-to-troubleshoot bugs.

Aside from writing a stateless package (if JavaScript's `Math` were a package,
for example, it would be stateless as all of its methods are static), there are
some ways to isolate state so that it's shared between the potentially loaded
CommonJS and ES module instances of the package:

1. If possible, contain all state within an instantiated object. JavaScript's
   `Date`, for example, needs to be instantiated to contain state; if it were a
   package, it would be used like this:

   ```js
   import Date from 'date';
   const someDate = new Date();
   // someDate contains state; Date does not
   ```

   The `new` keyword isn't required; a package's function can return a new
   object, or modify a passed-in object, to keep the state external to the
   package.

2. Isolate the state in one or more CommonJS files that are shared between the
   CommonJS and ES module versions of the package. For example, if the CommonJS
   and ES module entry points are `index.cjs` and `index.mjs`, respectively:

   ```cjs
   // ./node_modules/pkg/index.cjs
   const state = require('./state.cjs');
   module.exports.state = state;
   ```

   ```js
   // ./node_modules/pkg/index.mjs
   import state from './state.cjs';
   export {
     state,
   };
   ```

   Even if `pkg` is used via both `require` and `import` in an application (for
   example, via `import` in application code and via `require` by a dependency)
   each reference of `pkg` will contain the same state; and modifying that
   state from either module system will apply to both.

Any plugins that attach to the package's singleton would need to separately
attach to both the CommonJS and ES module singletons.

This approach is appropriate for any of the following use cases:

* The package is currently written in ES module syntax and the package author
  wants that version to be used wherever such syntax is supported.
* The package is stateless or its state can be isolated without too much
  difficulty.
* The package is unlikely to have other public packages that depend on it, or if
  it does, the package is stateless or has state that need not be shared between
  dependencies or with the overall application.

Even with isolated state, there is still the cost of possible extra code
execution between the CommonJS and ES module versions of a package.

As with the previous approach, a variant of this approach not requiring
conditional exports for consumers could be to add an export, e.g.
`"./module"`, to point to an all-ES module-syntax version of the package:

```json
// ./node_modules/pkg/package.json
{
  "type": "module",
  "exports": {
    ".": "./index.cjs",
    "./module": "./index.mjs"
  }
}
```

[Babel]: https://babeljs.io/
[Conditional exports]: https://nodejs.org/api/packages.html#conditional-exports
[Enabling ESM]: https://nodejs.org/api/esm.html#enabling
[`esm`]: https://github.com/standard-things/esm#readme
[`main`]: https://nodejs.org/api/packages.html#main
[`package.json`]: https://nodejs.org/api/packages.html#nodejs-packagejson-field-definitions
