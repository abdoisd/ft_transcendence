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

const CLIENT_ID = process.env.CLIENT_ID;
const REDIRECT_URI = process.env.REDIRECT_URI;

//!
export function setSessionIdCookie(user: User, reply: FastifyReply)
{
	const sessionId = Guid();

	console.debug(blue, "Setting sessionId for user");
	user.SessionId = sessionId;
	user.ExpirationDate = new Date(Date.now() + 60000 * 60 * 24); // expire in 1 day
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
		maxAge: 60 * 60,      // session is not valid in server after 1 hour
		secure: false,        // set true if using HTTPS
	});
}

//!
export function createJwt(Id: number)
{
	return server.jwt.sign({
		Id: Id,
		IsRoot: 0
	}, { expiresIn: '1h' });
}

// you can to register routes
export function OAuth2Routes() {
	
	// not protect bc he is trying to login
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
		
		const code = req.query.code;
	  
		const googleResponseForToken = await fetch('https://oauth2.googleapis.com/token', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: querystring.stringify({
				code,
				client_id: CLIENT_ID,
				client_secret: await vaultGoogleClientSecret(),
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
					const params = querystring.stringify({ ...user });
					reply.redirect("https://localhost" + `/existingUser?Id=${user.Id}`); // removed all query params
					return ;
				}

				// SESSION ID
				setSessionIdCookie(user, reply);

				// 2FA
				const jwt = createJwt(user.Id);
				console.debug(yellow, "server set jwt=" + jwt); // this return jwt, hhhhhhh
				
				const params = querystring.stringify({ ...user });
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

	// update username or avatar or both
	server.post("/uploadProfile", { preHandler: server.byItsOwnUser }, async (req, reply) => {

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

		// only avatar
		if (username == null)
		{
			console.debug(blue, "username is null");

			fetch(config.WEBSITE_URL + `/data/user/getById?Id=${Id}`, {headers: { "Authorization": `Bearer ${process.env.ROOT_TOKEN}` }})
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

					user.AvatarPath = fileName;
					user.update();
					
					//! HERE
					// fetch(config.WEBSITE_URL + `/data/user/update`,{
					// 	method: "PUT",
					// 	headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.ROOT_TOKEN}` }, // is this important, for fastify I think
					// 	body: JSON.stringify(new User(user.Id, user.GoogleId, user.Username, fileName!, user.Wins, user.Losses, user.SessionId, user.ExpirationDate)), //?
					// })
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
			const response = await fetch(config.WEBSITE_URL + `/data/user/getById?Id=${Id}`, {headers: { "Authorization": `Bearer ${process.env.ROOT_TOKEN}` }});
			if (response.ok) // user found
			{
				const user: User = await response.json();
				fileName = user.AvatarPath;
			}
		}

		const userr: User = await User.getById(Id); // Ensure userr is declared and typed

		// update user username and avatar path in db
		console.debug(blue, "Updating user in db, fileName:", fileName);
		const user: User = new User(Id!, userr.GoogleId, username!, fileName!, 0, 0);
		//! HERE
		// const response = await fetch(config.WEBSITE_URL + `/data/user/update`,{ // server domain
		// 	method: "PUT",
		// 	headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.ROOT_TOKEN}` }, // is this important, for fastify I think
		// 	body: JSON.stringify(user),
		// });

		const response = await user.update();

		if (response)
		{
			// SESSION ID
			setSessionIdCookie(user, reply);
			
			reply.send();
		}
		else
			reply.status(500).send("Error: failure updating user");

	});

	// must not declared async
	// don't protect it bc, if he is not the user, this is not going to be valid
	server.post("/validateSession", (request, reply) => {

		console.debug(yellow, "/validateSession");

		const { sessionId } = request.cookies;

		// console.debug(yellow, "sessionId from cookie:", sessionId);

		if (!sessionId)
		{
			console.debug(blue, "sessionId cookie not found"); // the browser didn't send it or user removed it
			return reply.status(404).send(); // didn't found session id
		}

		db.get("SELECT * FROM Users WHERE SessionId = ?", [sessionId], (err, row) => {
			if (err) { // to check this
				console.error(red, 'Error querying user by sessionId:', err);
				return reply.status(500).send();
			}
			if (row)
			{
				console.debug(blue, "User in db found by SessionId");

				if (row.ExpirationDate < (new Date()).getTime())
				{
					console.debug(blue, "Session expired");

					return reply.status(401).send();
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
