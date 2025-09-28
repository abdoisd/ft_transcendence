import { Game } from "./game.ts";
import { clsGame } from "./data access layer/game.ts";
import { red, green, yellow, cyan } from "./global.ts";
import { ws, server } from "./server.ts";
import ChatRepository from "./repositories/ChatRepository.ts";
import { TOURNAMENT_ID, User } from "./data access layer/user.ts";

export const userIdUserId = new Map();
export const userIdSocket = new Map();

function authMiddleware(socket, next) {
	const token = socket.handshake.auth.token;
	if (!token)
		return next(new Error('Authentication error: No token provided'));
	try {
		const payload = server.jwt.verify(token);
		socket.userId = payload.Id;
		return next();
	} catch {
		return next(new Error('Authentication error: token invalid'));
	}
}

export function gameWs() {
	const wsServerTournament = ws.of("/tournament").use(authMiddleware);
	const wsServerRemote = ws.of("/remote").use(authMiddleware);
	const wsServerInvite = ws.of("/invite").use(authMiddleware);
	const wsServerAI = ws.of("/ai").use(authMiddleware);

	const aiGames = new Map();
	wsServerAI.on("connection", (client) => {
		const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
		client.roomId = roomId;
		client.join(roomId);
		
		client.on("join-game", () => {
			const game = new Game(client, "AI", wsServerAI, roomId);
			aiGames.set(roomId, game);
			wsServerAI.to(roomId).emit("start-game", game.getFullState());
			wsServerAI.to(roomId).emit("score-state", game.scores);
			let lastTime = Date.now();
			const interval = setInterval(async () => {
				const now = Date.now();
				const delta = (now - lastTime) / 1000;
				lastTime = now;
				game.update(delta);
				if (game.running)
					wsServerAI.to(roomId).emit("game-state", game.getState());
				else
				{
					clearInterval(interval);
					if (game.winnerId) {
						const dbGame = new clsGame({
							Id: -1,
							User1Id: client.userId,
							User2Id: null,
							Date: Date.now(),
							WinnerId: game.winnerId,
							TournamentId: -1
						});
						dbGame.add();
						const user1 = await User.getById(client.userId);
						if (game.winnerId == user1.Id)
							user1.Wins++;
						else
							user1.Losses++;
						user1.update();
					}
				}
			}, 16);
		});

		client.on("disconnect", () => {
			const roomId = client.roomId;
			if (!roomId)
				return;
			const game = aiGames.get(roomId);
			if (!game)
				return;
			game.running = false;
			aiGames.delete(roomId);
		});

		client.on("move", ({key, pressedState}) => {
			const roomId = client.roomId;
			if (!roomId)
				return;
			const game = aiGames.get(roomId);
			if (!game)
				return;
			const keyStates = game.keyStates[client.userId];
			if (!keyStates)
				return;
			if (key == "ArrowUp" || key == "w")
				keyStates.up = pressedState;
			else if (key == "ArrowDown" || key == "s")
				keyStates.down = pressedState;
		});
	});

	const waitingRemotePlayers = [];
	const remoteGames = new Map();
	wsServerRemote.on("connection", (client) => {
		client.roomId = null;
		client.on("join-game", () => {
			const opponentIndex = waitingRemotePlayers.findIndex((sock) => sock.userId !== client.userId);
			if (opponentIndex !== -1) {
				const opponent = waitingRemotePlayers.splice(opponentIndex, 1)[0];
				startRemoteGame(opponent, client);
			} else {
				waitingRemotePlayers.push(client);
			}
		});

		client.on("move", ({key, pressedState}) => {
			const roomId = client.roomId;
			if (!roomId)
				return;
			const game = remoteGames.get(roomId);
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

		client.on("disconnect", () => {
			const leaver = client;
			const leaverIndexInWaitingList = waitingRemotePlayers.indexOf(leaver);
			if (leaverIndexInWaitingList !== -1) {
				waitingRemotePlayers.splice(leaverIndexInWaitingList, 1);
				return;
			}

			const roomId = leaver.roomId;
			if (roomId) {
				leaver.leave(roomId);
			}
			const game = remoteGames.get(roomId);
			if (game) {
				game.running = false;
				wsServerRemote.to(roomId).emit("opponent-left");
				const survivor = (leaver.userId === game.p1.userId) ? game.p2 : game.p1;
				survivor.disconnect(true);
				remoteGames.delete(roomId);
			}
		});
	});
	function startRemoteGame(p1, p2) {
		if (!p1.connected || !p2.connected) {
			if (p1.connected) {
				waitingRemotePlayers.push(p1);
				p1.roomId = null;
			}
			if (p2.connected) {
				waitingRemotePlayers.push(p2);
				p2.roomId = null;
			}
			return;
		}

		const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
		p1.join(roomId);
		p2.join(roomId);

		p1.roomId = roomId;
		p2.roomId = roomId;

		const game = new Game(p1, p2, wsServerRemote, roomId);
		remoteGames.set(roomId, game);

		wsServerRemote.to(roomId).emit("start-game", game.getFullState());
		wsServerRemote.to(roomId).emit("score-state", game.scores);
		let lastTime = Date.now();
		const interval = setInterval( async () => {
			const now = Date.now();
			const delta = (now - lastTime) / 1000;
			lastTime = now;
			
			game.update(delta);

			if (game.running) {
				wsServerRemote.to(roomId).emit("game-state", game.getState());
			} else {
				clearInterval(interval);
				if (game.winnerId) {
					const dbGame = new clsGame({
						Id: -1,
						User1Id: p1.userId,
						User2Id: p2.userId,
						Date: Date.now(),
						WinnerId: game.winnerId,
						TournamentId: -1
					});
					dbGame.add();
					const user1 = await User.getById(p1.userId);
					const user2 = await User.getById(p2.userId);
					if (game.winnerId == user1.Id)
					{
						user1.Wins++;
						user2.Losses++;
					}
					else
					{
						user1.Losses++;
						user2.Wins++;
					}
					user1.update();
					user2.update();
				}
				remoteGames.delete(roomId);
			}
		}, 16);
	}

	const tournaments = new Map();
	wsServerTournament.on("connection", (client) => {
		client.on("join-tournament", () => {
			let tourId = [...tournaments.keys()].find(id => tournaments.get(id).players.length < 4);
			let tour;

			if (!tourId) {
				tourId = `tournament_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
				tour = new Tournament(startTournamentGame);
				tournaments.set(tourId, tour);
			} else {
				tour = tournaments.get(tourId);
			}

			if (tour.players.some(p => p.userId === client.userId)) {
				client.emit("error", "You already joined the tournament.");
				client.disconnect(true);
				return;
			}

			client.tournamentId = tourId;
			client.join(tourId);
			tour.addPlayer(client);

			if (tour.players.length === 4) {
				tour.startSemifinals();
			}
		});
		client.on("move", ({key, pressedState}) => {
			const game = client.game;
			if (!game)
				return;
			const keyStates = game.keyStates[client.userId];
			if (!keyStates)
				return;
			if (key == "ArrowUp" || key == "w")
				keyStates.up = pressedState;
			else if (key == "ArrowDown" || key == "s")
				keyStates.down = pressedState;
		});
		client.on("disconnect", () => {
			const leaver = client;
			const currTournament = tournaments.get(leaver.tournamentId);
			if (!currTournament)
				return;
			if (leaver == currTournament.matches.semi1.loser
				|| leaver == currTournament.matches.semi2.loser
				|| leaver == currTournament.matches.final?.loser)
				return;
			currTournament.void = true;
			for (const player of currTournament.players) {
				if (player !== leaver) {
					player.emit("void");
				}
			}
			tournaments.delete(leaver.tournamentId);
		});
	});
	function startTournamentGame(p1, p2) {
		const tournament = tournaments.get(p1.tournamentId);
		if (!p1.connected || !p2.connected || !tournament) {
			return;
		}

		const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
		p1.join(roomId);
		p2.join(roomId);
		p1.roomId = roomId;
		p2.roomId = roomId;

		const game = new Game(p1, p2, wsServerTournament, roomId);
		p1.game = game;
		p2.game = game;

		wsServerTournament.to(roomId).emit("start-game", game.getFullState());
		wsServerTournament.to(roomId).emit("score-state", game.scores);

		let lastTime = Date.now();
		const interval = setInterval(() => {
			const now = Date.now();
			game.update((now - lastTime) / 1000);
			lastTime = now;
	
			if (game.running && !tournament.void) {
					wsServerTournament.to(roomId).emit("game-state", game.getState());
			} else {
				clearInterval(interval);
				if (!tournament.void) {
					if (game.winnerId == p1.userId) {
						tournament.onGameEnd(p1, p2);
					} else if (game.winnerId == p2.userId) {
						tournament.onGameEnd(p2, p1);
					}
					
					if (tournament.matches.semi1.winner && tournament.matches.semi2.winner && !tournament.done) {
						tournament.matches.semi1.loser.emit("phase", tournament.getState());
						tournament.matches.semi2.loser.emit("phase", tournament.getState());
						
						ChatRepository.storeMessage(TOURNAMENT_ID, tournament.matches.semi1.winner.userId, "Finale starts soon...", "MSG");
						ChatRepository.storeMessage(TOURNAMENT_ID, tournament.matches.semi2.winner.userId, "Finale starts soon...", "MSG");
						let count = 0;
						const counter = setInterval(() => {
							if (count === 5) {
								clearInterval(counter);
								tournament.startFinal();
							}
							const data = {
								one: tournament.matches.semi1.winner.userId,
								two: tournament.matches.semi2.winner.userId,
								count: 5 - count
							}
							tournament.matches.semi1.winner.emit("next-game", data);
							tournament.matches.semi2.winner.emit("next-game", data);
							count++;
						}, 1000);

					} else if (tournament.done) {
						for (const player of tournament.players) {
							player.emit("phase", tournament.getState());
						}
						tournaments.delete(p1.tournamentId);
					}
				}
			}
		}, 16);
	}

	const inviteGames = new Map();
	wsServerInvite.on("connection", (client) => {
		const opponentId = userIdUserId.get(client.userId);
		const opponentClient = userIdSocket.get(opponentId);
		if (opponentClient) {
			startInviteGame(opponentClient, client);
		} else {
			userIdSocket.set(client.userId, client);
		}

		client.on("move", ({key, pressedState}) => {
			const roomId = client.roomId;
			if (!roomId)
				return;
			const game = inviteGames.get(roomId);
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

		client.on("disconnect", () => {
			const leaver = client;
			const roomId = leaver.roomId;
			const game = inviteGames.get(roomId);
			if (game)
				game.running = false;
			wsServerInvite.to(roomId).emit("opponent-left");

			inviteGames.delete(roomId);

			userIdSocket.delete(leaver.userId);
			userIdUserId.delete(leaver.userId);
			userIdUserId.delete(leaver.userId);
		});
	});

	function startInviteGame(p1, p2) {
		if (!p1.connected || !p2.connected) {
			userIdSocket.delete(p1.userId);
			userIdSocket.delete(p2.userId);
			userIdUserId.delete(p1.userId);
			userIdUserId.delete(p2.userId);
			return;
		}

		const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
		p1.join(roomId);
		p2.join(roomId);

		p1.roomId = roomId;
		p2.roomId = roomId;

		const game = new Game(p1, p2, wsServerInvite, roomId);
		inviteGames.set(roomId, game);

		wsServerInvite.to(roomId).emit("start-game", game.getFullState());
		wsServerInvite.to(roomId).emit("score-state", game.scores);
		let lastTime = Date.now();
		const interval = setInterval(async () => {
			const now = Date.now();
			const delta = (now - lastTime) / 1000;
			lastTime = now;
			
			game.update(delta);

			if (game.running) {
				wsServerInvite.to(roomId).emit("game-state", game.getState());
			} else {
				clearInterval(interval);
				if (game.winnerId) {
					const dbGame = new clsGame({
						Id: -1,
						User1Id: p1.userId,
						User2Id: p2.userId,
						Date: Date.now(),
						WinnerId: game.winnerId,
						TournamentId: -1
					});
					dbGame.add();
	
					const user1 = await User.getById(p1.userId);
					const user2 = await User.getById(p2.userId);
					if (game.winnerId == user1.Id)
					{
						user1.Wins++;
						user2.Losses++;
					}
					else
					{
						user1.Losses++;
						user2.Wins++;
					}
					user1.update();
					user2.update();
				}
				inviteGames.delete(roomId);
			}
		}, 16);
	}
}

class Tournament {
	players: any[];
	status: string;
	matches: {
		semi1: { players: any[]; winner: any | null; loser: any | null };
		semi2: { players: any[]; winner: any | null; loser: any | null };
		final: { players: any[]; winner: any | null; loser: any | null };
	};
	starterFunction: Function;
	done: Boolean;
    constructor(starter) {
		this.players = [];
		this.status = 'waiting';
		this.matches = {
			semi1: { players: [], winner: null, loser: null },
			semi2: { players: [], winner: null, loser: null },
			final: { players: [], winner: null, loser: null }
		};
		this.done = false;
		this.starterFunction = starter;
    }

    addPlayer(client) {
		this.players.push(client);
		if (this.players.length === 4) {
			this.setupMatches();
		}
    }

    setupMatches() {
		this.matches.semi1.players = [this.players[0], this.players[1]];
		this.matches.semi2.players = [this.players[2], this.players[3]];

		this.status = 'ready';
    }

    startSemifinals() {
		this.starterFunction(...this.matches.semi1.players);
        this.starterFunction(...this.matches.semi2.players);
        this.status = 'semifinals';
    }

	startFinal() {
		this.matches.final.players = [this.matches.semi1.winner, this.matches.semi2.winner];
		this.starterFunction(...this.matches.final.players);
		this.status = 'final';
		this.done = true;
    }
	
    onGameEnd(winner, loser) {
		if (this.matches.final.players.includes(winner)) {
			this.matches.final.winner = winner;
			this.matches.final.loser = loser;
			this.status = "finished";
			return;
		} else if (this.matches.semi1.players.includes(winner)) {
			this.matches.semi1.winner = winner;
			this.matches.semi1.loser = loser;
		} else if (this.matches.semi2.players.includes(winner)) {
			this.matches.semi2.winner = winner;
			this.matches.semi2.loser = loser;
		} 
	}

	getState() {
		return {
			semi1: {
				one: this.matches.semi1.players[0]?.userId,
				two: this.matches.semi1.players[1]?.userId,
				winner: this.matches.semi1.winner?.userId
			},
			semi2: {
				one: this.matches.semi2.players[0]?.userId,
				two: this.matches.semi2.players[1]?.userId,
				winner: this.matches.semi2.winner?.userId
			},
			final: {
				one: this.matches.final.players?.[0]?.userId,
				two: this.matches.final.players?.[1]?.userId,
				winner: this.matches.final.winner?.userId
			}
		}
	}
}
