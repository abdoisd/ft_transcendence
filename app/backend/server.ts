// this server only server index.html and the api endpoints

import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import fastifyStatic from "@fastify/static"; // plugin to serve all files in a directory without me serving them, route for each one
import path from "path";
import multipart from "@fastify/multipart";
import cookie from "@fastify/cookie";

// api
import { UserRoutes } from "./Data Access Layer/User.ts";

import { OAuth2Routes } from "./oauth2.ts";

export const server: FastifyInstance = Fastify({logger: true});

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
