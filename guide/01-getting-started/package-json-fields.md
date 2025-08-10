---
description: Introduction to package.json in Node.js.
---

<!-- The ultimate source of truth should be https://nodejs.org/api/packages.html. Here we just give a brief overview. -->

In the [CommonJS and ESM](./commonjs-and-esm.md) section, we introduced how to export and import modules in Node.js using CommonJS and ECMAScript modules (ESM). Now, we will dive into how to structure these files into a package using the `package.json` file.

# Introduction to package.json

The `package.json` file serves as the metadata file for the package, containing information about the package, its dependencies, scripts, and more.

To create a `package.json` file, you can run the following command in your terminal:

```bash
npm init
```

This command will prompt you to enter various details about your package, such as its name, version, description, entry point, test command, repository, keywords, author, and license. A typical `package.json` file might look like this:

```json
{
  "name": "my-logger",
  "version": "1.0.0",
  "description": "My personal logger",
  "type": "module",
  "main": "logger.js",
  "scripts": {
    "test": "node --test"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/username/my-logger.git"
  },
  "keywords": [
    "logger",
    "logging"
  ],
  "author": "Your Name <your@email.com>",
  "license": "MIT"
}
```

While most fields are self-explanatory, when it comes to package publishing, there are a few important fields to note.

## The `type` field

Node.js uses the `type` field to determine how a `.js` file in the directory that contains this `package.json` should be interpreted.

- If it's `"commonjs"`, the `.js` files will be parsed as CommonJS modules.
- If it's `"module"`, the `.js` files will be parsed as ECMAScript modules.
- If this field is not present, Node.js will try to guess the module type of `.js` files by parsing their code. This is not always accurate and has a performance cost, so it's recommended to always explicitly set the `type` field.

## The `main` field

This specifies the entry point of the package, which is the file that will be loaded when the package is `import`-ed or `require()`-d. By default, it is set to `index.js`, but you can change it to any file you want.

## The `exports` field

While the `main` field is widely used to specify the entry point of a package, without the `exports` field, all files in the package are accessible when the package is imported. Suppose you have a package with the following structure:

```
my-logger/
├── logger.js
├── utils.js
└── package.json
```

If the `package.json` file only has the `main` field set to `logger.js`, like this:

```json
{
  "name": "my-logger",
  "version": "1.0.0",
  "main": "logger.js"
}
```

When users import this package, they can access both `logger.js` and `utils.js`:

```js
// app.js
import { Logger } from 'my-logger/logger.js';
import { someUtility } from 'my-logger/utils.js';
const logger = new Logger('debug');
someUtility();
```

Exposing internals like this may lead to unwanted maintenance burden. As a result, it's a good practice to always use the `exports` field to explicitly define which files are part of the public API of your package. This way, you can change the internal structure of your package without affecting users who rely on its public API.

For example, you can define the `exports` field like this:

```json
{
  "name": "my-logger",
  "version": "1.0.0",
  "main": "logger.js",
  "exports": {
    "./": "./logger.js"
  }
}
```

This configuration means that when users import your package, they can only access `logger.js`:

```js
// app.js
import { Logger } from 'my-logger';
const logger = new Logger('debug');
```

And if they attempt to import `utils.js`, they will get an error:

```js
// app.js
import { someUtility } from 'my-logger/utils.js'; // This will throw an error
```

When `exports` is provided, usually there's no need to specify the `main` field unless you need to support older versions of Node.js or some legacy tools that do not recognize the `exports` field.

To learn more about the `exports` field, see [Node.js documentation on package exports](https://nodejs.org/api/packages.html#package-entry-points).
