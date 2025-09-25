import { Game } from "./game.ts";
import { clsGame } from "./data access layer/game.ts";
import { red, green, yellow, cyan } from "./global.ts";
import { ws, server } from "./server.ts";
import ChatRepository from "./repositories/ChatRepository.ts";
import { TOURNAMENT_ID } from "./data access layer/user.ts";

export const userIdUserId = new Map();
export const userIdSocket = new Map();

export function webSocket() {
	const wsServerTournament = ws.of("/tournament");
	const wsServerRemote = ws.of("/remote");
	const wsServerInvite = ws.of("/invite");
	const wsServerAI = ws.of("/ai");
	
	wsServerTournament.use((socket, next) => {
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
	});
	wsServerRemote.use((socket, next) => {
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
	});
	wsServerInvite.use((socket, next) => {
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
	});
	wsServerAI.use((socket, next) => {
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
	});


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
			const interval = setInterval(() => {
				const now = Date.now();
				const delta = (now - lastTime) / 1000;
				lastTime = now;
				game.update(delta);
				if (game.running)
					wsServerAI.to(roomId).emit("game-state", game.getState());
				else
				{
					clearInterval(interval);
					const dbGame = new clsGame({
						Id: -1,
						User1Id: client.userId,
						User2Id: null,
						Date: Date.now(),
						WinnerId: game.winnerId,
						TournamentId: -1
					});
					dbGame.add();
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
			console.log("HERE KEY STATES");
			const keyStates = game.keyStates[client.userId];
			if (!keyStates)
				return;
			if (key === "ArrowUp" || key === "w")
				keyStates.up = pressedState;
			if (key === "ArrowDown" || key === "s")
				keyStates.down = pressedState;
		});

		client.on("disconnect", () => handleRemoteDisconnect(client));
		function handleRemoteDisconnect(leaver) {
			const leaverIndexInWaitingList = waitingRemotePlayers.indexOf(leaver);
			if (leaverIndexInWaitingList !== -1) {
				waitingRemotePlayers.splice(leaverIndexInWaitingList, 1);
				return;
			}

			const roomId = leaver.roomId;
			const clientsInRoom = wsServerRemote.adapter.rooms.get(roomId);
			if (!clientsInRoom) {
				remoteGames.delete(roomId);
				return;
			}

			const game = remoteGames.get(roomId);
			if (game)
				game.running = false;
			wsServerRemote.to(roomId).emit("opponent-left");

			remoteGames.delete(roomId);
			leaver.leave(roomId);
			leaver.roomId = null;

			const validSurvivors = [...clientsInRoom].filter((id) => id !== leaver.id)
				.map((id) => wsServerRemote.sockets.get(id))
				.filter((socket) => socket?.connected);

			validSurvivors.forEach((survivor) => {
				if (!waitingRemotePlayers.includes(survivor)) {
					waitingRemotePlayers.push(survivor);
					survivor.roomId = null;
				}
			});

			while (waitingRemotePlayers.length >= 2) {
				const p1 = waitingRemotePlayers.pop();
				const p2 = waitingRemotePlayers.pop();
				startRemoteGame(p1, p2);
			}
		}
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
		const interval = setInterval(() => {
			const now = Date.now();
			const delta = (now - lastTime) / 1000;
			lastTime = now;
			
			game.update(delta);

			if (game.running) {
				wsServerRemote.to(roomId).emit("game-state", game.getState());
			} else {
				clearInterval(interval);
				// end game ...
				const dbGame = new clsGame({
					Id: -1,
					User1Id: p1.userId,
					User2Id: p2.userId,
					Date: Date.now(),
					WinnerId: game.winnerId,
					TournamentId: -1
				});
				dbGame.add();

				remoteGames.delete(roomId);
				// delete ids
			}
		}, 16);
	}

	const tournaments = new Map();
	let tournament;
	let tournamentId;
	wsServerTournament.on("connection", (client) => {
		client.on("join-tournament", () => {
			if (!tournament) {
				tournament = new Tournament(startTournamentGame);
				tournament.addPlayer(client);
				tournamentId = `tournament_${Date.now()}_${Math.random().toString(10).slice(2, 7)}`;
				tournaments.set(tournamentId, tournament);
				client.tournamentId = tournamentId;
				client.join(tournamentId);
				console.log(red, `FIRST USER: ${client.userId}`);
			} else if (tournament.players.length <= 4) {
				const alreadyJoined = tournament.players.some(p => p.userId === client.userId);
				if (alreadyJoined) {
					client.emit("error", "You already joined the tournament.");
					client.disconnect(true);
					console.log(red, `YOU AREADY JOINED ${client.userId}`);
					return;
				}

				client.tournamentId = tournamentId;
				client.join(tournamentId);
				tournament.addPlayer(client);
				if (tournament.players.length == 4) {
					tournament.startSemifinals();
					tournament = null;
				}
				console.log(red, `added non first user: ${client.userId}`);
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
			tournament = null;
			for (const player of currTournament.players) {
				if (player !== leaver) {
					console.log("SENT VOID");
					// player.game.looping = false; // what if 3 have joined and one of them leaves would this be undefined?
					player.emit("void");
				} else {
					console.log("TRYING TO SPLICE?")
					// const idx = currTournament.players.findIndex((p) => p === leaver);
					// if (idx !== -1) {
					// 	currTournament.players.splice(idx, 1);
					// 	console.log(red, `leaver was taken out of oturnament players: ${leaver.userId}`);
					// }
				}
			}

			currTournament.void = true;
		});
	});
	function startTournamentGame(p1, p2) {
		if (!p1.connected || !p2.connected) {
			const tour = tournaments.get(p1.tournamentId);
			tour.void = true;
			for (const dp of tour.players) {
				if (dp.connected) {
					dp.emit("void");
				}
			}
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
			console.log("EVENT LOOP: TOURNAMENT");
			const now = Date.now();
			game.update((now - lastTime) / 1000);
			lastTime = now;
	
			if (game.running) {
					wsServerTournament.to(roomId).emit("game-state", game.getState());
			} else {
				clearInterval(interval);
				const tournamentId = p1.tournamentId;
				const tournament = tournaments.get(tournamentId);
				if (tournament && !tournament.void) {
					if (game.winnerId == p1.userId) {
						tournament.onGameEnd(p1, p2);
						console.log(cyan, "P1 WON", p1.userId);
					} else if (game.winnerId == p2.userId) {
						tournament.onGameEnd(p2, p1);
						console.log(cyan, "P2 WON", p2.userId);
					}
					
					if (tournament.matches.semi1.winner && tournament.matches.semi2.winner && !tournament.done) {
						tournament.matches.semi1.loser.emit("phase", tournament.getState());
						tournament.matches.semi2.loser.emit("phase", tournament.getState());
						
						ChatRepository.storeMessage(TOURNAMENT_ID, tournament.matches.semi1.winner.userId, "Finale starts soon...", "MSG");
						ChatRepository.storeMessage(TOURNAMENT_ID, tournament.matches.semi2.winner.userId, "Finale starts soon...", "MSG");
						let count = 0;
						const counter = setInterval(() => {
							console.log(`COUNTER SAYS ${count}`);
							if (count === 5) {
								clearInterval(counter);
								tournament.startFinal();
								console.log("STARTED FINAL");
							}
							const data = {
								one: tournament.matches.semi1.winner.userId,
								two: tournament.matches.semi2.winner.userId,
								count: 5 - count
							}
							tournament.matches.semi1.winner.emit("next-game", data);
							tournament.matches.semi2.winner.emit("next-game", data);
							console.log(count);
							count++;
						}, 1000);

					} else if (tournament.done) {
						for (const player of tournament.players) {
							player.emit("phase", tournament.getState());
						}
						console.log("WE ARE DONE");
						console.log(`winner of the final: ${tournament.matches.final.winner}`);
					}
				}
			}
		}, 16);
	}

	const inviteGames = new Map();
	wsServerInvite.on("connection", (client) => {
		console.log(`CONNECTED TO ME ${client.userId}`);
		const opponentId = userIdUserId.get(client.userId);
		const opponentClient = userIdSocket.get(opponentId);
		if (opponentClient) {
			startInviteGame(opponentClient, client);
			console.log("GAME START");
		} else {
			userIdSocket.set(client.userId, client);
			console.log("OTHER STILL HASN'T JOINED");
		}

		client.on("move", ({key, pressedState}) => {
			const roomId = client.roomId;
			if (!roomId)
				return;
			const game = inviteGames.get(roomId);
			if (!game)
				return;
			console.log("HERE KEY STATES");
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
		const interval = setInterval(() => {
			const now = Date.now();
			const delta = (now - lastTime) / 1000;
			lastTime = now;
			
			game.update(delta);

			if (game.running) {
				wsServerInvite.to(roomId).emit("game-state", game.getState());
			} else {
				inviteGames.delete(roomId);
				clearInterval(interval);

				// end game ...
				const dbGame = new clsGame({
					Id: -1,
					User1Id: p1.userId,
					User2Id: p2.userId,
					Date: Date.now(),
					WinnerId: game.winnerId,
					TournamentId: -1
				});
				dbGame.add();

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
	void: Boolean;
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
		this.void = false;
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
		// const shuffled = [...this.players].sort(() => Math.random() - 0.5);
		// this.matches.semi1.players = [shuffled[0], shuffled[1]];
		// this.matches.semi2.players = [shuffled[2], shuffled[3]];

		this.matches.semi1.players = [this.players[0], this.players[1]];
		this.matches.semi2.players = [this.players[2], this.players[3]];

		this.status = 'ready';
		console.log("SETUP MATCHES");
    }

    startSemifinals() {
		console.log("START SEMIS");
		this.starterFunction(...this.matches.semi1.players);
        this.starterFunction(...this.matches.semi2.players);
        this.status = 'semifinals';
    }

	startFinal() {
		this.matches.final.players = [this.matches.semi1.winner, this.matches.semi2.winner];
		this.starterFunction(...this.matches.final.players);
		this.status = 'final';
		this.done = true;
		console.log("FINAL IS BEING STARTED");
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
			status: this.void ? "void" : this.status,
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
