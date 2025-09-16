import { server } from "../server.ts"

export function gameRoutes()
{
	server.get("/api/game/state/:id", (request, reply) => {
		const Id = request.query.Id;
		const	user = request.body;
		const id = request.params;

		console.log(Id);
		console.log(user);
		console.log(id);

	});


}
