import { guid } from "../global.ts";
import { server } from "../server.ts"
import { Game } from "../game.ts";


const apiGames = new Map();

export function gameRoutes()
{
	server.get("/api-game/init", (request, reply) => {
		const game = new Game("player1api", "player2api", null, null);
		const gameId = guid();
		apiGames.set(gameId, game);

		reply.send({
			gameId: gameId,
			message: "Game initialized"
		});
	});

	server.get("/api-game/start/:id", (request, reply) => {
		const game = apiGames.get(request.params.id);
		if (!game) {
			reply.code(404).send({error: "Game not found"});
			return;
		}

		game.startApiGame();

		reply.send({
			gameId: request.params.id,
			message: "Game started",
			gameState: game.getStateApi()
		});
	});

	server.get("/api-game/state/:id", (request, reply) => {
		const game = apiGames.get(request.params.id);
		if (!game) {
			reply.code(404).send({error: "Game not found"});
			return;
		}

		reply.send({
			gameId: request.params.id,
			message: "Game state",
			gameState: game.getStateApi()
		});
	});

	server.post("/api-game/:id/:player/:move", (request, reply) => {
		const game = apiGames.get(request.params.id);
		if (!game) {
			reply.code(404).send({error: "Game not found"});
			return;
		}

		const {player, move} = request.params;
		if ((player != "player1api" && player != "player2api") || (move != "none" && move != "down" && move != "up")) {
			reply.send({success: false});
			return;
		}

		game.moveApiGame(player, move);
		reply.send({success: true});
	});

}
