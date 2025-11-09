const { getModuleInfo } = require('my-module');
const info = getModuleInfo();
console.log('Filename:', info.filename);
console.log('Dirname:', info.dirname);
console.log('Is main from module: ' + info.isMain);
console.log('Is main from main: ' + (require.main === module));
