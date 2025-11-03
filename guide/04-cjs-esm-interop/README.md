---
description: CommonJS and ESM interoperability in Node.js packages
---

# Interoperating between CommonJS and ESM

In the Node.js ecosystem, it's common for packages shipped in different module formats to be used together, or be consumed by applications using a different module system, with different parts of the codebase being controlled by different authors. Due to the semantic differences between CommonJS (CJS) and ECMAScript Modules (ESM), interoperability between the two module systems can be tricky. In this chapter, we will discuss some strategies and patterns to help you navigate these challenges.

This chapter covers two main interoperability scenarios:

- [Shipping CommonJS for ESM consumers](./shipping-cjs-for-esm/README.md)
- [Shipping ESM for CommonJS consumers](./shipping-esm-for-cjs/README.md)
