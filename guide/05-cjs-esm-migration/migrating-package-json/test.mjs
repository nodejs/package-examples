import { describe, it } from 'node:test';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert';
import { join } from 'node:path';

describe('migrating-package-json', () => {
  describe('before', () => {
    it('can be required from CommonJS', () => {
      const result = spawnSync(process.execPath, ['app.cjs'], {
        cwd: join(import.meta.dirname, 'before'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0);
      assert.match(result.stdout, /\[LOG\] Hello from CommonJS/);
    });

    it('can be imported from ESM', () => {
      const result = spawnSync(process.execPath, ['app.mjs'], {
        cwd: join(import.meta.dirname, 'before'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0);
      assert.match(result.stdout, /\[LOG\] Hello from ESM/);
    });
  });

  describe('after', () => {
    it('can be required from CommonJS', () => {
      const result = spawnSync(process.execPath, ['app.cjs'], {
        cwd: join(import.meta.dirname, 'after'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0);
      assert.match(result.stdout, /\[LOG\] Hello from CommonJS/);
    });

    it('can be imported from ESM', () => {
      const result = spawnSync(process.execPath, ['app.mjs'], {
        cwd: join(import.meta.dirname, 'after'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0);
      assert.match(result.stdout, /\[LOG\] Hello from ESM/);
    });
  });
});
