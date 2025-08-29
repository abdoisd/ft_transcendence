import { server } from './server.ts';
import querystring from 'querystring'; // To handle URL query strings
import { User } from './Data Access Layer/User.ts';
import { red, green, yellow, blue, guid as Guid } from './global.ts';
import fs from 'fs';
import path from 'path';
import type { FastifyReply } from 'fastify';
import { db } from './Data Access Layer/User.ts';

const CLIENT_ID = '339240449841-lh801he1b2spt5nakf92i4bd5clvuaje.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:8080/loginGoogleCallback';

function setSessionId(user: User, reply: FastifyReply)
{
	const sessionId = Guid();
				
	console.debug(blue, "Setting sessionId for user");
	fetch(`http://localhost:8080/data/user/update`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(new User(user.Id, user.GoogleId, user.Username, user.AvatarPath, user.Wins, user.Losses, sessionId, new Date(Date.now() + 60000 * 10))), // expire in 1 min
	})
	.then(res => {
		if (!res.ok)
			console.error(red, "Error setting sessionId for user");
	})

	console.debug(blue, "Setting sessionId for browser");
	reply.setCookie('sessionId', sessionId, {
		httpOnly: true,       // client JS cannot access
		path: '/',            // send cookie on all routes
		maxAge: 60 * 10,           // 10 min
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
	
	// google redirect user to http://localhost:8080/loginGoogleCallback
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
	  
		console.log("User info:", userObjFromGoogle); // GOT USER INFO

		var response = await fetch(`http://localhost:8080/data/user/getByGoogleId?GoogleId=${encodeURIComponent(userObjFromGoogle.id)}`); // full url here, bc the browser that handle that is the frontend

		if (response.ok)
		{
			console.debug(blue, "User in db");

			const user: User = await response.json();
			if (user.Username == null)
			{
				console.debug(blue, "User has not username");
				
				reply.redirect(`http://localhost:8080/newUser?Id=${user.Id}`);
			}
			else
			{
				console.debug(blue, "User has username");

				//? SESSION ID
				setSessionId(user, reply);
				
				const params = querystring.stringify({ ...user });
				reply.redirect(`http://localhost:8080/existingUser?${params}`); // redirect to home
			}
		}
		else
		{
			console.log(blue, "User is not in db");
			
			const newUser: User = new User(-1, userObjFromGoogle.id, null, "", 0, 0);
			response = await fetch(`http://localhost:8080/data/user/add`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newUser), // obj literal to string
			});
			if (response.ok)
			{
				console.debug(blue, "User added to db");

				reply.redirect(`http://localhost:8080/newUser?Id=${(await response.json()).Id}`);
			}
			else
			{
				console.error(red, "Error adding new user");
				reply.status(500).send("Error: failure adding user");
			}
		}

	});

	server.post("/uploadProfile", async (req, reply) => {

		console.debug(blue, "/uploadProfile");
		
		// Get the parts of the multipart form
		const parts = req.parts();
	  
		let username = null;
		let avatarPath = null;
		let Id = null;
	  
		for await (const part of parts) {
			if (part.file) {
				// It's a file
				const fileName = Guid() + ".png"; // filename: date_filename, not unique but good for now
				avatarPath = path.join(process.cwd(), "Avatars", fileName); // path in the server
		
				// Save the file
				const writeStream = fs.createWriteStream(avatarPath); // does this create folder if not exists? no
				await part.file.pipe(writeStream);
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

		if (Id == null || username == null) {
			console.error(red, "Missing Id or username");
			reply.status(400).send("Error: Missing Id or username");
			return ;
		}

		// Now you have both
		console.debug(blue, "Id:", Id);
		console.debug(blue, "Username:", username);
		console.debug(blue, "Avatar saved at:", avatarPath);

		// update user username and avatar path in db
		const user: User = new User(Id!, "", username!, avatarPath!, 0, 0);
		const response = await fetch(`http://localhost:8080/data/user/update`,{
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
