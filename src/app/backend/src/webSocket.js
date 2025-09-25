"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userIdSocket = exports.userIdUserId = void 0;
exports.webSocket = webSocket;
var game_ts_1 = require("./game.ts");
var game_ts_2 = require("./data access layer/game.ts");
var global_ts_1 = require("./global.ts");
var server_ts_1 = require("./server.ts");
var ChatRepository_ts_1 = require("./repositories/ChatRepository.ts");
var user_ts_1 = require("./data access layer/user.ts");
exports.userIdUserId = new Map();
exports.userIdSocket = new Map();
function webSocket() {
    var _this = this;
    var wsServerTournament = server_ts_1.ws.of("/tournament");
    var wsServerRemote = server_ts_1.ws.of("/remote");
    var wsServerInvite = server_ts_1.ws.of("/invite");
    var wsServerAI = server_ts_1.ws.of("/ai");
    wsServerTournament.use(function (socket, next) {
        var token = socket.handshake.auth.token;
        if (!token)
            return next(new Error('Authentication error: No token provided'));
        try {
            var payload = server_ts_1.server.jwt.verify(token);
            socket.userId = payload.Id;
            return next();
        }
        catch (_a) {
            return next(new Error('Authentication error: token invalid'));
        }
    });
    wsServerRemote.use(function (socket, next) {
        var token = socket.handshake.auth.token;
        if (!token)
            return next(new Error('Authentication error: No token provided'));
        try {
            var payload = server_ts_1.server.jwt.verify(token);
            socket.userId = payload.Id;
            return next();
        }
        catch (_a) {
            return next(new Error('Authentication error: token invalid'));
        }
    });
    wsServerInvite.use(function (socket, next) {
        var token = socket.handshake.auth.token;
        if (!token)
            return next(new Error('Authentication error: No token provided'));
        try {
            var payload = server_ts_1.server.jwt.verify(token);
            socket.userId = payload.Id;
            return next();
        }
        catch (_a) {
            return next(new Error('Authentication error: token invalid'));
        }
    });
    wsServerAI.use(function (socket, next) {
        var token = socket.handshake.auth.token;
        if (!token)
            return next(new Error('Authentication error: No token provided'));
        try {
            var payload = server_ts_1.server.jwt.verify(token);
            socket.userId = payload.Id;
            return next();
        }
        catch (_a) {
            return next(new Error('Authentication error: token invalid'));
        }
    });
    var aiGames = new Map();
    wsServerAI.on("connection", function (client) {
        var roomId = "room_".concat(Date.now(), "_").concat(Math.random().toString(36).slice(2, 7));
        client.roomId = roomId;
        client.join(roomId);
        client.on("join-game", function () {
            var game = new game_ts_1.Game(client, "AI", wsServerAI, roomId);
            aiGames.set(roomId, game);
            wsServerAI.to(roomId).emit("start-game", game.getFullState());
            wsServerAI.to(roomId).emit("score-state", game.scores);
            var lastTime = Date.now();
            var interval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                var now, delta, dbGame, user1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            now = Date.now();
                            delta = (now - lastTime) / 1000;
                            lastTime = now;
                            game.update(delta);
                            if (!game.running) return [3 /*break*/, 1];
                            wsServerAI.to(roomId).emit("game-state", game.getState());
                            return [3 /*break*/, 3];
                        case 1:
                            clearInterval(interval);
                            dbGame = new game_ts_2.clsGame({
                                Id: -1,
                                User1Id: client.userId,
                                User2Id: null,
                                Date: Date.now(),
                                WinnerId: game.winnerId,
                                TournamentId: -1
                            });
                            dbGame.add();
                            return [4 /*yield*/, user_ts_1.User.getById(client.userId)];
                        case 2:
                            user1 = _a.sent();
                            if (game.winnerId == user1.Id)
                                user1.Wins++;
                            else
                                user1.Losses++;
                            user1.update();
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            }); }, 16);
        });
        client.on("disconnect", function () {
            var roomId = client.roomId;
            if (!roomId)
                return;
            var game = aiGames.get(roomId);
            if (!game)
                return;
            game.running = false;
            aiGames.delete(roomId);
        });
        client.on("move", function (_a) {
            var key = _a.key, pressedState = _a.pressedState;
            var roomId = client.roomId;
            if (!roomId)
                return;
            var game = aiGames.get(roomId);
            if (!game)
                return;
            var keyStates = game.keyStates[client.userId];
            if (!keyStates)
                return;
            if (key == "ArrowUp" || key == "w")
                keyStates.up = pressedState;
            else if (key == "ArrowDown" || key == "s")
                keyStates.down = pressedState;
        });
    });
    var waitingRemotePlayers = [];
    var remoteGames = new Map();
    wsServerRemote.on("connection", function (client) {
        client.roomId = null;
        client.on("join-game", function (msg) {
            client.userId = msg.userId;
            if (waitingRemotePlayers.length > 0) {
                var opponent = waitingRemotePlayers.pop();
                if (opponent.userId === client.userId) {
                    waitingRemotePlayers.push(opponent);
                    return;
                }
                startRemoteGame(opponent, client);
            }
            else {
                waitingRemotePlayers.push(client);
            }
        });
        client.on("move", function (_a) {
            var key = _a.key, pressedState = _a.pressedState;
            var roomId = client.roomId;
            if (!roomId)
                return;
            var game = remoteGames.get(roomId);
            if (!game)
                return;
            console.log("HERE KEY STATES");
            var keyStates = game.keyStates[client.userId];
            if (!keyStates)
                return;
            if (key === "ArrowUp" || key === "w")
                keyStates.up = pressedState;
            if (key === "ArrowDown" || key === "s")
                keyStates.down = pressedState;
        });
        client.on("disconnect", function () { return handleRemoteDisconnect(client); });
        function handleRemoteDisconnect(leaver) {
            var leaverIndexInWaitingList = waitingRemotePlayers.indexOf(leaver);
            if (leaverIndexInWaitingList !== -1) {
                waitingRemotePlayers.splice(leaverIndexInWaitingList, 1);
                return;
            }
            var roomId = leaver.roomId;
            // if (!roomId)
            // 	return;
            var clientsInRoom = wsServerRemote.adapter.rooms.get(roomId);
            if (!clientsInRoom) {
                remoteGames.delete(roomId);
                return; // removed the game after all the players have left
            }
            var game = remoteGames.get(roomId);
            if (game)
                game.running = false;
            wsServerRemote.to(roomId).emit("opponent-left");
            remoteGames.delete(roomId);
            leaver.leave(roomId);
            leaver.roomId = null;
            var validSurvivors = __spreadArray([], clientsInRoom, true).filter(function (id) { return id !== leaver.id; })
                .map(function (id) { return wsServerRemote.sockets.get(id); })
                .filter(function (socket) { return socket === null || socket === void 0 ? void 0 : socket.connected; });
            validSurvivors.forEach(function (survivor) {
                if (!waitingRemotePlayers.includes(survivor)) {
                    waitingRemotePlayers.push(survivor);
                    survivor.roomId = null;
                }
            });
            while (waitingRemotePlayers.length >= 2) {
                var p1 = waitingRemotePlayers.pop();
                var p2 = waitingRemotePlayers.pop();
                startRemoteGame(p1, p2);
            }
        }
    });
    function startRemoteGame(p1, p2) {
        var _this = this;
        if (!p1.connected || !p2.connected) {
            if (p1.connected)
                waitingRemotePlayers.push(p1);
            if (p2.connected)
                waitingRemotePlayers.push(p2);
            return;
        }
        var roomId = "room_".concat(Date.now(), "_").concat(Math.random().toString(36).slice(2, 7));
        p1.join(roomId);
        p2.join(roomId);
        p1.roomId = roomId;
        p2.roomId = roomId;
        var game = new game_ts_1.Game(p1, p2, wsServerRemote, roomId);
        remoteGames.set(roomId, game);
        wsServerRemote.to(roomId).emit("start-game", game.getFullState());
        wsServerRemote.to(roomId).emit("score-state", game.scores);
        var lastTime = Date.now();
        var interval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var now, delta, dbGame, user1, user2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        now = Date.now();
                        delta = (now - lastTime) / 1000;
                        lastTime = now;
                        game.update(delta);
                        if (!game.running) return [3 /*break*/, 1];
                        wsServerRemote.to(roomId).emit("game-state", game.getState());
                        return [3 /*break*/, 4];
                    case 1:
                        clearInterval(interval);
                        dbGame = new game_ts_2.clsGame({
                            Id: -1,
                            User1Id: p1.userId,
                            User2Id: p2.userId,
                            Date: Date.now(),
                            WinnerId: game.winnerId,
                            TournamentId: -1
                        });
                        dbGame.add();
                        return [4 /*yield*/, user_ts_1.User.getById(p1.userId)];
                    case 2:
                        user1 = _a.sent();
                        return [4 /*yield*/, user_ts_1.User.getById(p2.userId)];
                    case 3:
                        user2 = _a.sent();
                        if (game.winnerId == user1.Id) {
                            user1.Wins++;
                            user2.Losses++;
                        }
                        else {
                            user1.Losses++;
                            user2.Wins++;
                        }
                        user1.update();
                        user2.update();
                        // end game ...
                        remoteGames.delete(roomId);
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        }); }, 16);
    }
    var tournaments = new Map();
    var tournament;
    var tournamentId;
    wsServerTournament.on("connection", function (client) {
        client.on("join-tournament", function (msg) {
            client.userId = msg.userId;
            if (!tournament) {
                tournament = new Tournament(startTournamentGame);
                tournament.addPlayer(client);
                tournamentId = "tournament_".concat(Date.now(), "_").concat(Math.random().toString(10).slice(2, 7));
                tournaments.set(tournamentId, tournament);
                client.tournamentId = tournamentId;
                client.join(tournamentId);
                console.log(global_ts_1.red, "FIRST USER: ".concat(client.userId));
            }
            else if (tournament.players.length <= 4) {
                var alreadyJoined = tournament.players.some(function (p) { return p.userId === client.userId; });
                if (alreadyJoined) {
                    client.emit("error", "You already joined the tournament.");
                    client.disconnect(true);
                    console.log(global_ts_1.red, "YOU AREADY JOINED ".concat(client.userId));
                    return;
                }
                client.tournamentId = tournamentId;
                client.join(tournamentId);
                tournament.addPlayer(client);
                if (tournament.players.length == 4) {
                    tournament.startSemifinals();
                    tournament = null;
                }
                console.log(global_ts_1.red, "added non first user: ".concat(client.userId));
            }
        });
        client.on("move", function (_a) {
            var key = _a.key, pressedState = _a.pressedState;
            var game = client.game;
            if (!game)
                return;
            var keyStates = game.keyStates[client.userId];
            if (!keyStates)
                return;
            if (key == "ArrowUp" || key == "w")
                keyStates.up = pressedState;
            else if (key == "ArrowDown" || key == "s")
                keyStates.down = pressedState;
        });
        client.on("disconnect", function () {
            var _a;
            var leaver = client;
            var currTournament = tournaments.get(leaver.tournamentId);
            if (!currTournament)
                return;
            if (leaver == currTournament.matches.semi1.loser
                || leaver == currTournament.matches.semi2.loser
                || leaver == ((_a = currTournament.matches.final) === null || _a === void 0 ? void 0 : _a.loser))
                return;
            tournament = null;
            for (var _i = 0, _b = currTournament.players; _i < _b.length; _i++) {
                var player = _b[_i];
                if (player !== leaver) {
                    console.log("SENT VOID");
                    // player.game.looping = false; // what if 3 have joined and one of them leaves would this be undefined?
                    player.emit("void");
                }
                else {
                    console.log("TRYING TO SPLICE?");
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
            var tour = tournaments.get(p1.tournamentId);
            tour.void = true;
            for (var _i = 0, _a = tour.players; _i < _a.length; _i++) {
                var dp = _a[_i];
                if (dp.connected) {
                    dp.emit("void");
                }
            }
            return;
        }
        var roomId = "room_".concat(Date.now(), "_").concat(Math.random().toString(36).slice(2, 7));
        p1.join(roomId);
        p2.join(roomId);
        p1.roomId = roomId;
        p2.roomId = roomId;
        var game = new game_ts_1.Game(p1, p2, wsServerTournament, roomId);
        p1.game = game;
        p2.game = game;
        wsServerTournament.to(roomId).emit("start-game", game.getFullState());
        wsServerTournament.to(roomId).emit("score-state", game.scores);
        var lastTime = Date.now();
        var interval = setInterval(function () {
            console.log("EVENT LOOP: TOURNAMENT");
            var now = Date.now();
            game.update((now - lastTime) / 1000);
            lastTime = now;
            if (game.running) {
                wsServerTournament.to(roomId).emit("game-state", game.getState());
            }
            else {
                clearInterval(interval);
                var tournamentId_1 = p1.tournamentId;
                var tournament_1 = tournaments.get(tournamentId_1);
                if (tournament_1 && !tournament_1.void) {
                    if (game.winnerId == p1.userId) {
                        tournament_1.onGameEnd(p1, p2);
                        console.log(global_ts_1.cyan, "P1 WON", p1.userId);
                    }
                    else if (game.winnerId == p2.userId) {
                        tournament_1.onGameEnd(p2, p1);
                        console.log(global_ts_1.cyan, "P2 WON", p2.userId);
                    }
                    if (tournament_1.matches.semi1.winner && tournament_1.matches.semi2.winner && !tournament_1.done) {
                        tournament_1.matches.semi1.loser.emit("phase", tournament_1.getState());
                        tournament_1.matches.semi2.loser.emit("phase", tournament_1.getState());
                        ChatRepository_ts_1.default.storeMessage(user_ts_1.TOURNAMENT_ID, tournament_1.matches.semi1.winner.userId, "Finale starts soon...", "MSG");
                        ChatRepository_ts_1.default.storeMessage(user_ts_1.TOURNAMENT_ID, tournament_1.matches.semi2.winner.userId, "Finale starts soon...", "MSG");
                        var count_1 = 0;
                        var counter_1 = setInterval(function () {
                            if (count_1 === 5) {
                                clearInterval(counter_1);
                                tournament_1.startFinal();
                                console.log("STARTED FINAL");
                            }
                            var data = {
                                one: tournament_1.matches.semi1.winner.userId,
                                two: tournament_1.matches.semi1.winner.userId,
                                count: 5 - count_1
                            };
                            tournament_1.matches.semi1.winner.emit("next-game", data);
                            tournament_1.matches.semi2.winner.emit("next-game", data);
                            console.log(count_1);
                            count_1++;
                        }, 1000);
                    }
                    else if (tournament_1.done) {
                        for (var _i = 0, _a = tournament_1.players; _i < _a.length; _i++) {
                            var player = _a[_i];
                            player.emit("phase", tournament_1.getState());
                        }
                        console.log("WE ARE DONE");
                        console.log("winner of the final: ".concat(tournament_1.matches.final.winner));
                    }
                }
            }
        }, 16);
    }
    var inviteGames = new Map();
    wsServerInvite.on("connection", function (client) {
        console.log("CONNECTED TO ME ".concat(client.userId));
        var opponentId = exports.userIdUserId.get(client.userId);
        var opponentClient = exports.userIdSocket.get(opponentId);
        if (opponentClient) {
            startInviteGame(opponentClient, client);
            console.log("GAME START");
        }
        else {
            exports.userIdSocket.set(client.userId, client);
            console.log("OTHER STILL HASN'T JOINED");
        }
        client.on("move", function (_a) {
            var key = _a.key, pressedState = _a.pressedState;
            var roomId = client.roomId;
            if (!roomId)
                return;
            var game = inviteGames.get(roomId);
            if (!game)
                return;
            console.log("HERE KEY STATES");
            var keyStates = game.keyStates[client.userId];
            if (!keyStates)
                return;
            if (key === "ArrowUp" || key === "w")
                keyStates.up = pressedState;
            if (key === "ArrowDown" || key === "s")
                keyStates.down = pressedState;
        });
        client.on("disconnect", function () {
            var leaver = client;
            var roomId = leaver.roomId;
            var game = inviteGames.get(roomId);
            if (game)
                game.running = false;
            wsServerInvite.to(roomId).emit("opponent-left");
            inviteGames.delete(roomId);
            exports.userIdSocket.delete(leaver.userId);
            exports.userIdUserId.delete(leaver.userId);
            exports.userIdUserId.delete(leaver.userId);
        });
    });
    function startInviteGame(p1, p2) {
        var _this = this;
        if (!p1.connected || !p2.connected) {
            exports.userIdSocket.delete(p1.userId);
            exports.userIdSocket.delete(p2.userId);
            exports.userIdUserId.delete(p1.userId);
            exports.userIdUserId.delete(p2.userId);
            return;
        }
        var roomId = "room_".concat(Date.now(), "_").concat(Math.random().toString(36).slice(2, 7));
        p1.join(roomId);
        p2.join(roomId);
        p1.roomId = roomId;
        p2.roomId = roomId;
        var game = new game_ts_1.Game(p1, p2, wsServerInvite, roomId);
        inviteGames.set(roomId, game);
        wsServerInvite.to(roomId).emit("start-game", game.getFullState());
        wsServerInvite.to(roomId).emit("score-state", game.scores);
        var lastTime = Date.now();
        var interval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var now, delta, dbGame, user1, user2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        now = Date.now();
                        delta = (now - lastTime) / 1000;
                        lastTime = now;
                        game.update(delta);
                        if (!game.running) return [3 /*break*/, 1];
                        wsServerInvite.to(roomId).emit("game-state", game.getState());
                        return [3 /*break*/, 4];
                    case 1:
                        inviteGames.delete(roomId);
                        clearInterval(interval);
                        dbGame = new game_ts_2.clsGame({
                            Id: -1,
                            User1Id: p1.userId,
                            User2Id: p2.userId,
                            Date: Date.now(),
                            WinnerId: game.winnerId,
                            TournamentId: -1
                        });
                        dbGame.add();
                        return [4 /*yield*/, user_ts_1.User.getById(p1.userId)];
                    case 2:
                        user1 = _a.sent();
                        return [4 /*yield*/, user_ts_1.User.getById(p2.userId)];
                    case 3:
                        user2 = _a.sent();
                        if (game.winnerId == user1.Id) {
                            user1.Wins++;
                            user2.Losses++;
                        }
                        else {
                            user1.Losses++;
                            user2.Wins++;
                        }
                        user1.update();
                        user2.update();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        }); }, 16);
    }
}
var Tournament = /** @class */ (function () {
    function Tournament(starter) {
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
    Tournament.prototype.addPlayer = function (client) {
        this.players.push(client);
        if (this.players.length === 4) {
            this.setupMatches();
        }
    };
    Tournament.prototype.setupMatches = function () {
        // const shuffled = [...this.players].sort(() => Math.random() - 0.5);
        // this.matches.semi1.players = [shuffled[0], shuffled[1]];
        // this.matches.semi2.players = [shuffled[2], shuffled[3]];
        this.matches.semi1.players = [this.players[0], this.players[1]];
        this.matches.semi2.players = [this.players[2], this.players[3]];
        this.status = 'ready';
        console.log("SETUP MATCHES");
    };
    Tournament.prototype.startSemifinals = function () {
        console.log("START SEMIS");
        this.starterFunction.apply(this, this.matches.semi1.players);
        this.starterFunction.apply(this, this.matches.semi2.players);
        this.status = 'semifinals';
    };
    Tournament.prototype.startFinal = function () {
        this.matches.final.players = [this.matches.semi1.winner, this.matches.semi2.winner];
        this.starterFunction.apply(this, this.matches.final.players);
        this.status = 'final';
        this.done = true;
        console.log("FINAL IS BEING STARTED");
    };
    Tournament.prototype.onGameEnd = function (winner, loser) {
        if (this.matches.final.players.includes(winner)) {
            this.matches.final.winner = winner;
            this.matches.final.loser = loser;
            this.status = "finished";
            return;
        }
        else if (this.matches.semi1.players.includes(winner)) {
            this.matches.semi1.winner = winner;
            this.matches.semi1.loser = loser;
        }
        else if (this.matches.semi2.players.includes(winner)) {
            this.matches.semi2.winner = winner;
            this.matches.semi2.loser = loser;
        }
    };
    Tournament.prototype.getState = function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        return {
            status: this.void ? "void" : this.status,
            semi1: {
                one: (_a = this.matches.semi1.players[0]) === null || _a === void 0 ? void 0 : _a.userId,
                two: (_b = this.matches.semi1.players[1]) === null || _b === void 0 ? void 0 : _b.userId,
                winner: (_c = this.matches.semi1.winner) === null || _c === void 0 ? void 0 : _c.userId
            },
            semi2: {
                one: (_d = this.matches.semi2.players[0]) === null || _d === void 0 ? void 0 : _d.userId,
                two: (_e = this.matches.semi2.players[1]) === null || _e === void 0 ? void 0 : _e.userId,
                winner: (_f = this.matches.semi2.winner) === null || _f === void 0 ? void 0 : _f.userId
            },
            final: {
                one: (_g = this.matches.final.players[0]) === null || _g === void 0 ? void 0 : _g.userId,
                two: (_h = this.matches.final.players[1]) === null || _h === void 0 ? void 0 : _h.userId,
                winner: (_j = this.matches.final.winner) === null || _j === void 0 ? void 0 : _j.userId
            }
        };
    };
    return Tournament;
}());
