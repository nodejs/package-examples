
//! [doc]
let a;
function runOnlyWhenUsed() {
  a = require('./a.mjs');
}
//! [doc]

exports.runOnlyWhenUsed = runOnlyWhenUsed;
