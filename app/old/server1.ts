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

// content type = json
function generateResponse(request: any, reply: any) {
	return 10;
}

// defining a route
server.get("/", generateResponse);

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
