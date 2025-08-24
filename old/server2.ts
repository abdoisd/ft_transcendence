// importing Fastify factory function or Fastify itself ?
import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import type { FastifyListenOptions } from 'fastify';
import type { FastifyHttpOptions } from 'fastify';

var loggerValue: boolean = true;

const fastifyOptions: FastifyHttpOptions<any> = {
    logger: loggerValue
};

const server: FastifyInstance = Fastify(fastifyOptions);

// default I think
// const opts = {
// 	schema: {
// 		response: {
// 			200: {
// 				type: 'object',
// 				properties: {
// 					hello: { type: 'string' }
// 				}
// 			}
// 		}
// 	}
// }

// this is calling .get method
// sending {"hello":"world"} as raw data
server.get('/', (request, reply) => {
	reply.send({ hello: 'world' })
})

// second route
server.get('/home', (request, reply) => {
	reply.send({ hello: 'home' })
})

const port: number = 8080; // not Number
const host: string = "0.0.0.0";

var listenOptions: FastifyListenOptions = 
{
    port: port,
    host: host
}

// what happen when we add async here
const start = () =>
{
    try
    {
        // .listen([options][, callback])
        server.listen(listenOptions);
        console.log("Server running at http://localhost:8080");
    }
    catch (err)
    {
        server.log.error(err);
		process.exit(1);
	}
};

function main() {
  start();
}

// using the main function
main();
