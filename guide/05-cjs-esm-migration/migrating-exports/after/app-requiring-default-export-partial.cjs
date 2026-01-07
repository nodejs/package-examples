// The returned value is actually { default: [Function: qux] }
const qux = require('my-module/default-export-partial');
qux(); // Throws TypeError: qux is not a function
