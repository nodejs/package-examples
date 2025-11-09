import { describe, it } from 'node:test';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

describe('migrating-context-local-variables', () => {
  describe('before', () => {
    it('can use __filename and __dirname in CommonJS', () => {
      const dir = join(import.meta.dirname, 'before');
      const file = join(dir, 'app.cjs');
      const result = spawnSync(process.execPath, [file], {
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0);
      assert(result.stdout.includes('Filename: ') + file);
      assert(result.stdout.includes('Dirname: ') + dir);
      assert.match(result.stdout, /Is main from module: false/);
      assert.match(result.stdout, /Is main from main: true/);
    });
  });

  describe('after', () => {
    it('can use import.meta.filename and import.meta.dirname', () => {
      const dir = join(import.meta.dirname, 'after');
      const file = join(dir, 'app.mjs');
      const result = spawnSync(process.execPath, [file], {
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0);
      assert(result.stdout.includes('Filename: ') + file);
      assert(result.stdout.includes('Dirname: ') + dir);
      assert.match(result.stdout, /Is main from module: false/);
      assert.match(result.stdout, /Is main from main: true/);
    });

    it('can use fallback with fileURLToPath', () => {
      const dir = join(import.meta.dirname, 'after');
      const file = join(dir, 'app-fallback.mjs');
      const result = spawnSync(process.execPath, [file], {
        encoding: 'utf8',
      });
      assert.strictEqual(result.status, 0);
      assert(result.stdout.includes('Filename: ') + file);
      assert(result.stdout.includes('Dirname: ') + dir);
      assert(result.stdout.includes('URL: ') + pathToFileURL(file));
    });
  });
});
