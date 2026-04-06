// This used to be `module.exports` when the module was CommonJS,
// but after the migration, the default export is missing unless explicitly provided,
// so it would throw a SyntaxError.
import myModule from 'my-module/named-only-partial';
