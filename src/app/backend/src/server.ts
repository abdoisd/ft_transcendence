// fastify
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import multipart from "@fastify/multipart";
import cookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";
import { Server } from "socket.io";
import { registerLogger } from "./logging/logstash.ts";
import { gameWs } from "./webSocket.ts";

// dotenv
import dotenv from 'dotenv';
dotenv.config({path: './env/.env'});
dotenv.config({path: './.env'});

// config
import { config } from "./global.ts";

// modules
import path from "path";

// globals
import { blue, red, yellow, green, magenta, cyan } from "./global.ts";

// routes
import { UserRoutes } from "./data access layer/user.ts";
import { OAuth2Routes } from "./oauth2.ts";
import { relationshipRoutes } from "./data access layer/relationship.ts"
import { Enable2faRoutes } from "./2fa.ts";

export const server = Fastify();

export const ws = new Server(server.server, {
	cors: {
		origin: config.SERVER_URL,
	}
});


ws.use((socket, next) => {
	const token = socket.handshake.auth.token;
	if (!token)
		return next(new Error('Authentication error: No token provided'));
	try {
		const payload = server.jwt.verify(token);
		socket.userId = payload.Id;
		return next();
	} catch {
		return next(new Error('Authentication error: token invalid'));
	}
});

registerLogger(server);

// REGISTER PLUGINS
server.register(cookie, {});
server.register(multipart);
server.register(fastifyStatic, {
	root: path.join(process.cwd(), "./public"),
});
server.setNotFoundHandler((request, reply) => {
	if (request.url.split("/").length > 2)
		return reply.status(404).send('Not Found');
	reply.sendFile("index.html");
});

gameWs();
chatWs();

// vault
import vaultFactory from 'node-vault';
const vault = vaultFactory({
	apiVersion: 'v1',
	endpoint: 'https://vault-server:8200',
	token: process.env.VAULT_TOKEN,
	requestOptions: {
		strictSSL: false
	}
});
export async function vaultGoogleClientSecret(): Promise<string>
{
	return vault.read('secret/data/node-app')
	.then((result) => {
		return result.data.data.CLIENT_SECRET;
	});
}
async function vaultJwtSecret(): Promise<string>
{
	return vault.read('secret/data/node-app')
	.then((result) => {
		return result.data.data.JWT_SECRET;
	});
}
export async function vaultRootToken(): Promise<string>
{
	return vault.read('secret/data/node-app')
	.then((result) => {
		return result.data.data.ROOT_TOKEN;
	});
}
server.register(fastifyJwt, {
	secret: await vaultJwtSecret()
})

server.addHook('onSend', async (request, reply, payload) => {
	console.info(magenta, "Request to server: " + request.method + " " + request.url);
	console.info(magenta, "Server response: " + reply.statusCode);
});

import { gameRoutes } from "./game api/game api.ts";
import { chatWs } from "./chat.ts";
import apiRoutes from "./api/api_routes.ts";

const start = async () =>
{
    try
    {
		console.log("Starting server...");
		
		// register routes
		UserRoutes();
		OAuth2Routes();
		server.register(relationshipRoutes);
		server.register(Enable2faRoutes);
		gameRoutes();
		apiRoutes();
		
        const host = config.HOST;
        const port = Number(config.PORT);
        await server.listen({port, host});
    }
    catch (err)
    {
        server.log.error(err);
		process.exit(1);
	}
};

start();
