/**
 * Fastify job:
 * Acording to what type you return, string or obj, it set the content type accordingly
 * you can return with return; or reply.send();
 * parses the request query so you can key value by request.query.key
 * you get request body as a string, so you have to parse it with JSON.parse(request.body)
 */

import Fastify from 'fastify';

const server = Fastify();

function updateUserHandler(request, reply)
{
	const userDTO = request.body;
	const user = User.getById(userDTO.Id);
	// copy what is not null and valid to update from user
	for (const key of Object.keys(this)) {
		if (this[key] !== null && key !== "Id") {
			user[key] = this[key];
		}
	}
	user.update();
}

// update a user from a user
server.update("/users", updateUserHandler);

server.get("/string", (request, reply) => {
	return "string";
});
server.get("/obj", (request, reply) => {
	return {obj: "obj"};
});

class	Student
{
	Id;
	Username;
	Password;
}

class	StudentDTO
{
	Id;
	Username;
}
