import assert from 'node:assert';

import { pkg, foo, bar, utils, lib } from 'my-module';
import { describe, it } from 'node:test';

describe('migrating-imports', () => {
  describe('before', () => {
    describe('before-migrations', () => {
      it('works with default export of a third-party package', () => {
        assert.strictEqual(pkg.foo, 'from pkg');
      });
      it('works with named exports of a third-party package', () => {
        assert.strictEqual(foo, 'from pkg');
      });
      it('works with directory imports', () => {
        assert.strictEqual(utils.value, 'from utils-dir');
      });
      it('works with undetectable named imports from CommonJS', () => {
        assert.strictEqual(bar, 'from cjs-pkg-with-undetectable-name');
      });
      it('works with extensionless exports', () => {
        assert.strictEqual(lib.value, 'from lib');
      });

      it('works with synchronous dynamic import of builtins', async () => {
        const { getKernelInfo } = await import('my-module/kernel-info');
        const kernelInfo = getKernelInfo();
        assert.strictEqual(typeof kernelInfo, 'string');
      });

      it('works with synchronous dynamic require for plugins', async () => {
        const { initializePluginsSync } = await import('my-module/initialize-plugin-sync');
        const results = initializePluginsSync(['plugin-a']);
        assert.deepStrictEqual(results, ['plugin-a initialized']);
      });

      it('works with asynchronous dynamic import for plugins', async () => {
        const { initializePlugins } = await import('my-module/initialize-plugin-async');
        const results = await initializePlugins(['plugin-b']);
        assert.deepStrictEqual(results, ['plugin-b initialized']);
      });
    });
  });
});
