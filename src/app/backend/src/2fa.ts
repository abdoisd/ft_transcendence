
import { server } from './server.ts';
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { yellow } from './global.ts';
import { User } from './data access layer/user.ts';
import { createJwt } from './oauth2.ts';
import { setSessionIdCookie } from './oauth2.ts';

export function Enable2faRoutes()
{

	server.get("/auth/2fa", { preHandler: (server as any).byItsOwnUser }, async (request, reply) => 
	{
		const userId = (request.query as any).Id;

		var secret = speakeasy.generateSecret({});
		console.debug(yellow, "secret: ", secret);

		const user = await User.getById(userId);
		user.TOTPSecretPending = secret.base32;
		await user.update();

		const qrCodeDataURL = await qrcode.toDataURL(secret.otpauth_url);
		console.debug(yellow, "qrCodeDataURL: ", qrCodeDataURL);
		reply.send({ qrCode: qrCodeDataURL });
	});

	server.get("/auth/2fa/enable", { preHandler: (server as any).byItsOwnUser }, async (request, reply) => 
	{
		const userId = (request.query as any).Id;
		const code = (request.query as any).code;

		if (!userId || !code || userId.trim() == "" || code.trim() == "")
			return reply.status(400).send();

		const user = await User.getById(userId);
		const secret = user.TOTPSecretPending;

		const verified = speakeasy.totp.verify({
			secret: secret,
			encoding: "base32",
			token: code
		});

		if (verified)
		{
			const user = await User.getById(userId);
			user.TOTPSecret = secret;
			user.update();

			const jwt = createJwt(user.Id);

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

		const user = await User.getById(userId);
		const secret = user.TOTPSecret;

		const verified = speakeasy.totp.verify({
			secret: secret,
			encoding: "base32",
			token: code
		});

		if (verified)
		{
			const jwt = createJwt(user.Id);
			setSessionIdCookie(user, reply);
						
			reply.send( {jwt: jwt, user: user} );
		}
		else
			reply.status(403).send();
		
	});
}
