
import sqlite3 from "sqlite3"; // import module
import { server } from "../server.ts"; // import object

class User
{
	ID: number;
	GoogleOpenID: string;
	Username: string;
	AvatarPath: string | null; // set it to null if there is no, so database insert null
	Wins: number;
	Losses: number;

	constructor(id: number, googleOpenID: string, username: string, avatarPath: string | null, wins: number, losses: number)
	{
		this.ID = id;
		this.GoogleOpenID = googleOpenID;
		this.Username = username;
		this.AvatarPath = avatarPath;
		this.Wins = wins;
		this.Losses = losses;
	}
}

const red: string = "\x1b[31m%s\x1b[0m";

// new sqlite3.Database(filename [, mode] [, callback])
export const db = new sqlite3.Database('users.db');

// run(sql [, param, ...] [, callback])
db.run(`
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT UNIQUE NOT NULL,
		password TEXT NOT NULL,
		avatarPath TEXT NULL
	);
`);

console.log("hello from User.ts"); // logging with colors

export function UserRoutes()
{
	server.get('/data/user/getAll', (request, reply) => {
		db.all("select * from users", (err, rows) => {
			if (err)
			{
				console.log(red, 'Error: get /data/user/getAll: ', err);
				reply.status(500).send();
			}
			else
			{
				if (rows.length < 1) // empty set
					reply.status(404).send({ message: 'No users found' });
				reply.send(rows);
			}
		});
	} );

	server.get('/data/user/getByUsername', (request, reply) => {
		const username = (request.query as { username: string }).username;
		db.get("select * from users where username = ?", [username], (err, row) => {
			if (err)
			{
				console.error('Error: get /data/user/getByUsername: ', err);
				reply.status(500).send();
			}
			else
			{
				if (!row) // user not found
				{
					console.log(red, 'get /data/user/getByUsername: User not found: ', username);
					reply.status(404).send();
				}
				reply.send(row); // user object as in body as a stringified json
			}
		});
	});

	server.post('/data/user/add', (request, reply) => {

		const user: User = request.body as User; // fastify request.body convert from string to json automatically

		db.run("INSERT INTO Users (GoogleOpenID, Username, AvatarPath, Wins, Losses) VALUES (?, ?, ?, ?, ?);",
			[user.GoogleOpenID, user.Username, user.AvatarPath, user.AvatarPath, user.Wins, user.Losses], function(err) {
			if (err)
			{
				console.log(red, 'Error: get /data/user/add: ', err);
				reply.status(500).send();
			}
			else
			{
				if (this.changes < 1)
					reply.status(500).send();
				else
					reply.send({ userID: this.lastID });
			}
		});
	});

	server.post('/data/user/update', (request, reply) => {
		const user: User = request.body as User;
		db.run("UPDATE Users SET Username = ?, AvatarPath = ?, Wins = ?, Losses = ? WHERE Id = ?;",
			[user.Username, user.AvatarPath, user.Wins, user.Losses, user.ID], function(err) {
			if (err)
			{
				console.log(red, 'Error: get /data/user/update: ', err);
				reply.status(500).send();
			}
			else
			{
				if (this.changes < 1)
					reply.status(500).send();
				else
					reply.send();
			}
		});
	});

	server.post('/data/user/delete', (request, reply) => {
		const { id } = request.query as { id: number };
		db.run("delete from users where id = ?", [id], function(err) {
			if (err)
			{
				console.log(red, 'Error: get /data/user/delete: ', err);
				reply.status(500).send();
			}
			else
			{
				if (this.changes < 1)
					reply.status(500).send();
				else
					reply.send();
			}
		});
	});
}
