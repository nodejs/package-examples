import { describe, it } from 'node:test';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert';

describe('simple-esm', () => {
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
});
