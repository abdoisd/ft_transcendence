// this server only server index.html and the api endpoints

import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import fastifyStatic from "@fastify/static"; // plugin to serve all files in a directory without me serving them, route for each one
import path from "path";
import multipart from "@fastify/multipart";
import cookie from "@fastify/cookie";
import net from "net";

// api
import { UserRoutes } from "./Data Access Layer/User.ts";

import { OAuth2Routes } from "./oauth2.ts";
import { blue } from "./global.ts";

export const server: FastifyInstance = Fastify({logger: true});

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

// ELK
// CREATE CLIENT
const logClient = new net.Socket();
logClient.connect(5044, 'logstash', () => {
  console.log(blue, 'Connected to Logstash');
});
// FASTFIFY ONSEND RESPONSE
server.addHook('onSend', (request, reply, payload, done) => {
	console.log(blue, 'onSend');

	const log = {
		"service": "my-fastify-service",
		"request": {
		  "method": request.method,
		  "url": request.url, // not valid in kibana
		  "headers": request.headers,
		  "query": request.query,
		  "body": request.body,
		},
		"response": {
		  "status_code": reply.statusCode,
		},
	};

	// post log to logstash
	fetch('http://logstash:5044', {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json'
		},
		body: JSON.stringify(log)
	})
	.catch(error => console.error('Error:', error));
  
	done(); // call done to continue the response
});

// REGISTER PLUGINS
server.register(cookie, {
});

server.register(multipart);
// serving all files in frontend/public
server.register(fastifyStatic, {
	root: path.join(process.cwd(), "frontend/public")
});

// when we write an invalid path in the browser, the browser send a request, that is why we have this
server.setNotFoundHandler((request, reply) => {
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
        console.log("Server running at http://localhost:8080");
    }
    catch (err)
    {
        server.log.error(err);
		process.exit(1);
	}
};

start();
