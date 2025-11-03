import { describe, it } from 'node:test';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert';

describe('shipping-cjs-for-esm', () => {
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
    assert.match(result.stdout, /\[debug\] Hello from CommonJS/);
  });

  it('should run app-default-export.mjs without error', () => {
    const result = spawnSync(
      process.execPath,
      ['app-default-export.mjs'],
      {
        cwd: import.meta.dirname,
        encoding: 'utf-8',
      },
    );
    assert.strictEqual(result.status, 0, result.stderr);
    assert.match(result.stdout, /\[debug\] Hello from ESM/);
  });

  it('should run app-dynamic-import.mjs without error', () => {
    const result = spawnSync(
      process.execPath,
      ['app-dynamic-import.mjs'],
      {
        cwd: import.meta.dirname,
        encoding: 'utf-8',
      },
    );
    assert.strictEqual(result.status, 0, result.stderr);
    assert.match(result.stdout, /\[debug\] Hello from dynamic import/);
  });

  it('should run app-namespace-import.mjs without error', () => {
    const result = spawnSync(
      process.execPath,
      ['app-namespace-import.mjs'],
      {
        cwd: import.meta.dirname,
        encoding: 'utf-8',
      },
    );
    assert.strictEqual(result.status, 0, result.stderr);
    assert.match(result.stdout, /\[debug\] Hello from namespace import/);
  });

  it('should run app-import-exports-assignment.mjs without error', () => {
    const result = spawnSync(
      process.execPath,
      ['app-import-exports-assignment.mjs'],
      {
        cwd: import.meta.dirname,
        encoding: 'utf-8',
      },
    );
    assert.strictEqual(result.status, 0, result.stderr);
    assert.match(result.stdout, /\[info\] Hello from Logger/);
    assert.match(result.stdout, /\[warn\] Hello from LoggerAlias/);
  });

  it('should run app-import-module-exports-assignment.mjs without error', () => {
    const result = spawnSync(
      process.execPath,
      ['app-import-module-exports-assignment.mjs'],
      {
        cwd: import.meta.dirname,
        encoding: 'utf-8',
      },
    );
    assert.strictEqual(result.status, 0, result.stderr);
    assert.match(result.stdout, /\[debug\] Hello from default logger/);
    assert.match(result.stdout, /\[info\] Hello from custom Logger/);
    assert.match(result.stdout, /\[error\] Hello from LoggerAlias/);
  });

  it('should run app-namespace-named-exports.mjs without error', () => {
    const result = spawnSync(
      process.execPath,
      ['app-namespace-named-exports.mjs'],
      {
        cwd: import.meta.dirname,
        encoding: 'utf-8',
      },
    );
    assert.strictEqual(result.status, 0, result.stderr);
    assert.match(result.stdout, /\[debug\] Hello from namespace with named exports/);
    assert.match(result.stdout, /\[info\] Hello from namespace Logger/);
  });

  it('should run app-dynamic-named-exports.mjs without error', () => {
    const result = spawnSync(
      process.execPath,
      ['app-dynamic-named-exports.mjs'],
      {
        cwd: import.meta.dirname,
        encoding: 'utf-8',
      },
    );
    assert.strictEqual(result.status, 0, result.stderr);
    assert.match(result.stdout, /\[debug\] Hello from dynamic import with named exports/);
    assert.match(result.stdout, /\[trace\] Hello from dynamic Logger/);
    assert.match(result.stdout, /\[debug\] Hello from dynamic LoggerAlias/);
  });

  it('should run app-object-literal.mjs without error', () => {
    const result = spawnSync(
      process.execPath,
      ['app-object-literal.mjs'],
      {
        cwd: import.meta.dirname,
        encoding: 'utf-8',
      },
    );
    assert.strictEqual(result.status, 0, result.stderr);
    assert.match(result.stdout, /\[warn\] Hello from object literal Logger/);
  });

  it('should fail when trying to import named export from my-logger-dynamic', () => {
    const result = spawnSync(
      process.execPath,
      ['app-dynamic-fail.mjs'],
      {
        cwd: import.meta.dirname,
        encoding: 'utf-8',
      },
    );
    assert.notStrictEqual(result.status, 0);
    assert.match(result.stderr, /SyntaxError: Named export 'Logger' not found/);
  });
});
