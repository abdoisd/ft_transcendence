// importing Fastify factory function or Fastify itself ?
import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import type { FastifyListenOptions } from 'fastify';
import type { FastifyHttpOptions } from 'fastify';

// those are imported once
import { createHomePage, createAboutPage } from './view.ts';

var loggerValue: boolean = true;

const fastifyOptions: FastifyHttpOptions<any> = {
    logger: loggerValue
};

const server: FastifyInstance = Fastify(fastifyOptions);

var page: string = "<h1>Hello world from Fastify!<h1>"

// reply core Fastify object
// send can send many things, like stream
server.get('/', (request, reply) => {
	reply.type("text/html").send(createHomePage());
})

server.get('/about', (request, reply) => {
	reply.type("text/html").send(createAboutPage());
})

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
