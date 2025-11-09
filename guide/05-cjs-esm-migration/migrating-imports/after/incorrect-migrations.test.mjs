import assert from 'node:assert';
import { describe, it } from 'node:test';

describe('migrating-imports', () => {
  describe('after', () => {
    describe('incorrect-migrations', () => {
      it('should fail when importing undetectable named imports from CommonJS', async () => {
        await assert.rejects(
          import('my-module/import-undetectable-invalid'),
          { name: 'SyntaxError' }
        );
      });
      it('should fail when importing a path without file extension', async () => {
        await assert.rejects(
          import('my-module/load-without-extension'),
          { code: 'ERR_MODULE_NOT_FOUND' }
        );
      });
      it('should fail when importing directory directly', async () => {
        await assert.rejects(
          import('my-module/import-dir'),
          { code: 'ERR_UNSUPPORTED_DIR_IMPORT' }
        );
      });
    });
  });
});
