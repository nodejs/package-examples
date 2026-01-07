import myModule from 'my-module/dynamic-exports';
console.log('foo' in myModule); // true, even though it's undefined
console.log('bar' in myModule); // true, even though it's undefined
myModule.initialize('foo');
console.log('foo' in myModule); // true
console.log('bar' in myModule); // true
