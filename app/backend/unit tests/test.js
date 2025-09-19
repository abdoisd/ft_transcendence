import Fastify from "fastify";
export const fastify = Fastify();

fastify.get('/', async (request, reply) => {
	reply.redirect('/destination');
});

fastify.get('/destination', async (request, reply) => {
	return { message: 'You have reached the destination!' };
});

fastify.addHook('onSend', async (request, reply, payload) => {
	console.info("Request to server: " + request.method + " " + request.url);
	console.info("Server response: " + reply.statusCode);
});

const start = async () => {
	try {
		await fastify.listen({host: "0.0.0.0", port: 3000});
		fastify.log.info(`Server listening on http://localhost:3000`);
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
