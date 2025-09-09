// minimal fastify server
import Fastify from 'fastify';

const server = Fastify();

// users routes
// get all
server.get('/users', async (request, reply) => {
	// reply.send("all users");
	// if it has ? it's used to filter
});

// get user by id
// param wont work with id and user
server.get('/users?', async (request, reply) => {
	// // reply.send("get user by id: " + request.params.id);
	// console.log(request.params);
	// if (request.params.id) {
	// 	reply.send("get user by id: " + request.params.id);
	// }
	// else if (request.params.username) {
	// 	reply.send("get user by username: " + request.params.username);
	// }
	// else
	// {
	// 	reply.send("invalid request");
	// }
	if (request.query.id)
	{
		reply.send("get user by id: " + request.query.id);
	}
	else if (request.query.username)
	{
		reply.send("get user by username: " + request.query.username);
	}
	else
	{
		reply.send("invalid request");
	}
});

// server.get('/users/:username', async (request, reply) => {
// 	reply.send("get user by username: " + request.params.username);
// });

// add user
server.post('/users', async (request, reply) => {
	reply.send("add user");
});

server.put('/users', async (request, reply) => {
	reply.send("update user");
});

server.delete('/users/:id', async (request, reply) => {
	reply.send("delete user");
});

try {
	await server.listen({ host: "0.0.0.0", port: 3000 });
	// console.log('Server listening on http://localhost:3000');
}
catch (err)
{
	server.log.error(err);
	process.exit(1);
}

// on desktop apps, we just call clsUser.getAll()
// on web apps, call get /users

/**
 * clsUser.getAll()		GET /users
 * clsUser.getById(id)	GET /users/:id
 * clsUser.add(user)	POST /users
 * clsUser.update(user)	PUT /users
 * clsUser.delete(id)	DELETE /users/:id
 */

/**
 * know I am handling users, then I was handling adding records
 */

/**
 * routes:
 * update
 * delete
 * get user by id, get all users (for now)
 */
