# thoughts

if we make classes in dta access layer, we have to wait for db operations, which means promises and waiting for them, while server.get, we just implement the function handler

why make class in data access when no function will call them, they are called remotely
We make classes to simplify code on ourselves

#

User


for async functions, I have two options:
either to wrap them in a promise and wait them
or use call back provided by the functions itself

The second is Perfect, bc in the server we don't have a workflow, we just have **request** **response**
The server will not wait for database things
In fact the first is Horrible

```js
import sqlite3 from "sqlite3";
const db = new sqlite3.Database('users.db');
class User
{
	static async getAll()
	{
		const rows = await all('SELECT * FROM users');
		return rows;
	}
}
async function all(sql, params = []) {
    return new Promise((resolve) => {
        db.all(sql, params, (err, rows) => { 
			if (err)
				console.error('Error: ', err);
			else
			{
				resolve(rows);
			}
		});
    });
}
User.getAll().then(rows => {
	console.log(rows);
});
```

use call back

```js
class User
{
	static getAll(sql, params)
	{
		db.all(sql, params, (err, rows) => { 
			if (err)
				console.error('Error: ', err);
			else
			{
				console.log(rows);
			}
		});
	}
}

User.getAll("select * from users");
```

# making things simple

```js

function requestHandler(request, reply)
{
	function readDataHandler(err, rows)
	{ 
		if (err)
		{
			console.error('Error: ', err);
			return undefined;
		}
		else
		{
			reply.send(rows);
		}
	}
	db.all("select * from users", readDataHandler);
}
server.get('/data/user/getAll', requestHandler);

// the same as

server.get('/data/user/getAll', (request, reply) => {
	db.all("select * from users", (err, rows) => {
		if (err)
		{
			console.error('Error: ', err);
			return undefined;
		}
		else
		{
			reply.send(rows);
		}
	});
} );

```

They all work async and call callback function afterwards
