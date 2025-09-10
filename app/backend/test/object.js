// const empty = {};

// const keyValue = { key: 'value' };

// const manyKeyValues = {
// 	key1: 'value1',
// 	key2: 'value2'
// };

// const arrayOfObjects = [
// 	{ key: 'value' },
// 	{
// 		key1: 'value1',
// 		key2: 'value2'
// 	}
// ];

// console.log("printing an empty object: ", empty);
// console.log("printing a key-value pair object: ", keyValue);
// console.log("printing multiple key-value pairs object: ", manyKeyValues);
// console.log("printing an array of objects: ", arrayOfObjects);

// class User
// {
// 	Name;
// 	Age;
// }

// const obj = {
// 	Name: "Alice",
// 	Age: 30
// }

// console.log(obj); // obj prints { Name: 'Alice', Age: 30 }
// const user = Object.assign(new User(), obj);
// console.log(user); // class prints User { Name: 'Alice', Age: 30 }

// const target = { a: 1, b: 2 };
// const source = { b: 4, c: 5 };

// const result = Object.assign(target, source);

// console.log(result); // { a: 1, b: 4, c: 5 }
// console.log(target); // { a: 1, b: 4, c: 5 } (target is modified!)


const obj1 = { a: 1, b: 2 };
const copy = { ...obj1 }; // create new obj
// const copy = obj1; // same obj
console.log(copy);
console.log(copy === obj1);
