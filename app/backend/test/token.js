// server.mjs
import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';

const fastify = Fastify();

fastify.register(fastifyJwt, {
  secret: 'caeeea83-4390-48b8-bb27-07c0e9ae85f4'
});

// Start server
fastify.listen({ host: "0.0.0.0", port: 7545 }, (err, address) => {
	if (err) throw err;
	console.log(`Server running at ${address}`);
	const token = fastify.jwt.sign({
	  Id: -1,
	  IsRoot: 1
	});
	console.log(token);
});
