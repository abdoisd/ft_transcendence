// fastify
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import multipart from "@fastify/multipart";
import cookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";
import { Server } from "socket.io";

// dotenv
import dotenv from 'dotenv';
dotenv.config({path: './env/.env'});
dotenv.config({path: './.env'});
// console.log(yellow, process.env.VAULT_TOKEN);
// console.log(yellow, process.env.JWT_SECRET);

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

export const server = Fastify({bodyLimit: 3048576}); // 1mb
export const ws = new Server(server.server, {
	cors: {
		origin: "https://localhost",
	},
});


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
server.register(fastifyJwt, {
	secret: process.env.JWT_SECRET || 'defaultSecret'
})

// game / socket.io
import { webSocket } from "./webSocket.ts";

webSocket();
chatWs();


// prometheus
import client from 'prom-client';
const register = new client.Registry(); // Create a Registry which registers the metrics
client.collectDefaultMetrics({ register }); // Add default metrics to the registry
const requestCounter = new client.Counter({
	name: 'server_requests_total',
	help: 'Total number of server requests',
	labelNames: ['request_method', 'requested_file', 'response_status']
});
register.registerMetric(requestCounter);
server.addHook('onResponse', (request, reply, done) => {
	requestCounter.inc({
		request_method: request.method,
		requested_file: request.url,
		response_status: reply.statusCode
	});
	done();
});
server.get('/metrics', async (request, reply) => {
	reply
	  .header('Content-Type', register.contentType)
	  .send(await register.metrics());
});
// sqlite metrics
export const connectedToSqlite = new client.Gauge({
	name: 'connected_to_sqlite',
	help: 'Whether process connected to sqlite db (1 = true, 0 = false)',
});
register.registerMetric(connectedToSqlite);
connectedToSqlite.set(0);

// post to logstash
// import { logstash } from "./logstash.ts";
// logstash();

// vault
import vaultFactory from 'node-vault';
const vault = vaultFactory({
	apiVersion: 'v1',
	endpoint: 'https://vault-server:8200',
	token: process.env.VAULT_TOKEN || '', //*
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


// ==================================================================================================


// request and it's response
server.addHook('onSend', async (request, reply, payload) => {
	console.info(magenta, "Request to server: " + request.method + " " + request.url);
	console.info(magenta, "Server response: " + reply.statusCode);
});

// // for timing things
// server.addHook('onRequest', async (request) => {
// 	console.info(magenta, "Request to server: " + request.method + " " + request.url);
// });
// server.addHook('onResponse', async (request, reply) => {
// 	console.info(magenta, "Server response: " + reply.statusCode);
// });

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
		server.ready(err => {
			if (err) throw err;
		  
			console.log(server.printRoutes())
		});
		
        const host = config.HOST || 'localhost'; //*
        const port = config.PORT ? Number(config.PORT) : 3000; //*
        await server.listen({port, host});
    }
    catch (err)
    {
        server.log.error(err);
		process.exit(1);
	}
};

start();
