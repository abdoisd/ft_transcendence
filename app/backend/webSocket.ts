import { Server } from "socket.io";
import { server } from "./server.ts";
import { Game } from "./game.ts";

import { clsGame } from "./data access layer/game.ts";
import { clsTournament } from "./data access layer/tournament.ts";
import { red, green, yellow } from "./global.ts";

export function webSocket()
{
	const	wsServer = new Server(server.server, { // fastify.server is an http.Server
		cors: {
			origin: "*",
			methods: ["GET", "POST"]
		}
	});

	wsServer.on("connection", (client) => {
		client.roomId = null;
	
		client.on("disconnect", () => handleDisconnect(client));
	
		//?
		client.on("join-game", (obj: tournamentDTO) => {

			//? set id to ws client
			client.userId = obj.userId;
			client.gameId = obj.gameId;
			client.tournamentId = obj.tournamentId;

			console.debug(yellow, `User ${client.userId} joined matchmaking`);

			if (client.roomId)
				return;

			if (waitingPlayers.length > 0)
			{
				const opponent = waitingPlayers.pop();
				if (opponent.userId === client.userId)
				{
					console.debug(yellow, "Same player, cannot play against oneself");
					// clean client that tried to join again
					return;
				}

				if (obj.gameId && opponent.gameId != client.gameId)
				{
					console.debug(yellow, "Players in a tournament must have the same gameId");
					console.debug(yellow, `User ${client.userId} is waiting for an opponent`);
					waitingPlayers.push(client);
					return;
				}
				
				startGame(opponent, client);
			}
			else
			{
				console.debug(yellow, `User ${client.userId} is waiting for an opponent`);
				waitingPlayers.push(client);
			}
		});

		client.on("paddle-move", ({ key, pressedState }) => {
			const roomId = client.roomId;
			if (!roomId)
				return;
	
			const game = gameStates.get(roomId);
			if (!game)
				return;
	
			const keyStates = game.keyStates[client.userId];
			if (!keyStates)
				return;
	
			if (key === "ArrowUp" || key === "w")
				keyStates.up = pressedState;
			if (key === "ArrowDown" || key === "s")
				keyStates.down = pressedState;
		});
		
		client.on("join-tournament", (obj) => joinTournamentHandler(client, obj));
	});

	const waitingGames = [];

	const gameStates = new Map();
	const waitingPlayers = []; // what type this holds, client ?
	function gameLoop(roomId, game): Promise<any> {
		return new Promise((resolve) => {
			let lastTime = Date.now();
	
			const interval = setInterval(() => {
				const now = Date.now();
				const delta = (now - lastTime) / 1000;
				lastTime = now;
	
				game.update(delta);
	
				if (game.running) {
					wsServer.to(roomId).emit("game-state", game.getState());
				}
	
				if (!game.running) {

					//? GAME END
					console.debug(yellow, "Winner Id:", game.winnerId);
	
					// Add game to db
					const dbGame: clsGame = new clsGame({
						Id: -1,
						User1Id: game.players[0],
						User2Id: game.players[1],
						Date: new Date(),
						WinnerId: game.winnerId,
						TournamentId: null
					});
					dbGame.add();
					//?
	
					clearInterval(interval);
					gameStates.delete(roomId);
	
					// Resolve the promise when the game ends
					resolve(game);
				}
			}, 1000 / 60);
		});
	}
	
	function  startGame(p1, p2) {

		console.debug(yellow, `Starting game between User ${p1} and User ${p2}`);
		
		return new Promise((resolve) => {
			if (!p1.connected || !p2.connected)
			{
				if (p1.connected) waitingPlayers.push(p1);
				if (p2.connected) waitingPlayers.push(p2);
				resolve(); // Resolve immediately if players are not connected
				return;
			}
	
			const roomId = `game_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
			p1.join(roomId);
			p2.join(roomId);
	
			p1.roomId = roomId;
			p2.roomId = roomId;
	
			const game = new Game(p1.userId, p2.userId, wsServer, roomId);
			gameStates.set(roomId, game);
			game.tournamentId = p1.tournamentId;
	
			wsServer.to(roomId).emit("start-game", game.getFullState());
	
			// Assuming gameLoop returns a promise that resolves when the game is done
			resolve(gameLoop(roomId, game));
		});
	}
	
	// ======================================================================
	
	function handleDisconnect(leaver) {

		console.debug(red, "User disconnected:", leaver.userId);
		
		const waitingIndex = waitingPlayers.indexOf(leaver);
		if (waitingIndex !== -1) {
			waitingPlayers.splice(waitingIndex, 1);
			return;
		}
	
		const roomId = leaver.roomId;
		if (!roomId)
			return;
	
		const clientsInRoom = wsServer.sockets.adapter.rooms.get(roomId);
		if (!clientsInRoom) {
			gameStates.delete(roomId);
			return;
		}
	
		const game = gameStates.get(roomId);
		if (game)
			game.running = false;
		wsServer.to(roomId).emit("opponent-left");
	
		gameStates.delete(roomId);
		leaver.leave(roomId);
		leaver.roomId = null;
	
		const validSurvivors = [...clientsInRoom]
			.filter(id => id !== leaver.id)
			.map(id => wsServer.sockets.sockets.get(id))
			.filter(socket => socket?.connected);
	
		validSurvivors.forEach(survivor => {
			if (!waitingPlayers.includes(survivor)) {
				waitingPlayers.push(survivor);
				console.log("Has been pushed back to waiting list");
				survivor.roomId = null;
			}
		});
	
		while (waitingPlayers.length >= 2) {
			const p1 = waitingPlayers.pop();
			const p2 = waitingPlayers.pop();
			startGame(p1, p2);
		}
	}

	async function	joinTournamentHandler(client, obj)
	{
		client.userId = obj.userId;

		usersQueue.enqueue(client);

		if (usersQueue.size() >= 4)
		{
			console.log(green, "Reached 4 players, starting tournament games...");
			
			const game1 = await startGame(usersQueue.dequeue(), usersQueue.dequeue());
			const game2 = await startGame(usersQueue.dequeue(), usersQueue.dequeue());

			console.debug(yellow, "Both first finished");

			const winner1Id = game1.winnerId;
			const winner2Id = game2.winnerId;

			const allClients = Array.from(wsServer.sockets.sockets.values());
			const winner1Client = allClients.find(client => client.userId === winner1Id);
			const winner2Client = allClients.find(client => client.userId === winner2Id);

			console.debug(yellow, `Winners are: ${winner1Client} and ${winner2Client}`);

			if (winner1Client && winner2Client)
			{
				console.log(green, "Last game starting...");
				startGame(winner1Client, winner2Client);
			}
		}
		else
			console.debug(yellow, "Waiting for more players to join the tournament...");
	}
}

import { Queue } from "./data structures/queue.ts";
const	usersQueue = new Queue();
