// this is for the backend server
// communicator with the frontend + Business and Data Access Layers

// client connect the server, server serve / aka index.html
// client have index.html, css, js
// for a static website, the server job is done

// this server only server index.html

import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import type { FastifyListenOptions } from 'fastify';
import type { FastifyHttpOptions } from 'fastify';
import fastifyStatic from "@fastify/static"; // plugin to serve all files in a directory without me serving them, route for each one
import path from "path";

// database
import { registerDatabaseRoutes } from "./apis.ts";

var loggerValue: boolean = true;

const fastifyOptions: FastifyHttpOptions<any> = {
    logger: loggerValue
};

const server: FastifyInstance = Fastify(fastifyOptions);

// route for: GET /data
// send json data
server.get('/api/data', async (request, reply) => {
	const users = [
		{ id: 1, name: "Alice Johnson" },
		{ id: 2, name: "Bob Smith" },
		{ id: 3, name: "Charlie Brown" },
		{ id: 4, name: "Dana White" },
		{ id: 5, name: "Ethan Black" }
	];
	return users; // if you make { users }, it's completely different, you will have to change the frontend code
});

// serving static files in frontend/public
server.register(fastifyStatic, {
	root: path.join(process.cwd(), "frontend/public")
});

// when we write an invalid path in the browser, the browser send a request, that is why we have this
server.setNotFoundHandler((request, reply) => {
	reply.sendFile("index.html"); // it know that path from the plugin ?
});

const port: number = 8080; // not Number
const host: string = "0.0.0.0";

var listenOptions: FastifyListenOptions = 
{
    port: port,
    host: host
}

const start = () =>
{
    try
    {
        server.listen(listenOptions);
        console.log("Server running at http://localhost:8080");
    }
    catch (err)
    {
        server.log.error(err);
		process.exit(1);
	}
};

start();

registerDatabaseRoutes(server);
