// User.js
export class User {
    constructor(id, username) {
        this.id = id;
        this.username = username;
    }

    greet() {
        console.log(`Hello, my name is ${this.username}!`);
    }
}

console.log('Hello from User.js.');
