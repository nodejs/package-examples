import { describe, it } from 'node:test';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert';
import { join } from 'node:path';

describe('migrating-exports', () => {
  describe('before', () => {
    it('named-only can be required from CommonJS', () => {
      const result = spawnSync(process.execPath, ['app-named-only.cjs'], {
        cwd: join(import.meta.dirname, 'before'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0, result.stderr);
    });

    it('named-only can be imported from ESM', () => {
      const result = spawnSync(process.execPath, ['app-named-only.mjs'], {
        cwd: join(import.meta.dirname, 'before'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0, result.stderr);
    });

    it('named-only-object-literal can be required from CommonJS', () => {
      const result = spawnSync(process.execPath, ['app-named-only-object-literal.cjs'], {
        cwd: join(import.meta.dirname, 'before'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0, result.stderr);
    });

    it('named-only-object-literal can be imported from ESM', () => {
      const result = spawnSync(process.execPath, ['app-named-only-object-literal.mjs'], {
        cwd: join(import.meta.dirname, 'before'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0, result.stderr);
    });

    it('default-export can be required from CommonJS', () => {
      const result = spawnSync(process.execPath, ['app-default-export.cjs'], {
        cwd: join(import.meta.dirname, 'before'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0, result.stderr);
    });

    it('default-export can be imported from ESM', () => {
      const result = spawnSync(process.execPath, ['app-default-export.mjs'], {
        cwd: join(import.meta.dirname, 'before'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0, result.stderr);
    });

    it('dynamic-exports can be imported from ESM', () => {
      const result = spawnSync(process.execPath, ['app-using-dynamic-exports.mjs'], {
        cwd: join(import.meta.dirname, 'before'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0, result.stderr);
      assert.match(result.stdout, /false/);
      assert.match(result.stdout, /true/);
    });
  });

  describe('after', () => {
    it('named-only can be required from CommonJS', () => {
      const result = spawnSync(process.execPath, ['app-named-only.cjs'], {
        cwd: join(import.meta.dirname, 'after'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0, result.stderr);
    });

    it('named-only can be imported from ESM', () => {
      const result = spawnSync(process.execPath, ['app-named-only.mjs'], {
        cwd: join(import.meta.dirname, 'after'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0, result.stderr);
    });

    it('named-only-partial can be imported from ESM', () => {
      const result = spawnSync(process.execPath, ['app-importing-default-from-named-only-partial.mjs'], {
        cwd: join(import.meta.dirname, 'after'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 1, result.stderr);
      assert.match(result.stderr, /does not provide an export named 'default'/);
    });

    it('named-only with default can be imported from ESM', () => {
      const result = spawnSync(process.execPath, ['app-importing-default-from-named-only.mjs'], {
        cwd: join(import.meta.dirname, 'after'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0, result.stderr);
    });

    it('named-only-object-literal can be required from CommonJS', () => {
      const result = spawnSync(process.execPath, ['app-named-only-object-literal.cjs'], {
        cwd: join(import.meta.dirname, 'after'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0, result.stderr);
    });

    it('named-only-object-literal can be imported from ESM', () => {
      const result = spawnSync(process.execPath, ['app-named-only-object-literal.mjs'], {
        cwd: join(import.meta.dirname, 'after'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0, result.stderr);
    });

    it('default-export can be required from CommonJS', () => {
      const result = spawnSync(process.execPath, ['app-default-export.cjs'], {
        cwd: join(import.meta.dirname, 'after'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0, result.stderr);
    });

    it('default-export can be imported from ESM', () => {
      const result = spawnSync(process.execPath, ['app-default-export.mjs'], {
        cwd: join(import.meta.dirname, 'after'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0, result.stderr);
    });

    it('default-export-partial can be imported from ESM', () => {
      const result = spawnSync(process.execPath, ['app-importing-default-export.mjs'], {
        cwd: join(import.meta.dirname, 'after'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0, result.stderr);
    });

    it('default-export-partial cannot be required from CommonJS', () => {
      const result = spawnSync(process.execPath, ['app-requiring-default-export-partial.cjs'], {
        cwd: join(import.meta.dirname, 'after'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 1, result.stderr);
      assert.match(result.stderr, /TypeError/);
    });

    it('default-export with module.exports can be required from CommonJS', () => {
      const result = spawnSync(process.execPath, ['app-requiring-default-export.cjs'], {
        cwd: join(import.meta.dirname, 'after'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0, result.stderr);
    });

    it('dynamic-exports can be imported from ESM', () => {
      const result = spawnSync(process.execPath, ['app-using-dynamic-exports.mjs'], {
        cwd: join(import.meta.dirname, 'after'),
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0, result.stderr);
      assert.match(result.stdout, /true/);
    });
  });
});
