# Node.js package configuration guide

### Getting started

* [CommonJS and ESM](01-getting-started/commonjs-and-esm.md)
* [Introduction to `package.json`](01-getting-started/package-json.md)

### Basics

* [Single-file package configurations](02-single-file-package/README.md)
    * [Single-file CommonJS package](02-single-file-package/classic-commonjs/README.md)
    * [Single-file ESM package](02-single-file-package/simple-esm/README.md)
* [Multi-file package configurations](03-multi-file-package/README.md)
* [CommonJS and ESM interoperability](04-cjs-esm-interop/README.md)
    * [Shipping CommonJS for ESM](04-cjs-esm-interop/shipping-cjs-for-esm/README.md)
    * [Shipping ESM for CommonJS](04-cjs-esm-interop/shipping-esm-for-cjs/README.md)
* [Migrating CommonJS to ESM](05-cjs-esm-migration/README.md)
    * [Migrating imports](05-cjs-esm-migration/migrating-imports/README.md)
    * [Migrating exports](05-cjs-esm-migration/migrating-exports/README.md)
    * [Migrating context-local variables](05-cjs-esm-migration/migrating-context-local-variables/README.md)
    * [Migrating package.json](05-cjs-esm-migration/migrating-package-json/README.md)

### Packages with a build step

* [Bundling](06-bundling/README.md)
    * [Bundling with Webpack](06-bundling/bundling-with-webpack/README.md)
    * [Other bundlers](06-bundling/other-bundlers.md)
    * [Source maps](06-bundling/sourcemaps/README.md)
* [Dual packages](07-dual-packages/README.md)
    * [History of dual packages](07-dual-packages/dual-package-history.md)
    * [Dual package hazards](07-dual-packages/dual-package-hazards.md)
    * [Two full distributions](07-dual-packages/two-full-distributions/README.md)
    * [CommonJS distribution, ESM wrapper](07-dual-packages/esm-wrapper/README.md)
    * [Migrating dual packages to ESM-only](07-dual-packages/migrating-to-esm-only/README.md)
* [Package configuration tools](08-package-config-tools/README.md)

---

* [Q&A](q-n-a/README.md)
* [Troubleshooting](troubleshooting/README.md)
