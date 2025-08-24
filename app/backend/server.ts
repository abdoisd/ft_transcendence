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
import fs from "fs";

var loggerValue: boolean = true;

const fastifyOptions: FastifyHttpOptions<any> = {
    logger: loggerValue
};

const server: FastifyInstance = Fastify(fastifyOptions);

// serving static files in frontend/public
server.register(fastifyStatic, {
	root: path.join(process.cwd(), "frontend/public")
});

// when nothing found
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
