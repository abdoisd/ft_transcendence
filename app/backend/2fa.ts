// enable 2fa for user

import { server } from './server.ts';
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { yellow } from './global.ts';
import { User } from './data access layer/user.ts';
import { createJwt } from './oauth2.ts';
import { setSessionIdCookie } from './oauth2.ts';

export function Enable2faRoutes()
{

	// input: id
	server.get("/auth/2fa", { preHandler: (server as any).byItsOwnUser }, async (request, reply) => 
	{
		const userId = (request.query as any).Id;

		var secret = speakeasy.generateSecret({}); // Generates a random secret with the set A-Z a-z 0-9 and symbols, of any length (default 32).

		//! STORE PENDING
		const user = await User.getById(userId);
		user.TOTPSecretPending = secret.base32;
		user.update();

		console.debug(yellow, "secret: ", secret);
		// get qr code with the secret
		const qrCodeDataURL = await qrcode.toDataURL(secret.otpauth_url); // Returns a Data URI containing a representation of the QR Code image
		console.debug(yellow, "qrCodeDataURL: ", qrCodeDataURL);
		reply.send({ qrCode: qrCodeDataURL }); // response body

	});

	// input: id, code
	server.get("/auth/2fa/enable", { preHandler: (server as any).byItsOwnUser }, async (request, reply) => 
	{
		console.debug(yellow, "/auth/2fa/enable");
		
		const userId = (request.query as any).Id;
		const code = (request.query as any).code;

		if (!userId || !code || userId.trim() == "" || code.trim() == "")
			return reply.status(400).send();

		console.debug(yellow, "code: ", code);

		// validate with pending secret in db
		const user = await User.getById(userId);
		const secret = user.TOTPSecretPending;
		
		console.debug(yellow, "secret 2: ", secret);

		const verified = speakeasy.totp.verify({
			secret: secret,
			encoding: "base32",
			token: code
		});

		if (verified)
		{
			//! STORE PERMANENT
			
			const user = await User.getById(userId);
			user.TOTPSecret = secret;
			user.update();

			// 2FA
			const jwt = createJwt(user.Id);

			// set session cookie here
			setSessionIdCookie(user, reply);
			
			reply.send( {jwt: jwt, user: user} );
		}
		else
			reply.status(400).send();
	});

	server.get("/auth/2fa/verify", async (request, reply) => 
	{
		console.debug(yellow, "/auth/2fa/verify");
		
		const userId = (request.query as any).Id;
		const code = (request.query as any).code;

		if (!userId || !code || userId.trim() == "" || code.trim() == "")
			return reply.status(400).send();

		// // validate with pending secret in db
		// const user = await User.getById(userId);
		// const secret = user.TOTPSecretPending;
		
		// console.debug(yellow, "secret 2: ", secret);

		// const verified = speakeasy.totp.verify({
		// 	secret: secret,
		// 	encoding: "base32",
		// 	token: code
		// });

		// if (verified)
		// {
		// 	//! STORE PERMANENT
			
		// 	const user = await User.getById(userId);
		// 	user.TOTPSecret = secret;
		// 	user.update();

		// 	// 2FA
		// 	const jwt = createJwt(user.Id);

		// 	// set session cookie here
		// 	setSessionIdCookie(user, reply);
			
		// 	reply.send( {jwt: jwt, user: user} );
		// }
		// else
		// 	reply.status(403).send();

		const user = await User.getById(userId);
		const secret = user.TOTPSecret;

		const verified = speakeasy.totp.verify({
			secret: secret,
			encoding: "base32",
			token: code
		});

		if (verified)
		{
			// 2FA
			const jwt = createJwt(user.Id);
			// set session cookie here
			setSessionIdCookie(user, reply);
						
			reply.send( {jwt: jwt, user: user} );
		}
		else
			reply.status(403).send();
		
	});
}

/**
 * qr code with many representations
 */
