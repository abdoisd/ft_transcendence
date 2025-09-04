console.log("Hello from routes.ts");

import { server } from './server.ts';
import { User } from './user.ts';

export function routes()
{
	server.get('/', async (request, reply) => {
		return 'home\n';
	});

	// server.post('/post/user', async (request, reply) => {
	// 	const user = request.body as { name: string, age: number };
	// 	console.log("Type of body after got by fastify: ", typeof user);
	// 	console.log("Received user:", user);
	// 	return { message: "pure string" };
	// });

	server.get('/data/user/byId', async (request, reply) => {
		const query = request.query as { id: number };
		console.log("Id: ", query.id);
		return new User(-1, "byId", "test", null, 0, 0, "test", new Date());
	});

	server.get('/data/user/byUsername', async (request, reply) => {
		const query = request.query as { username: string }; // this is just for typescript
		console.log("Username: ", query.Username); // this much match exactly other variable name
		return new User(-1, "byUsername", "test", null, 0, 0, "test", new Date());
	});

	server.post("/post/user", async (request, reply) => {
		return new User(-1, "user", "test", null, 0, 0, "test", new Date());
	});
}
