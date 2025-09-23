import { db } from "./database.ts";
import { red, green, yellow, blue } from "../global.ts";
import path from "path";
import fs from "fs";
import { server } from "../server.ts"; // import variable
import { guid } from "../global.ts";
import { clsGame } from "./game.ts";
import { pipeline } from "stream/promises";
import { createTables } from "./chat.ts";

db.run(`
	CREATE TABLE IF NOT EXISTS Users (
		Id INTEGER PRIMARY KEY AUTOINCREMENT,
		GoogleId TEXT NOT NULL,
		Username TEXT NULL DEFAULT NULL,
		AvatarPath TEXT NULL DEFAULT NULL,
		Wins INTEGER NOT NULL DEFAULT 0,
		Losses INTEGER NOT NULL DEFAULT 0,
		SessionId TEXT NULL DEFAULT NULL,
		ExpirationDate TEXT NULL DEFAULT NULL,
		LastActivity TEXT NULL DEFAULT NULL,
		TOTPSecretPending TEXT NULL DEFAULT NULL,
		TOTPSecret TEXT NULL DEFAULT NULL
	);
`, (err) => {
	if (err)
		console.error(red, 'Error creating table Users', err);
	else {
		createTables();
		console.log(green, 'Table Users ready');
	}
});

export class User {
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
		lastActivity?, TOTPSecretPending?, TOTPSecret?) {
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

	static async getById(Id: number): Promise<User | null> {
		return new Promise((resolve, reject) => {
			db.get('SELECT * FROM Users WHERE Id = ?', [Id], (err, row) => {
				if (err) {
					console.log(red, 'Error: User.getById: ', err);
					reject(null);
				}
				else
					resolve(row ? new User((row as any).Id, (row as any).GoogleId, (row as any).Username, (row as any).AvatarPath, (row as any).Wins, (row as any).Losses, (row as any).SessionId, (row as any).ExpirationDate, (row as any).LastActivity, (row as any).TOTPSecretPending, (row as any).TOTPSecret) : null);
			});
		});
	}

	// get by username
	static async getByUsername(username: string): Promise<User | null> // how to know, now found from here
	{

		console.log(green, 'User.getByUsername');
		console.debug(yellow, 'Username: ', username);

		// promise with background task
		return new Promise((resolve, reject) => {
			db.get('SELECT * FROM Users WHERE Username = ?', [username], (err, row) => {
				if (err) {
					console.log(red, 'Error: User.getByUsername: ', err);
					reject(null);
				}
				else //*
					resolve(row ? new User((row as any).Id, (row as any).GoogleId, (row as any).Username, (row as any).AvatarPath, (row as any).Wins, (row as any).Losses, (row as any).SessionId, (row as any).ExpirationDate, (row as any).LastActivity) : null);
			});
		});
	}

	add(): Promise<number> {

		console.log(green, "User.add");
		console.debug(yellow, 'Adding: ', this);

		return new Promise((resolve, reject) => {
			db.run("INSERT INTO Users (GoogleId, Username, AvatarPath, SessionId, ExpirationDate, LastActivity) VALUES (?, ?, ?, ?, ?, ?);",
				[this.GoogleId, this.Username, this.AvatarPath, this.SessionId, this.ExpirationDate, new Date()], function (err) {
					if (err) {
						console.log(red, 'Error: User.add: ', err);
						reject(null);
					}
					else
						resolve(this.lastID);
				});
		});
	}

	//!
	update(): Promise<boolean> {
		console.log(green, 'User.update');
		console.debug(yellow, 'Updating: ', this);

		return new Promise((resolve, reject) => {
			db.run("UPDATE Users SET GoogleId = ?, Username = ?, AvatarPath = ?, Wins = ?, Losses = ?, SessionId = ?, ExpirationDate = ?, LastActivity = ?, TOTPSecretPending = ?, TOTPSecret = ? WHERE Id = ?",
				[this.GoogleId, this.Username, this.AvatarPath, this.Wins, this.Losses, this.SessionId, this.ExpirationDate, new Date(), this.TOTPSecretPending, this.TOTPSecret, this.Id], function (err) {
					if (err) {
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
	static getFriends(Id: number): Promise<any[] | null> {
		return new Promise((resolve, reject) => {
			db.all('SELECT u.Id, u.Username, u.Wins, u.Losses, u.LastActivity FROM Users u JOIN Relationships r ON (u.Id = r.User1Id AND r.User2Id = ?) OR (u.Id = r.User2Id AND r.User1Id = ?) WHERE r.Relationship = 1', [Id, Id], (err, rows) => {
				if (err) {
					console.log(red, 'Error: User.getById: ', err);
					reject(null); // to test those
				}
				else
					resolve(rows);
			});
		});
	}

	enabled2FA(): boolean {
		// has TOTPSecret in db
		return this.TOTPSecret != null && this.TOTPSecret != '';
	}
}

// to send user info to client
// get all
// get by ...
class UserDTO {
	Id: number;
	Username: string;
	Wins: number;
	Losses: number;
	LastActivity: Date | null;

	constructor(fullUser?: User) {
		if (fullUser) {
			this.Id = fullUser.Id;
			this.Username = fullUser.Username;
			this.Wins = fullUser.Wins;
			this.Losses = fullUser.Losses;
		}
	}

	// get by username
	static async getByUsername(username: string) {

		console.log(green, 'UserDTO.getByUsername');
		console.debug(yellow, 'Username: ', username);

		const fullUser = await User.getByUsername(username);
		if (!fullUser)
			return null;
		const userDTO = new UserDTO(fullUser);
		return userDTO;
	}

	static async getById(Id: number) {
		const fullUser = await User.getById(Id);
		if (!fullUser)
			return null;
		const userDTO = new UserDTO(fullUser);
		return userDTO;
	}

	//!
	async update() {

		// // get full user
		// const user: User = await User.getById(this.Id);
		// // copy what not null to user
		// for (const key of Object.keys(this)) {
		// 	if (this[key] !== null && key !== "Id") {
		// 		user[key] = this[key];
		// 	}
		// }

		// only safe dto data
		const user: User = await User.getById(this.Id);
		user.Username = this.Username;

		user.update();
	}
}

export function UserRoutes() {
	server.decorate('mustHaveToken', async (request, reply) => {
		try {
			await request.jwtVerify();
			const payload = request.user;

			// console.log(yellow, 'JWT payload:', payload);

			// tmp
			if (payload.IsRoot) {
				console.log(yellow, 'Admin access granted');
				return;
			}
		}
		catch (err) {
			return reply.status(401).send({ error: err }); // Unauthorized
		}
	});

	server.decorate('byItsOwnUser', async (request, reply) => {
		try {
			await request.jwtVerify();

			const payload = request.user;

			if (payload.IsRoot) {
				console.log(yellow, 'Admin access granted');
				return;
			}

			if (request.method == "PUT") {
				//! when we will update a user from frontend
				// if ((user.Id || request.params.id) != payload.Id)
				// 	return reply.status(403).send({ error: 'Forbidden' }); // Forbidden

				const user = request.body;
				// for /updateProfile/3 and update user
				if ((request.params.id || user.Id) != payload.Id)
					return reply.status(403).send(); // Forbidden

			}
			else if (request.method == "DELETE" || request.method == "GET") // get for friends
			{

				const Id = request.query.Id || request.params.id;
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
						return reply.status(403).send();
				}
				else {
					if (Id != payload.Id)
						return reply.status(403).send(); // Forbidden
				}
			}
			else if (request.method == "POST") {
				// relationship || upload profile
				const relationship = request.body;
				if ((relationship?.User1Id || request.params.id) != payload.Id)
					return reply.status(403).send();
			}
		}
		catch (err) {
			// console.debug(yellow, "here 4")
			return reply.status(401).send({ error: err }); // Unauthorized
		}
	});

	server.get('/data/user/getById', { preHandler: (server as any).mustHaveToken }, async (request, reply) => {
		const Id = (request.query as { Id: number }).Id;
		const user = await UserDTO.getById(Id);
		if (user)
			reply.send(user); // send dto
		else
			reply.status(404).send();

	});

	// why is this here
	// server.get('/data/user/getById', { preHandler: (server as any).byItsOwnUser }, (request, reply) => {
	// 	const Id = (request.query as { Id: number }).Id;
	// 	db.get("select * from users where Id = ?", [Id], (err, row) => {
	// 		if (err)
	// 		{
	// 			console.error('Error: get /data/user/getById: ', err);
	// 			reply.status(500).send();
	// 		}
	// 		else
	// 		{
	// 			if (!row) // user not found
	// 			{
	// 				console.log(red, 'get /data/user/getById: User not found: ', Id);
	// 				reply.status(404).send();
	// 			}
	// 			reply.send(row); // user object as in body as a stringified json
	// 		}
	// 	});
	// });

	// serving avatars
	server.get('/data/user/getAvatarById', (request, reply) => {

		// console.log(request.cookies);
		// if cookie is not for the user id, you can't get it

		const Id = (request.query as { Id: number }).Id;

		User.getById(Id)
			.then((user) => {

				// get the avatar path
				db.get("SELECT AvatarPath FROM users WHERE Id = ?", [Id], (err, row) => {

					const defaultAvatarPath = "./avatars/default-avatar.png";

					reply.type("image/png"); // set content-type

					if (err) // database error
					{
						console.error(red, 'Error: /data/user/getAvatarById:', err);
						if (!fs.existsSync(defaultAvatarPath)) {
							reply.status(500).send();
							return;
						}
						fs.createReadStream(defaultAvatarPath).pipe(reply.raw); // serve default
						return;
					}

					// user not found !
					if (!row || !(row as any).AvatarPath) {
						console.debug(blue, 'User not found in db or no avatar for him');
						if (!fs.existsSync(defaultAvatarPath)) {
							reply.status(500).send();
							return;
						}
						fs.createReadStream(defaultAvatarPath).pipe(reply.raw); // serve default
						return;
					}

					// Full avatar path
					const filePath = path.join(process.cwd(), "avatars", (row as any).AvatarPath);

					// if dir not found

					// if file not found
					if (!fs.existsSync(filePath)) {
						console.debug(blue, 'Avatar file not found, serving default');
						if (!fs.existsSync(defaultAvatarPath)) {
							reply.status(500).send();
							return;
						}
						fs.createReadStream(defaultAvatarPath).pipe(reply.raw);
						return;
					}

					// Send the image file
					console.debug(blue, 'Serving the proper avatar');
					reply.type("image/jpeg");
					fs.createReadStream(filePath).pipe(reply.raw); // readable stream pipe to writable stream
					// A file stream is a way to read or write a file piece by piece, instead of loading the entire file into memory at once
				});


			})


	});

	server.get('/data/user/getByUsername', { preHandler: (server as any).mustHaveToken }, async (request, reply) => {
		const { username } = request.query as { username: string }; // Cast request.query to include username

		if (!username || username.trim() == "" || username.length < 3 || username.length > 20 || !/^[a-zA-Z0-9_]+$/.test(username)) {
			return reply.status(400).send();
		}

		const res = await UserDTO.getByUsername(username);
		if (res)
			reply.send(res);
		else
			reply.status(404).send();
	});

	// what is this route for
	server.get('/data/user/getByGoogleId', { preHandler: (server as any).byItsOwnUser }, (request, reply) => {
		const GoogleId: number = (request.query as { GoogleId: number }).GoogleId; // the query string is a json object: url ? Id=${encodeURIComponent(Id)
		db.get("select * from users where GoogleId = ?", [GoogleId], (err, row) => {
			if (err) {
				console.error(red, 'Error: get /data/user/getByGoogleId: ', err);
				reply.status(500).send();
			}
			else {
				if (!row) // user not found
				{
					console.log(red, 'get /data/user/getByGoogleId: User not found: ', GoogleId);
					reply.status(404).send();
					return;
				}
				reply.send(row); // user object as in body as a stringified json
			}
		});
	});

	// return userDTO


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

	const updateUserSchema = {
		body: {
			type: 'object',
			required: ['Id', 'Username'],
			properties: {
				Id: { type: 'number' },
				Username: { type: "string", minLength: 3, maxLength: 20, pattern: "^[a-zA-Z0-9_]+$" } // str protect
			}
		}
	};

	server.put('/data/user/update', { preHandler: (server as any).byItsOwnUser, schema: updateUserSchema }, async (request, reply) => {

		const userObj = request.body as UserDTO;
		// obj to userDTO
		let user: UserDTO = new UserDTO();
		user.Id = userObj.Id;
		user.Username = userObj.Username;
		user.Wins = userObj.Wins;
		user.Losses = userObj.Losses;
		user.LastActivity = userObj.LastActivity;
		await user.update();

	});

	// server.delete('/data/user/delete', { preHandler: (server as any).byItsOwnUser }, (request, reply) => {
	// 	const { Id } = request.query as { Id: number };
	// 	db.run("delete from users where id = ?", [Id], function(err) {
	// 		if (err)
	// 		{
	// 			console.log(red, 'Error: get /data/user/delete: ', err);
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

	// 

	// get friends
	server.get('/data/user/getFriends', { preHandler: (server as any).byItsOwnUser }, async (request, reply) => {
		const Id = (request.query as { Id: number }).Id;
		reply.send(await User.getFriends(Id));
	});

	// problem if I added jwt checking
	server.get('/data/user/enabled2FA', async (request, reply) => {
		const Id = (request.query as { Id: number }).Id;
		const user = await User.getById(Id);
		if (!user)
			return reply.status(404).send();
		if (user.enabled2FA())
			reply.status(200).send();
		else
			reply.status(404).send();
	});

	// you must give it
	// id
	// username or avatar or both In multipart form data
	server.put("/updateProfile/:id", { preHandler: (server as any).byItsOwnUser }, async (req, reply) => {
		const parts = req.parts();

		let username: string | null = null;
		let avatarPath: string | null = null;
		let filename: string | null = null;

		// send files async (file by file)
		// each file content is also async (file chunk by file chunk)
		// parts is async iterable
		// part.file is stream what we can use one pipe/pipeline to write it chunk by chunk, or work with it like async iterable
		for await (const part of parts) {
			if (part.type === "file" && part.fieldname === "avatar") {

				filename = guid() + ".png";
				avatarPath = path.join(process.cwd(), "avatars", filename);

				const writeStream = fs.createWriteStream(avatarPath);
				pipeline(part.file, writeStream);

			} else if (part.type === "field" && part.fieldname === "username") {
				username = part.value as string;
			}
		}

		if (username) {
			if (
				username.trim() === "" ||
				username.length < 3 ||
				username.length > 20 ||
				!/^[a-zA-Z0-9_]+$/.test(username)
			) {
				return reply.status(400).send();
			}
		}

		const user: User = await User.getById((req.params as any).id);
		user.Username = username ?? user.Username;
		user.AvatarPath = filename ?? user.AvatarPath;
		await user.update(); // why wait

		reply.send();

	});

	// get user games
	server.get("/users/:id/games", { preHandler: (server as any).byItsOwnUser }, async (req, reply) => {

		console.log(green, 'GET /users/:id/games');
		console.debug(yellow, 'User ID: ', (req.params as any).id);

		const games: clsGame[] = await clsGame.getByUserId((req.params as any).id);
		return reply.send(games);

	});

}

// WHEN YOU UPDATE SOMETHING
// ? number == params number
// valid: /data/user/delete
