import { server } from './server.ts';
import querystring from 'querystring';
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
import { vaultRootToken } from './server.ts';

const CLIENT_ID = process.env.CLIENT_ID;
const REDIRECT_URI = process.env.REDIRECT_URI;

export function setSessionIdCookie(user: User, reply: FastifyReply)
{
	const sessionId = Guid();

	console.debug(blue, "Setting sessionId for user");
	user.SessionId = sessionId;
	user.ExpirationDate = new Date(Date.now() + (60000 * 60 * 24));
	const user2: User = Object.assign(new User(-1, "", "", "", -1, -1), user);
	user2.update().then(res => {
		if (!res)
			console.error(red, "Error setting sessionId for user");
	});

	console.debug(blue, "Setting sessionId for browser");
	reply.setCookie('sessionId', sessionId, {
		httpOnly: true,
		path: '/',
		maxAge: 60 * 60 * 24,
		secure: false,
	});
}

export function createJwt(Id: number)
{
	return server.jwt.sign({
		Id: Id,
		IsRoot: 0
	}, { expiresIn: '1d' });
}

export function OAuth2Routes() {
	
	server.get('/loginGoogle', (req, reply) => {
	
		console.debug(blue, "/loginGoogle");
	
		const queryString = querystring.stringify({
			client_id: CLIENT_ID,
			redirect_uri: REDIRECT_URI,
			response_type: 'code',
			scope: 'openid email profile',
		});

		reply.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${queryString}`);
	});
	
	server.get('/loginGoogleCallback', async (req, reply) => {

		console.debug(blue, "/loginGoogleCallback");
		
		const code = (req.query as { code?: string }).code;
	  
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

		var response = await fetch(config.WEBSITE_URL + `/data/user/getByGoogleId?GoogleId=${encodeURIComponent(userObjFromGoogle.id)}`, { headers: { "Authorization": `Bearer ${await vaultRootToken()}` } });

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

				reply.redirect(`${config.SERVER_URL}/newUser?Id=${user.Id}&jwt=${jwt}`); // server address
			}
			else
			{
				console.debug(blue, "User has username");

				const userr = Object.assign(new User(-1, "", "", "", -1, -1), user);
				if (userr.enabled2FA())
				{
					const params = querystring.stringify({...user});

					reply.redirect(config.SERVER_URL + `/existingUser?Id=${user.Id}`);
					return ;
				}

				setSessionIdCookie(user, reply);

				const jwt = createJwt(user.Id);
				console.debug(yellow, "server set jwt=" + jwt);
				
				const params = querystring.stringify({...user});
				reply.redirect(config.SERVER_URL + `/existingUser?${params}&jwt=${jwt}`);
				return ;
			}
		}
		else
		{
			console.log(blue, "User is not in db");
			
			const newUser: User = new User(-1, userObjFromGoogle.id, null, "", 0, 0);

			const res = await newUser.add();
			if (res)
			{
				console.debug(blue, "User added to db");

				const userId = res;

				const jwt = createJwt(userId);
				console.debug(yellow, );
				console.debug(yellow, "server set jwt=" + jwt);

				reply.redirect(`${config.SERVER_URL}/newUser?Id=${userId}&jwt=${jwt}`);
			}
			else
			{
				console.error(red, "Error adding new user");
				reply.status(400).send("Error: failure adding user");
			}
		}

	});

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
			setSessionIdCookie(user, reply);
			return reply.send();
		}
		else
			return reply.status(400).send();

	});

	server.post("/validateSession", (request, reply) => {

		const { sessionId } = request.cookies;

		if (!sessionId)
		{
			console.debug(blue, "sessionId cookie not found");
			return reply.status(404).send();
		}

		db.get("SELECT * FROM Users WHERE SessionId = ?", [sessionId], async (err, row) => {
			if (err)
			{
				console.error(red, 'Error querying user by sessionId:', err);
				return reply.status(400).send();
			}
			if (row)
			{
				const userRow = row as { ExpirationDate: number };
				if (userRow.ExpirationDate < (new Date()).getTime())
				{
					console.debug(blue, "Session expired");

					return reply.status(401).send();
				}

				try {
					await request.jwtVerify();
				}
				catch (err) {
					const jwt = createJwt(userRow.Id);
					userRow.jwt = jwt;
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
