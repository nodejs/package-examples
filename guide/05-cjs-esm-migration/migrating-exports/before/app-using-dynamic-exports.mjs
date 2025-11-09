import myModule from 'my-module/dynamic-exports';
console.log('foo' in myModule); // false
console.log('bar' in myModule); // false
myModule.initialize('foo');
console.log('foo' in myModule); // true
console.log('bar' in myModule); // false
