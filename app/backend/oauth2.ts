import { server } from './server.ts';
import querystring from 'querystring'; // To handle URL query strings
import { User } from './data access layer/user.ts';
import { red, green, yellow, blue, guid as Guid } from './global.ts';
import fs from 'fs';
import path from 'path';
import type { FastifyReply } from 'fastify';
import { db } from "./data access layer/database.ts";
import { config } from './global.ts';
import { vaultGoogleClientSecret } from './server.ts';
import { pipeline } from "stream/promises";
import { guid } from './global.ts';

const CLIENT_ID = process.env.CLIENT_ID;
const REDIRECT_URI = process.env.REDIRECT_URI;

//!
export function setSessionIdCookie(user: User, reply: FastifyReply)
{
	const sessionId = Guid();

	console.debug(blue, "Setting sessionId for user");
	user.SessionId = sessionId;
	user.ExpirationDate = new Date(Date.now() + (60000 * 60 * 24)); // expire in 1 day
	const user2: User = Object.assign(new User(-1, "", "", "", -1, -1), user);
	user2.update().then(res => {
		if (!res)
			console.error(red, "Error setting sessionId for user");
	});

	// set cookie to browser
	console.debug(blue, "Setting sessionId for browser");
	reply.setCookie('sessionId', sessionId, {
		httpOnly: true,       // client JS cannot access
		path: '/',            // send cookie on all routes
		maxAge: 60 * 60 * 24,      // session is not valid in server after 1 day
		secure: false,        // set true if using HTTPS
	});
}

//!
export function createJwt(Id: number)
{
	return server.jwt.sign({
		Id: Id,
		IsRoot: 0
	}, { expiresIn: '1d' });
}

// you can to register routes
export function OAuth2Routes() {
	
	server.get('/loginGoogle', (req, reply) => {
	
		// this is never reached
		console.debug(blue, "/loginGoogle");
	
		const queryString = querystring.stringify({
		  client_id: CLIENT_ID,
		  redirect_uri: "https://localhost/loginGoogleCallback",
		  response_type: 'code',
		  scope: 'openid email profile',
		});

		// nginx is proxying to here
		// google only knows nginx
		// configure google with nginx
		reply.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${queryString}`);
	});
	
	// google redirect user to config.WEBSITE_URL/loginGoogleCallback
	// and browser send request to our server
	server.get('/loginGoogleCallback', async (req, reply) => { //!

		console.debug(blue, "/loginGoogleCallback");
		
		const code = (req.query as { code?: string }).code;
	  
		const googleResponseForToken = await fetch('https://oauth2.googleapis.com/token', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: querystring.stringify({
				code,
				client_id: CLIENT_ID,
				client_secret: await vaultGoogleClientSecret(), // REQUESTING FROM VAULT, for each new vault server you must unseal
				redirect_uri: REDIRECT_URI,
				grant_type: 'authorization_code'
			})
		});

		const tokens = await googleResponseForToken.json();

		const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
			headers: { Authorization: `Bearer ${tokens.access_token}` }
		});
		const userObjFromGoogle = await userRes.json();
		// console.log("User info:", userObjFromGoogle); // GOT USER INFO

		var response = await fetch(config.WEBSITE_URL + `/data/user/getByGoogleId?GoogleId=${encodeURIComponent(userObjFromGoogle.id)}`, { headers: { "Authorization": `Bearer ${process.env.ROOT_TOKEN}` } }); // full url here, bc the browser that handle that is the frontend

		if (response.ok)
		{
			console.debug(blue, "User in db");

			const user: User = await response.json();
			if (user.Username == null)
			{
				console.debug(blue, "User has not username");

				const jwt = createJwt(user.Id);
				console.debug(yellow, );
				console.debug(yellow, "server set jwt=" + jwt);

				reply.redirect(`https://localhost/newUser?Id=${user.Id}&jwt=${jwt}`);
			}
			else
			{
				console.debug(blue, "User has username");
				// user already registered in website

				// 2FA 2
				// if user enabled 2FA
				const userr = Object.assign(new User(-1, "", "", "", -1, -1), user);
				if (userr.enabled2FA())
				{
					// console.debug(yellow, "userr.enabled2FA(), no session and no jwt");
					
					// no session and no jwt
					//*
					// const sanitizedUser = {
					// 	...user,
					// 	ExpirationDate: user.ExpirationDate ? user.ExpirationDate.toISOString() : null,
					// 	LastActivity: user.LastActivity ? user.LastActivity.toISOString() : null
					// };
					const params = querystring.stringify({...user});

					reply.redirect("https://localhost" + `/existingUser?Id=${user.Id}`); // removed all query params
					return ;
				}

				// SESSION ID
				setSessionIdCookie(user, reply);

				// 2FA
				const jwt = createJwt(user.Id);
				console.debug(yellow, "server set jwt=" + jwt); // this return jwt, hhhhhhh
				
				//*
				// const sanitizedUser = {
				// 	...user,
				// 	ExpirationDate: user.ExpirationDate ? user.ExpirationDate.toISOString() : null,
				// 	LastActivity: user.LastActivity ? user.LastActivity.toISOString() : null
				// };
				const params = querystring.stringify({...user});
				reply.redirect("https://localhost" + `/existingUser?${params}&jwt=${jwt}`); // redirect to home
				return ;
			}
		}
		else
		{
			console.log(blue, "User is not in db");
			
			const newUser: User = new User(-1, userObjFromGoogle.id, null, "", 0, 0); // so small ?

			const res = await newUser.add();
			if (res)
			{
				console.debug(blue, "User added to db");

				const userId = res;

				const jwt = createJwt(userId);
				console.debug(yellow, );
				console.debug(yellow, "server set jwt=" + jwt);

				// 2FA
				reply.redirect(`https://localhost/newUser?Id=${userId}&jwt=${jwt}`);
			}
			else
			{
				console.error(red, "Error adding new user");
				reply.status(500).send("Error: failure adding user");
			}
		}

	});

	// server.post("/uploadProfile/:id", { preHandler: (server as any).byItsOwnUser }, async (req, reply) => {

	// 	console.debug(blue, "/uploadProfile");
		
	// 	// Get the parts of the multipart form
	// 	const parts = req.parts();

	// 	let username = null;
	// 	let avatarPath = null;
	// 	let Id = req.params.id;

	// 	var fileName: string | null = null;

	// 	const savedFiles: string[] = [];

	// 	for await (const part of parts) {
	// 		if (part.type == "file") {

	// 			for await (const _ of part.file) {
	// 				// ignore chunks
	// 			}

	// 			// doesn’t wait for more chunks
	// 			// while (part.file.read())
	// 			// {

	// 			// }
				
	// 			// part.file.read();
	// 			// await pipeline(part.file, fs.createWriteStream("/dev/null"));

	// 		} else {
	// 			if (part.type === "field" && part.fieldname === "username") {
	// 				username = (part as any).value;
	// 			}
	// 		}
	// 	}
	
	// 	// only avatar
	// 	if (username == null)
	// 	{
	// 		console.debug(blue, "username is null");

	// 		const user: User = await User.getById(Id);
	// 		if (user)
	// 		{
	// 			if (user.AvatarPath)
	// 			{
	// 				// update existing avatar
	// 				fileName = user.AvatarPath;
	// 			}
	// 			else
	// 			{
	// 				// first avatar
	// 				fileName = Guid() + ".png";

	// 				user.AvatarPath = fileName;
	// 				user.update(); // Ensure update is awaited and user is an instance of a class with update method
					
	// 				//! HERE
	// 				// fetch(config.WEBSITE_URL + `/data/user/update`,{
	// 				// 	method: "PUT",
	// 				// 	headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.ROOT_TOKEN}` }, // is this important, for fastify I think
	// 				// 	body: JSON.stringify(new User(user.Id, user.GoogleId, user.Username, fileName!, user.Wins, user.Losses, user.SessionId, user.ExpirationDate)), //?
	// 				// })
	// 			}
	// 			for (const file of savedFiles) {
	// 				if (file) {
	// 					const avatarPath = path.join(process.cwd(), "Avatars", fileName); //!
	// 					// Save the file in server local storage
	// 					const writeStream = fs.createWriteStream(avatarPath);
	// 					(file as any).pipe(writeStream);
	// 				}
	// 			}
	// 		}

	// 		return ;
	// 	}

	// 	if (username)
	// 	{
	// 		if (username.length > 20 || username.length < 3 || username.trim() === "" || !/^[a-zA-Z0-9_]+$/.test(username))
	// 			return reply.status(400).send();
	// 	}
	  
	// 	// use saved files objects
	// 	for await (const file of savedFiles) {
	// 		if (file) {
	// 			// It's a file
	// 			fileName = Guid() + ".png"; // filename: date_filename, not unique but good for now
	// 			const avatarPath = path.join(process.cwd(), "Avatars", fileName); //!
		
	// 			// Save the file
	// 			const writeStream = fs.createWriteStream(avatarPath); // open file in process and create it in disk
	// 			await (file as any).pipe(writeStream); // write to it
	// 			break ;
	// 		}
	// 	}

	// 	if (Id == null || (username == null || username.trim() == "")) {
	// 		console.error(red, "Missing Id or username");
	// 		reply.status(400).send("Error: Missing Id or username");
	// 		return ;
	// 	}

	// 	// Now you have both
	// 	console.debug(blue, "Id:", Id);
	// 	console.debug(blue, "Username:", username);
	// 	console.debug(blue, "Avatar saved at:", fileName);
		
	// 	//! keep file path when no avatar
	// 	if (fileName == null)
	// 	{
	// 		// const response = await fetch(config.WEBSITE_URL + `/data/user/getById?Id=${Id}`, {headers: { "Authorization": `Bearer ${process.env.ROOT_TOKEN}` }});
	// 		// if (response.ok) // user found
	// 		// {
	// 		// 	const user: User = await response.json();
	// 		// 	fileName = user.AvatarPath;
	// 		// }
	// 		const user: User = await User.getById(Id);
	// 		if (user)
	// 		{
	// 			fileName = user.AvatarPath;
	// 		}
	// 	}

	// 	const userr: User = await User.getById(Id); // Ensure userr is declared and typed

	// 	if (!userr)
	// 		return reply.status(404).send();

	// 	// update user username and avatar path in db
	// 	console.debug(blue, "Updating user in db, fileName:", fileName);
	// 	const user: User = new User(Id!, userr.GoogleId, username!, fileName!, 0, 0);
	// 	//! HERE
	// 	// const response = await fetch(config.WEBSITE_URL + `/data/user/update`,{ // server domain
	// 	// 	method: "PUT",
	// 	// 	headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.ROOT_TOKEN}` }, // is this important, for fastify I think
	// 	// 	body: JSON.stringify(user),
	// 	// });

	// 	const response = await user.update();

	// 	if (response)
	// 	{
	// 		// SESSION ID
	// 		setSessionIdCookie(user, reply);
			
	// 		reply.send();
	// 	}
	// 	else
	// 		reply.status(500).send("Error: failure updating user");

	// });

	server.post("/uploadProfile/:id", { preHandler: (server as any).byItsOwnUser }, async (req, reply) => {

		const parts = req.parts();

		let username: string | null = null;
		let avatarPath: string | null = null;
		let filename: string | null = null;

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

		if (!username)
			return reply.status(400).send();
	
		if (
			username.trim() == "" ||
			username.length < 3 ||
			username.length > 20 ||
			!/^[a-zA-Z0-9_]+$/.test(username)
		) {
			return reply.status(400).send();
		}

		const user: User = await User.getById((req.params as any).id);
		user.Username = username ?? user.Username;
		user.AvatarPath = filename ?? user.AvatarPath;
		const success = await user.update();
		if (success)
		{
			// SESSION ID
			setSessionIdCookie(user, reply);
			return reply.send();
		}
		else
			return reply.status(500).send();

	});

	server.post("/validateSession", (request, reply) => {

		// console.debug(yellow, "/validateSession");

		const { sessionId } = request.cookies;

		if (!sessionId)
		{
			console.debug(blue, "sessionId cookie not found"); // the browser didn't send it or user removed it
			return reply.status(404).send(); // didn't found session id
		}

		db.get("SELECT * FROM Users WHERE SessionId = ?", [sessionId], (err, row) => {
			if (err)
			{
				console.error(red, 'Error querying user by sessionId:', err);
				return reply.status(500).send();
			}
			if (row)
			{
				// console.debug(blue, "User in db found by SessionId");

				//*
				const userRow = row as { ExpirationDate: number }; // Type assertion

				if (userRow.ExpirationDate < (new Date()).getTime())
				{
					console.debug(blue, "Session expired");

					return reply.status(401).send();
				}
			
				reply.send(userRow);
			}
			else
			{
				console.debug(blue, "User not found by SessionId");

				reply.status(404).send();
			}
		});
	});
}
