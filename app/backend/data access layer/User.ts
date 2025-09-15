import { db } from "./database.ts";
import { red, green, yellow, blue } from "../global.ts";
import path from "path";
import fs from "fs";
import { server } from "../server.ts"; // import variable

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
	TOTPSecretPending: string; // not in dto
	TOTPSecret: string; // not in dto

	constructor(id: number, googleOpenID: string, username: string, avatarPath: string | null,
		wins: number, losses: number, sessionId: string | null = null, expirationDate: Date | null = null,
		lastActivity?, TOTPSecretPending?, TOTPSecret?)
	{
		this.Id = id;
		this.GoogleId = googleOpenID;
		this.Username = username;
		this.AvatarPath = avatarPath;
		this.Wins = wins;
		this.Losses = losses;
		this.SessionId = sessionId;
		this.ExpirationDate = expirationDate;
		this.LastActivity = lastActivity;
		this.TOTPSecretPending = TOTPSecretPending;
		this.TOTPSecret = TOTPSecret;
	}

	static async getById(Id: number): Promise<User | null>
	{
		return new Promise((resolve, reject) => {
			db.get('SELECT * FROM Users WHERE Id = ?', [Id], (err, row) => {
				if (err)
				{
					console.log(red, 'Error: User.getById: ', err);
					reject(null);
				}
				else
					resolve(row ? new User(row.Id, row.GoogleId, row.Username, row.AvatarPath, row.Wins, row.Losses, row.SessionId, row.ExpirationDate, row.LastActivity, row.TOTPSecretPending, row.TOTPSecret) : null);
			});
		});
	}

	// get by username
	static async getByUsername(username: string): Promise<User | null> // how to know, now found from here
	{
		// promise with background task
		return new Promise((resolve, reject) => {
			db.get('SELECT * FROM Users WHERE Username = ?', [username], (err, row) => {
				if (err)
				{
					console.log(red, 'Error: User.getByUsername: ', err);
					reject(null);
				}
				else
					resolve(row ? new User(row.Id, row.GoogleId, row.Username, row.AvatarPath, row.Wins, row.Losses, row.SessionId, row.ExpirationDate, row.LastActivity) : null);
			});
		});
	}

	add()
	{
		return new Promise((resolve, reject) => {
			db.run("INSERT INTO Users (GoogleId, Username, AvatarPath, SessionId, ExpirationDate, LastActivity) VALUES (?, ?, ?, ?, ?, ?);",
				[this.GoogleId, this.Username, this.AvatarPath, this.SessionId, this.ExpirationDate, new Date()], function(err) {
				if (err)
				{
					console.log(red, 'Error: User.add: ', err);
					reject(null);
				}
				else
					resolve(this.lastID);
			});
		});
	}

	update()
	{
		return new Promise((resolve, reject) => {
			db.run("UPDATE Users SET GoogleId = ?, Username = ?, AvatarPath = ?, Wins = ?, Losses = ?, SessionId = ?, ExpirationDate = ?, LastActivity = ?, TOTPSecretPending = ?, TOTPSecret = ? WHERE Id = ?",
				[this.GoogleId, this.Username, this.AvatarPath, this.Wins, this.Losses, this.SessionId, this.ExpirationDate, new Date(), this.TOTPSecretPending, this.TOTPSecret, this.Id], function(err) {
				if (err)
				{
					console.log(red, 'Error: User.update: ', err);
					reject(false);
				}
				else
					resolve(this.changes > 0);
			});
		});
	}

	// can be static and normal
	// like a view
	static getFriends(Id: number): Promise<any[] | null>
	{
		return new Promise((resolve, reject) => {
			db.all('SELECT u.Id, u.Username, u.Wins, u.Losses, u.LastActivity FROM Users u JOIN Relationships r ON (u.Id = r.User1Id AND r.User2Id = ?) OR (u.Id = r.User2Id AND r.User1Id = ?) WHERE r.Relationship = 1', [Id, Id], (err, rows) => {
				if (err)
				{
					console.log(red, 'Error: User.getById: ', err);
					reject(null); // to test those
				}
				else
					resolve(rows);
			});
		});
	}

	enabled2FA(): boolean
	{
		// has TOTPSecret in db
		return this.TOTPSecret != null && this.TOTPSecret != '';
	}
}

// to send user info to client
// get all
// get by ...
class UserDTO
{
	Id: number;
	Username: string;
	Wins: number;
	Losses: number;
	LastActivity: Date | null;

	constructor(fullUser: User)
	{
		this.Id = fullUser.Id;
		this.Username = fullUser.Username;
		this.Wins = fullUser.Wins;
		this.Losses = fullUser.Losses;
	}

	// get by username
	static async getByUsername(username: string)
	{
		const fullUser = await User.getByUsername(username);
		if (!fullUser)
			return null;
		const userDTO = new UserDTO(fullUser);
		return userDTO;
	}

	static async getById(Id: number)
	{
		const fullUser = await User.getById(Id);
		if (!fullUser)
			return null;
		const userDTO = new UserDTO(fullUser);
		return userDTO;
	}
}

export function UserRoutes()
{
	server.decorate('mustHaveToken', async (request, reply) => {
		try
		{
			await request.jwtVerify();
			const payload = request.user;

			// console.log(yellow, 'JWT payload:', payload);

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

	server.decorate('byItsOwnUser', async (request, reply) => {
		try
		{
			await request.jwtVerify();

			const payload = request.user;

			if (payload.IsRoot)
			{
				console.log(yellow, 'Admin access granted');
				return ;
			}

			// console.debug(yellow, "here 1")

			if (request.method == "PUT")
			{
				const user = request.body;
				if (user.Id != payload.Id)
					return reply.status(403).send({ error: 'Forbidden' }); // Forbidden
			}
			else if (request.method == "DELETE" || request.method == "GET") // get for friends
			{

			// console.debug(yellow, "here 2")

				const Id = request.query.Id;
				if (!Id) // google id
				{
					const GoogleId = request.query.GoogleId;
					if (!GoogleId)
						return reply.status(400).send(); // Bad request
				
					// if (GoogleId != payload.GoogleId)
					// 	return reply.status(403).send({ error: 'Forbidden' });

					// set google id in payload or request user info here

					const user = await User.getById(payload.Id);
					if (GoogleId != user.GoogleId)
						return reply.status(403).send({ error: 'Forbidden' });
				}
				else
				{
			// console.debug(yellow, "here 3")

					if (Id != payload.Id)
						return reply.status(403).send({ error: 'Forbidden' }); // Forbidden
				}
			}
		}
		catch (err)
		{
			// console.debug(yellow, "here 4")
			return reply.status(401).send({ error: err }); // Unauthorized
		}
	});

	server.get('/data/user/getById2', { preHandler: server.mustHaveToken }, async (request, reply) => {
		const Id = (request.query as { Id: number }).Id;
		const user = await UserDTO.getById(Id);
		if (user)
			reply.send(user); // send dto
		else
			reply.status(404).send();
		
	});
	
	server.get('/data/user/getById', { preHandler: server.byItsOwnUser }, (request, reply) => {
		const Id = (request.query as { Id: number }).Id;
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
				console.error(red, 'Error: /data/user/getAvatarById:', err);
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

	server.get('/data/user/getByGoogleId', { preHandler: server.byItsOwnUser }, (request, reply) => {
		const GoogleId: number = (request.query as { GoogleId: number }).GoogleId; // the query string is a json object: url ? Id=${encodeURIComponent(Id)
		db.get("select * from users where GoogleId = ?", [GoogleId], (err, row) => {
			if (err)
			{
				console.error(red, 'Error: get /data/user/getByGoogleId: ', err);
				reply.status(500).send();
			}
			else
			{
				if (!row) // user not found
				{
					console.log(red, 'get /data/user/getByGoogleId: User not found: ', GoogleId);
					reply.status(404).send();
					return ;
				}
				reply.send(row); // user object as in body as a stringified json
			}
		});
	});

	// returned 500
	server.get('/data/user/getByUsername', { preHandler: server.mustHaveToken }, async (request, reply) => {
		const username = request.query.username;
		const res = await UserDTO.getByUsername(username);
		if (res)
			reply.send(res);
		else
			reply.status(404).send();
	});

	// // removed, bc it updates sensitive data
	// server.put('/data/user/update', { preHandler: server.byItsOwnUser }, (request, reply) => {

	// 	console.info(green, "PUT users");
		
	// 	const user = request.body;
		
	// 	db.run("update users set Username = ?, AvatarPath = ?, Wins = ?, Losses = ?, SessionId = ?, ExpirationDate = ?, LastActivity = ?, TOTPSecretPending = ?, TOTPSecret = ? where Id = ?",
	// 		[user.Username, user.AvatarPath, user.Wins, user.Losses, user.SessionId, user.ExpirationDate, new Date(), user.TOTPSecretPending, user.TOTPSecret, user.Id], function(err) {
	// 		if (err) // useless bc database throws to server and server return 500
	// 		{
	// 			console.log(red, 'Error: get /data/user/update: ', err);
	// 			reply.status(500).send();
	// 		}
	// 		else
	// 		{
	// 			if (this.changes < 1)
	// 				reply.status(500).send();
	// 			else
	// 				reply.send();
	// 		}
	// 	});
	// });

	server.delete('/data/user/delete', { preHandler: server.byItsOwnUser }, (request, reply) => {
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
	server.get('/data/user/getFriends', { preHandler: server.byItsOwnUser }, async (request, reply) => {
		const Id = (request.query as { Id: number }).Id;
		reply.send(await User.getFriends(Id));
	});

	server.get('/data/user/enabled2FA', async (request, reply) => {
		const Id = (request.query as { Id: number }).Id; // if id is not in query, fastify send by request
		const user = await User.getById(Id);
		if (!user)
			return reply.status(404).send(); // there is a problem in the logic
		if (user.enabled2FA())
			reply.status(200).send();
		else
			reply.status(404).send();
	});
}

// WHEN YOU UPDATE SOMETHING
// ? number == params number
// valid: /data/user/delete
