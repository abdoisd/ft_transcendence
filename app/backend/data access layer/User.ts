
import sqlite3 from "sqlite3"; // import module
import { server } from "../server.ts"; // import variable
import { red, green, yellow, blue } from "../global.ts";

export class User
{
	Id: number;
	GoogleId: string;
	Username: string;
	AvatarPath: string | null; // set it to null if there is no, so we have null in db
	Wins: number;
	Losses: number;
	SessionId: string | null;
	ExpirationDate: Date | null;

	constructor(id: number, googleOpenID: string, username: string, avatarPath: string | null,
		wins: number, losses: number, sessionId: string | null = null, expirationDate: Date | null = null)
	{
		this.Id = id;
		this.GoogleId = googleOpenID;
		this.Username = username;
		this.AvatarPath = avatarPath;
		this.Wins = wins;
		this.Losses = losses;
		this.SessionId = sessionId;
		this.ExpirationDate = expirationDate;
	}
}

// database creation
export const db = new sqlite3.Database('ft_transcendence', (err) =>
{
	if (err)
		console.error(red, 'Error when creating the database', err);
	else
		console.log(green, 'Database opened');
});

// users table
db.run(`
	CREATE TABLE IF NOT EXISTS Users (
	    Id INTEGER PRIMARY KEY AUTOINCREMENT,
	    GoogleId TEXT NOT NULL,
	    Username TEXT NULL DEFAULT NULL,
	    AvatarPath TEXT NULL DEFAULT NULL,
	    Wins INTEGER NOT NULL DEFAULT 0,
	    Losses INTEGER NOT NULL DEFAULT 0,
	    SessionId TEXT NULL DEFAULT NULL,
	    ExpirationDate TEXT NULL DEFAULT NULL
	);
`, (err) => {
	if (err)
		console.error(red, 'Error creating table Users', err);
	else
		console.log(green, 'Table Users ready');
});

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
	});

	server.get('/data/user/getById', (request, reply) => {
		const Id = (request.query as { Id: number }).Id; // the query string is a json object: url ? Id=${encodeURIComponent(Id)
		db.get("select * from users where Id = ?", [Id], (err, row) => {
			if (err)
			{
				console.error('Error: get /data/user/getById: ', err);
				reply.status(500).send();
			}
			else
			{
				if (!row) // user not found
				{
					console.log(red, 'get /data/user/getByUsername: User not found: ', Id);
					reply.status(404).send();
				}
				reply.send(row); // user object as in body as a stringified json
			}
		});
	});

	server.get('/data/user/getByGoogleId', (request, reply) => {
		const GoogleId: number = (request.query as { GoogleId: number }).GoogleId; // the query string is a json object: url ? Id=${encodeURIComponent(Id)
		db.get("select * from users where GoogleId = ?", [GoogleId], (err, row) => {
			if (err)
			{
				console.error('Error: get /data/user/getByGoogleId: ', err);
				reply.status(500).send();
			}
			else
			{
				if (!row) // user not found
				{
					console.log(red, 'get /data/user/getByGoogleId: User not found: ', GoogleId);
					reply.status(404).send();
				}
				reply.send(row); // user object as in body as a stringified json
			}
		});
	});

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

	server.post('/data/user/add', (request, reply) => { // fastify that handle domain and port

		const user: User = request.body as User; // fastify request.body convert from string to json automatically

		db.run("INSERT INTO Users (GoogleId, Username, AvatarPath, SessionId, ExpirationDate) VALUES (?, ?, ?, ?, ?);",
			[user.GoogleId, user.Username, user.AvatarPath], function(err) {
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
					reply.send({ Id: this.lastID });
			}
		});
	});

	server.post('/data/user/update', (request, reply) => {
		const user: User = request.body as User;
		db.run("update users set Username = ?, AvatarPath = ?, Wins = ?, Losses = ?, SessionId = ?, ExpirationDate = ? where Id = ?",
			[user.Username, user.AvatarPath, user.Wins, user.Losses, user.SessionId, user.ExpirationDate, user.Id], function(err) {
			if (err)
			{
				console.log(red, 'Error: get /data/user/update: ', err); // whyyyyyy
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
		const { Id } = request.query as { Id: number };
		db.run("delete from users where id = ?", [Id], function(err) {
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

// WHEN YOU UPDATE SOMETHING
// ? number == params number
// valid: /data/user/delete
