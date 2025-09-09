import { db } from "./database.ts";
import { red, green, yellow, blue } from "../global.ts";
import path from "path";
import fs from "fs";
import { connectedToSqlite, server } from "../server.ts"; // import variable
import util from "util";

export class User
{
	Id: number;
	GoogleId: string;
	Username: string;
	AvatarPath: string | null;
	Wins: number;
	Losses: number;
	SessionId: string | null;
	ExpirationDate: Date | null;
	LastActivity: Date | null;

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

	// can be static and normal
	// like a view
	static getFriends(Id: number): Promise<any[] | null>
	{
		return new Promise((resolve, reject) => {
			db.all('SELECT u.* FROM Users u JOIN Relationships r ON (u.Id = r.User1Id AND r.User2Id = ?) OR (u.Id = r.User2Id AND r.User1Id = ?) WHERE r.Relationship = 1', [Id, Id], (err, rows) => {
				if (err)
					reject(null);
				else
					resolve(rows);
			});
		});
	}
}

export function UserRoutes()
{
	//?
	server.decorate('verifyJWTGetUser', async (request, reply) => {
		try
		{
			await request.jwtVerify();
			const payload = request.user;

			console.log(yellow, 'JWT payload:', payload);
			console.log(yellow, request.url);

			// tmp
			if (payload.IsRoot)
			{
				console.log(yellow, 'Admin access granted');
				return ;
			}
		}
		catch (err)
		{
			return reply.status(401).send({ error: err }); // Unauthorized
		}
	});

	server.decorate('verifyJWTUpdateUser', async (request, reply) => {
		try
		{
			await request.jwtVerify();
			const payload = request.user;

			console.log(yellow, 'JWT payload:', payload);
			console.log(yellow, request.url);

			// tmp
			if (payload.IsRoot)
			{
				console.log(yellow, 'Admin access granted');
				return ;
			}
			
			// if user id and not the same in id in token, reject
			if (request.method == "PUT")
			{
				const user = request.body;
				if (user.Id !== payload.Id)
					return reply.status(403).send({ error: 'Forbidden' }); // Forbidden
			}
			else if (request.method == "DELETE" || request.method == "GET") // get for friends
			{
				const Id = (request.query as { Id: number }).Id;
				if (Id != payload.Id)
					return reply.status(403).send({ error: 'Forbidden' }); // Forbidden
			}
		}
		catch (err)
		{
			return reply.status(401).send({ error: err }); // Unauthorized
		}
	});
	
	server.get('/data/user/getAll', { preHandler: server.verifyJWTGetUser }, (request, reply) => {
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

	server.get('/data/user/getById', { preHandler: server.verifyJWTGetUser }, (request, reply) => {
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
					console.log(red, 'get /data/user/getById: User not found: ', Id);
					reply.status(404).send();
				}
				reply.send(row); // user object as in body as a stringified json
			}
		});
	});
	/**
		response looks like:
		{
		  "Id": 1,
		  "GoogleId": "123",
		  "Username": "john",
		  "AvatarPath": "john.png",
		  "Wins": 10,
		  "Losses": 5,
		  "SessionId": null,
		  "ExpirationDate": null,
		  "AvatarUrl": "/uploads/avatars/john.png"
		}
	*/

	// serving avatars
	server.get('/data/user/getAvatarById', (request, reply) => {
		const Id = (request.query as { Id: number }).Id; // the query string is a json object: url ? Id=${encodeURIComponent(Id)

		// get the avatar path
		db.get("SELECT AvatarPath FROM users WHERE Id = ?", [Id], (err, row) => {

			const defaultAvatarPath = "./avatars/default-avatar.png";

			reply.type("image/png"); // set content-type
			
			if (err) // database error
			{
				console.error('Error: /data/user/getAvatarById:', err);
				fs.createReadStream(defaultAvatarPath).pipe(reply.raw);
				return ;
			}

			// user not found !
			if (!row || !row.AvatarPath) {
				console.debug(blue, 'Not Serving the proper avatar 1');
				fs.createReadStream(defaultAvatarPath).pipe(reply.raw);
				return ;
			}

			// Full avatar path
			const filePath = path.join(process.cwd(), "avatars", row.AvatarPath);

			// file not found in the dir
			if (!fs.existsSync(filePath))
			{
				console.debug(blue, 'Not Serving the proper avatar');
				fs.createReadStream(defaultAvatarPath).pipe(reply.raw);
				return ;
			}	

			// Send the image file
			console.debug(blue, 'Serving the proper avatar');
			fs.createReadStream(filePath).pipe(reply.raw); // Take the file and send it to the browser chunk by chunk until it’s done
			// A file stream is a way to read or write a file piece by piece, instead of loading the entire file into memory at once
			// in c, we use read
		});
	});

	server.get('/data/user/getByGoogleId', { preHandler: server.verifyJWTGetUser }, (request, reply) => {
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

	server.get('/data/user/getByUsername', { preHandler: server.verifyJWTGetUser }, (request, reply) => {
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
		db.run("INSERT INTO Users (GoogleId, Username, AvatarPath, SessionId, ExpirationDate, LastActivity) VALUES (?, ?, ?, ?, ?, ?);",
			[user.GoogleId, user.Username, user.AvatarPath, null, null, new Date()], function(err) {
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

	server.put('/data/user/update', { preHandler: server.verifyJWTUpdateUser }, (request, reply) => {
		const user: User = request.body as User;
		db.run("update users set Username = ?, AvatarPath = ?, Wins = ?, Losses = ?, SessionId = ?, ExpirationDate = ?, LastActivity = ? where Id = ?",
			[user.Username, user.AvatarPath, user.Wins, user.Losses, user.SessionId, user.ExpirationDate, new Date(), user.Id], function(err) {
			if (err)
			{
				console.log(red, 'Error: get /data/user/update: ', err); // why
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

	server.delete('/data/user/delete', { preHandler: server.verifyJWTUpdateUser }, (request, reply) => {
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

	// 

	// get friends
	server.get('/data/user/getFriends', { preHandler: server.verifyJWTUpdateUser }, async (request, reply) => {
		const Id = (request.query as { Id: number }).Id;
		reply.send(await User.getFriends(Id));
	});

	// select id and username from users
}

// WHEN YOU UPDATE SOMETHING
// ? number == params number
// valid: /data/user/delete
