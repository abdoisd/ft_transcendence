// fastify
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import multipart from "@fastify/multipart";
import cookie from "@fastify/cookie";

// modules
import path from "path";

// globals
import { blue, red, yellow, green, magenta, cyan } from "./global.ts";

// routes
import { UserRoutes } from "./data access layer/user.ts"; // not the same case here that made the problem
import { OAuth2Routes } from "./oauth2.ts";
import { relationshipRoutes } from "./data access layer/relationship.ts"

export const server = Fastify({logger: true});

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

// request, status
server.addHook('onResponse', async (request, reply) => {
	console.info(magenta, "Request to server: " + request.method + " " + request.url);
	console.info(magenta, "Server response: " + reply.statusCode);
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

const start = async () =>
{
    try
    {
		// register routes
		UserRoutes(); // register user routes
		OAuth2Routes(); // register oauth2 routes
		server.register(relationshipRoutes);

        await server.listen({ port: 3000, host: "0.0.0.0" });
    }
    catch (err)
    {
        server.log.error(err);
		process.exit(1);
	}
};

start();
