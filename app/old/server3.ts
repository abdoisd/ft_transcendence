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

// this is calling .get method
// sending {"hello":"world"} as raw data
server.get('/', (request, reply) => {
	reply.send({ hello: 'world' })
})

// second route
server.get('/home', (request, reply) => {
    // Serve an HTML page
    reply.type('text/html').send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Home Page</title>
        </head>
        <body>
            <h1>Welcome to the Home Page</h1>
            <p>This is a simple HTML page served by Fastify.</p>
        </body>
        </html>
    `);
});

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
