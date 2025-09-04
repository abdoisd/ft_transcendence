import { server } from './server.ts';
import querystring from 'querystring'; // To handle URL query strings
import { User } from './data access layer/user.ts';
import { red, green, yellow, blue, guid as Guid } from './global.ts';
import fs from 'fs';
import path from 'path';
import type { FastifyReply } from 'fastify';
import { db } from "./data access layer/database.ts";

const CLIENT_ID = '339240449841-lh801he1b2spt5nakf92i4bd5clvuaje.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:3000/loginGoogleCallback';

function setSessionId(user: User, reply: FastifyReply)
{
	const sessionId = Guid();
				
	console.debug(blue, "Setting sessionId for user");
	fetch(`http://localhost:3000/data/user/update`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(new User(user.Id, user.GoogleId, user.Username, user.AvatarPath, user.Wins, user.Losses, sessionId, new Date(Date.now() + 60000 * 60 * 24))), // expire in 1 day
	})
	.then(res => {
		if (!res.ok)
			console.error(red, "Error setting sessionId for user");
	})

	console.debug(blue, "Setting sessionId for browser");
	reply.setCookie('sessionId', sessionId, {
		httpOnly: true,       // client JS cannot access
		path: '/',            // send cookie on all routes
		maxAge: 60 * 60 * 24,           // 1 day
		secure: false,        // set true if using HTTPS
	}); //?
}

// you can to register routes
export function OAuth2Routes() {





	server.get('/loginGoogle', (req, reply) => {
	
		// this is never reached
		console.debug(blue, "/loginGoogle");
	
		const queryString = querystring.stringify({
		  client_id: CLIENT_ID,
		  redirect_uri: REDIRECT_URI,
		  response_type: 'code',
		  scope: 'openid email profile',
		});
	  
		reply.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${queryString}`);
	});
	
	// google redirect user to http://localhost:3000/loginGoogleCallback
	// and browser send request to our server
	server.get('/loginGoogleCallback', async (req, reply) => {

		console.debug(blue, "/loginGoogleCallback");
		
		const code = req.query.code;
	  
		const googleResponseForToken = await fetch('https://oauth2.googleapis.com/token', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: querystring.stringify({
				code,
				client_id: CLIENT_ID,
				client_secret: CLIENT_SECRET,
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

		var response = await fetch(`http://localhost:3000/data/user/getByGoogleId?GoogleId=${encodeURIComponent(userObjFromGoogle.id)}`); // full url here, bc the browser that handle that is the frontend

		if (response.ok)
		{
			console.debug(blue, "User in db");

			const user: User = await response.json();
			if (user.Username == null)
			{
				console.debug(blue, "User has not username");
				
				reply.redirect(`http://localhost:3000/newUser?Id=${user.Id}`);
			}
			else
			{
				console.debug(blue, "User has username");

				//? SESSION ID
				setSessionId(user, reply);
				
				const params = querystring.stringify({ ...user });
				reply.redirect(`http://localhost:3000/existingUser?${params}`); // redirect to home
			}
		}
		else
		{
			console.log(blue, "User is not in db");
			
			const newUser: User = new User(-1, userObjFromGoogle.id, null, "", 0, 0);
			response = await fetch(`http://localhost:3000/data/user/add`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newUser), // obj literal to string
			});
			if (response.ok)
			{
				console.debug(blue, "User added to db");

				reply.redirect(`http://localhost:3000/newUser?Id=${(await response.json()).Id}`);
			}
			else
			{
				console.error(red, "Error adding new user");
				reply.status(500).send("Error: failure adding user");
			}
		}

	});

	// update user with username and avatarPath
	server.post("/uploadProfile", async (req, reply) => {

		console.debug(blue, "/uploadProfile");
		
		// Get the parts of the multipart form
		const parts = req.parts();
	  
		let username = null;
		let avatarPath = null;
		let Id = null;

		var fileName: string | null = null;

		const savedFiles: string[] = [];

		for await (const part of parts) {
			if (part.file) {
				savedFiles.push(part.file);
			} else {
				// It's a regular field
				if (part.fieldname === "username") {
					username = part.value;
				}
				else if (part.fieldname === "Id") {
					Id = part.value;
				}
			}
		}

		if (username == null)
		{
			console.debug(blue, "username is null");
			// only avatar

			fetch(`http://localhost:3000/data/user/getById?Id=${Id}`)
			.then(res => {
				if (res.ok)
					return res.json();
				else
					throw new Error("User not found");
			})
			.then((user: User) => {
				if (user.AvatarPath)
				{
					// update existing avatar
					fileName = user.AvatarPath;
				}
				else
				{
					// first avatar
					fileName = Guid() + ".png";

					// update user with first avatar path
					fetch(`http://localhost:3000/data/user/update`,{
						method: "POST",
						headers: { "Content-Type": "application/json" }, // is this important, for fastify I think
						body: JSON.stringify(new User(user.Id, user.GoogleId, user.Username, fileName!, user.Wins, user.Losses)),
					})
				}
				for (const file of savedFiles) {
					if (file) {
						const avatarPath = path.join(process.cwd(), "Avatars", fileName); //!
						// Save the file
						const writeStream = fs.createWriteStream(avatarPath);
						file.pipe(writeStream);
					}
				}
			})

			return ;
		}
	  
		// use saved files objects
		for await (const file of savedFiles) {
			if (file) {
				// It's a file
				fileName = Guid() + ".png"; // filename: date_filename, not unique but good for now
				const avatarPath = path.join(process.cwd(), "Avatars", fileName); //!
		
				// Save the file
				const writeStream = fs.createWriteStream(avatarPath); // open file in process and create it in disk
				await file.pipe(writeStream); // write to it
			}
		}

		if (Id == null || username == null) {
			console.error(red, "Missing Id or username");
			reply.status(400).send("Error: Missing Id or username");
			return ;
		}

		// Now you have both
		console.debug(blue, "Id:", Id);
		console.debug(blue, "Username:", username);
		console.debug(blue, "Avatar saved at:", fileName);
		
		//! keep file path when no avatar
		if (fileName == null)
		{
			const response = await fetch(`http://localhost:3000/data/user/getById?Id=${Id}`);
			if (response.ok) // user found
			{
				const user: User = await response.json();
				fileName = user.AvatarPath;
			}
		}

		// update user username and avatar path in db
		console.debug(blue, "Updating user in db, fileName:", fileName);
		const user: User = new User(Id!, "", username!, fileName!, 0, 0);
		const response = await fetch(`http://localhost:3000/data/user/update`,{
			method: "POST",
			headers: { "Content-Type": "application/json" }, // is this important, for fastify I think
			body: JSON.stringify(user),
		});

		if (response.ok)
		{
			//? SESSION ID
			setSessionId(user, reply);
			
			reply.send();
		}
		else
			reply.status(500).send("Error: failure updating user");

	});

	// must not declared async
	server.post("/validateSession", (request, reply) => {

		console.debug(blue, "/validateSession");
	
		const { sessionId } = request.cookies;
	
		if (!sessionId)
		{
			console.debug(blue, "sessionId cookie not found"); // the browser didn't send it or user removed it
			return reply.status(404).send(); // didn't found session id
		}

		db.get("SELECT * FROM Users WHERE SessionId = ?", [sessionId], (err, row) => {
			if (err) {
				console.error(red, 'Error querying user by sessionId:', err);
				return reply.status(500).send();
			}
			if (row)
			{
				console.debug(blue, "User found by SessionId");

				if (new Date(row.ExpirationDate) < new Date())
				{
					console.debug(blue, "Session expired");

					return reply.status(404).send();
				}

				reply.send(row);
			}
			else
			{
				console.debug(blue, "User not found by SessionId");

				reply.status(404).send();
			}
		});
	});

}
