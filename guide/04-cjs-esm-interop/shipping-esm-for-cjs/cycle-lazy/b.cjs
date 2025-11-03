let a;
function runOnlyWhenUsed() {
  a = require('./a.mjs');
  console.log('Loaded lazily:', a.getValue());
}

exports.runOnlyWhenUsed = runOnlyWhenUsed;
