class User {
	constructor(name?, age?) {
	  this.name = name;
	  this.age = age;
	}
  
	greet() {
	  console.log(`Hi, I'm ${this.name}, ${this.age} years old.`);
	}
}

// object literal to object
const obj = { name: "Alice", age: 25 };
const user: User = Object.assign(new User(), obj); // must
user.greet();

// object to object literal
const user2 = new User("Bob", 30);
const obj2 = user2; // works
console.log(obj);
