// this server only server index.html and the api endpoints

import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import fastifyStatic from "@fastify/static"; // plugin to serve all files in a directory without me serving them, route for each one
import path from "path";
import multipart from "@fastify/multipart";
import cookie from "@fastify/cookie";
import { blue } from "./global.ts";

// api
import { UserRoutes } from "./Data Access Layer/User.ts";

import { OAuth2Routes } from "./oauth2.ts";

export const server: FastifyInstance = Fastify({logger: true});

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
console.debug = function () {};
server.addHook('onResponse', (request, reply, done) => { // each response have it's elapsed time
requestCounter.inc({
	request_method: request.method,
	requested_file: request.url,
	response_status: reply.statusCode
	});
	console.debug(blue, "onResponse");
	console.log(blue, `Request: ${request.method} ${request.url} - Status: ${reply.statusCode}`);
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

// post object to url
function post(url: string, object: any)
{
	fetch(url, {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json'
		},
		body: JSON.stringify(object)
	})
	.catch(error => console.error('Error:', error));
}

// REGISTER PLUGINS
server.register(cookie, {
});
server.register(multipart);
// serving all files in frontend/public
server.register(fastifyStatic, {
	root: path.join(process.cwd(), "./public")
});
// when we write an invalid path in the browser, the browser send a request, that is why we have this
server.setNotFoundHandler((request, reply) => {
	console.log(blue, "server response");
	reply.sendFile("index.html");
});

const start = async () =>
{
    try
    {
		// register routes
		UserRoutes(); // register user routes
		OAuth2Routes(); // register oauth2 routes

        await server.listen({ port: 8080, host: "0.0.0.0" });
        console.log(blue, "Server running at http://localhost:8080");
        console.log(blue, "Prometheus running at http://localhost:9090");
		console.log(blue, "Grafana running at http://localhost:3000");
    }
    catch (err)
    {
        server.log.error(err);
		process.exit(1);
	}
};

start();
