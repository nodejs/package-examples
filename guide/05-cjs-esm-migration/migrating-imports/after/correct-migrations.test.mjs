import assert from 'node:assert';

import { pkg, foo, bar, utils, lib } from 'my-module';
import { describe, it } from 'node:test';

describe('migrating-imports', () => {
  describe('after', () => {
    describe('correct-migrations', () => {
      it('correctly migrates default export of a third-party package', () => {
        assert.strictEqual(pkg.foo, 'from pkg');
      });
      it('correctly migrates named exports of a third-party package', () => {
        assert.strictEqual(foo, 'from pkg');
      });
      it('correctly migrates directory imports', () => {
        assert.strictEqual(utils.value, 'from utils-dir');
      });
      it('correctly migrates undetectable named imports from CommonJS', () => {
        assert.strictEqual(bar, 'from cjs-pkg-with-undetectable-name');
      });
      it('correctly migrates extensionless exports', () => {
        assert.strictEqual(lib.value, 'from lib');
      });

      it('correctly migrates synchronous dynamic import of builtins', async () => {
        const { getKernelInfo } = await import('my-module/kernel-info');
        const kernelInfo = getKernelInfo();
        assert.strictEqual(typeof kernelInfo, 'string');
      });

      it('correctly migrates synchronous dynamic require for plugins', async () => {
        const { initializePluginsSync } = await import('my-module/initialize-plugin-sync');
        const results = initializePluginsSync(['plugin-a']);
        assert.deepStrictEqual(results, ['plugin-a initialized']);
      });

      it('correctly migrates asynchronous dynamic import for plugins', async () => {
        const { initializePlugins } = await import('my-module/initialize-plugin-async');
        const results = await initializePlugins(['plugin-b']);
        assert.deepStrictEqual(results, ['plugin-b initialized']);
      });
    });
  });
});
