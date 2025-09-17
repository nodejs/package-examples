'use strict';

const { describe, it } = require('node:test');
const { spawnSync } = require('node:child_process');
const assert = require('node:assert');

describe('classic-commonjs', () => {
  it('should run app.cjs without error', () => {
    const result = spawnSync(
      process.execPath,
      ['app.cjs'],
      {
        cwd: __dirname,
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
        cwd: __dirname,
        encoding: 'utf-8',
      },
    );
    assert.strictEqual(result.status, 0, result.stderr);
    assert.match(result.stdout, /This is an error message/);
  });
});
