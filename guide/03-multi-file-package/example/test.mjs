import { describe, it } from 'node:test';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert';
import { createRequire } from 'node:module';

describe('multi-file-package', () => {
  it('should run app.cjs without error', () => {
    const result = spawnSync(
      process.execPath,
      ['app.cjs'],
      {
        cwd: import.meta.dirname,
        encoding: 'utf-8',
      },
    );
    assert.strictEqual(result.status, 0, result.stderr);
    assert.match(result.stdout, /This is an error message/);
  });

  it('should run app.mjs without error', () => {
    const result = spawnSync(
      process.execPath,
      ['app.mjs'],
      {
        cwd: import.meta.dirname,
        encoding: 'utf-8',
      },
    );
    assert.strictEqual(result.status, 0, result.stderr);
    assert.match(result.stdout, /This is an error message/);
  });

  it('should not allow importing utils.js directly', async () => {
    await assert.rejects(async () => {
      await import('my-logger/utils.js');
    }, {
      code: 'ERR_PACKAGE_PATH_NOT_EXPORTED',
    });
  });

  it('should not allow requiring utils.js directly', () => {
    const require = createRequire(import.meta.url);
    assert.throws(() => {
      require('my-logger/utils.js');
    }, {
      code: 'ERR_PACKAGE_PATH_NOT_EXPORTED',
    });
  });
});

