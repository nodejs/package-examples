import { describe, it } from 'node:test';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert';

describe('shipping-esm-for-cjs', () => {
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
    assert.match(result.stdout, /true/);
    assert.match(result.stdout, /\[debug\] Hello from CommonJS requiring ESM/);
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
    assert.match(result.stdout, /true/);
    assert.match(result.stdout, /\[debug\] Hello from ESM dynamic import/);
  });

  it('should run app-with-default-export.cjs without error', () => {
    const result = spawnSync(
      process.execPath,
      ['app-with-default-export.cjs'],
      {
        cwd: import.meta.dirname,
        encoding: 'utf-8',
      },
    );
    assert.strictEqual(result.status, 0, result.stderr);
    assert.match(result.stdout, /true/);
    assert.match(result.stdout, /\[debug\] Hello from CommonJS with module\.exports/);
  });

  it('should run app-with-default-export.mjs without error', () => {
    const result = spawnSync(
      process.execPath,
      ['app-with-default-export.mjs'],
      {
        cwd: import.meta.dirname,
        encoding: 'utf-8',
      },
    );
    assert.strictEqual(result.status, 0, result.stderr);
    assert.match(result.stdout, /true/);
    assert.match(result.stdout, /\[debug\] Hello from ESM with module\.exports/);
  });

  it('should throw ERR_REQUIRE_CYCLE_MODULE when running cycle-error/b.cjs', () => {
    const result = spawnSync(
      process.execPath,
      ['cycle-error/b.cjs'],
      {
        cwd: import.meta.dirname,
        encoding: 'utf-8',
      },
    );
    assert.notStrictEqual(result.status, 0);
    assert.match(result.stderr, /ERR_REQUIRE_CYCLE_MODULE/);
  });

  it('should run cycle-lazy/a.mjs without error', () => {
    const result = spawnSync(
      process.execPath,
      ['cycle-lazy/a.mjs'],
      {
        cwd: import.meta.dirname,
        encoding: 'utf-8',
      },
    );
    assert.strictEqual(result.status, 0, result.stderr);
  });

  it('should run log-with-feature-detection without error', () => {
    const result = spawnSync(
      process.execPath,
      ['log-with-feature-detection'],
      {
        cwd: import.meta.dirname,
        encoding: 'utf-8',
      },
    );
    assert.strictEqual(result.status, 0, result.stderr);
    assert.match(result.stdout, /An error occurred/);
  });
});
