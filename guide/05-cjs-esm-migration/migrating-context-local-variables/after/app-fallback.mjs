import { getModuleInfo } from 'my-module/index-fallback.js';
const info = getModuleInfo();
console.log('Filename:', info.filename);
console.log('Dirname:', info.dirname);
console.log('URL:', info.url);
