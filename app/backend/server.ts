// fastify
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import multipart from "@fastify/multipart";
import cookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";

// dotenv
import dotenv from 'dotenv';
dotenv.config({path: './env/.env'});
dotenv.config({path: './.env'});
console.log(yellow, process.env.VAULT_TOKEN);
console.log(yellow, process.env.JWT_SECRET);

// config
import { config } from "./global.ts";

// modules
import path from "path";

// globals
import { blue, red, yellow, green, magenta, cyan } from "./global.ts";

// routes
import { UserRoutes } from "./data access layer/user.ts"; // not the same case here that made the problem
import { OAuth2Routes } from "./oauth2.ts";
import { relationshipRoutes } from "./data access layer/relationship.ts"

export const server = Fastify({
	// logger: true
	// logger: {
	// 	transport: {
	// 		target: 'pino-pretty',   // Use pino-pretty as a transport
	// 		options: {
	// 	  		colorize: true,        // Add colors
	// 	  		translateTime: 'SYS:standard', // Human-readable timestamp
	// 	  		ignore: 'pid,hostname' // Optional: hide pid and hostname
	// 		}
	// 	}
	// }
});

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
server.addHook('onResponse', (request, reply, done) => { // each response have it's elapsed time
requestCounter.inc({
	request_method: request.method,
	requested_file: request.url,
	response_status: reply.statusCode
	});
	// console.debug(blue, "onResponse");
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

// vault client
import vaultFactory from 'node-vault'; // vault client for node
const vault = vaultFactory({
	apiVersion: 'v1',
	endpoint: 'https://vault-server:8200',
	token: process.env.VAULT_TOKEN,
	requestOptions: {
		strictSSL: false // tells node-vault to trust vault server certificate
	}
});
// to get live secret from vault
// if we change secret in vault, we don't need to restart server
export async function vaultGoogleClientSecret(): Promise<string>
{
	return vault.read('secret/data/node-app')
	.then((result) => {
		// console.log(yellow, result.data.data.CLIENT_SECRET);
		return result.data.data.CLIENT_SECRET;
	});
}
// usage
// console.log(yellow, await vaultGoogleClientSecret());


// ==================================================================================================


// request, status
server.addHook('onSend', async (request, reply, payload) => {
	console.info(magenta, "Request to server: " + request.method + " " + request.url);
	// if (request.body)
	// console.info(magenta, "Request body: ", request.headers, request.body);
	// if (request.method == "POST" || request.method == "PUT")
	// 	console.info(magenta, "Server response: " + reply.statusCode, payload);
	// else
	console.info(magenta, "Server response: " + reply.statusCode);
	// console.info(magenta, "Server response: " + reply);
});

// REGISTER PLUGINS
server.register(cookie, {});
server.register(multipart);
// serving all files in frontend/public
server.register(fastifyStatic, {
	root: path.join(process.cwd(), "./public"),
});
server.setNotFoundHandler((request, reply) => {
	if (request.url.split("/").length > 2) // if has more that one /
		return reply.status(404).send();
	reply.sendFile("index.html");
});
server.register(fastifyJwt, {
	secret: process.env.JWT_SECRET
})

const start = async () =>
{
    try
    {
		// register routes
		UserRoutes(); // register user routes
		OAuth2Routes(); // register oauth2 routes
		server.register(relationshipRoutes);

		server.ready(err => {
			if (err) throw err;
		  
			// Print all routes
			console.log(server.printRoutes())
		});
		
        await server.listen({host: config.HOST, port: config.PORT});
    }
    catch (err)
    {
        server.log.error(err);
		process.exit(1);
	}
};

start();
