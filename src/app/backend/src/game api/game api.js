"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameRoutes = gameRoutes;
var global_ts_1 = require("../global.ts");
var server_ts_1 = require("../server.ts");
var game_ts_1 = require("../game.ts");
var apiGames = new Map();
function gameRoutes() {
    server_ts_1.server.get("/api-game/init", { preHandler: server_ts_1.server.mustHaveToken }, function (request, reply) {
        var activeGames = 0;
        for (var _i = 0, apiGames_1 = apiGames; _i < apiGames_1.length; _i++) {
            var _a = apiGames_1[_i], key = _a[0], value = _a[1];
            if (value.apiState === "started") {
                activeGames++;
            }
            else if (value.apiState === "ended") {
                apiGames.delete(key);
            }
        }
        console.log("number of active Games: ".concat(activeGames));
        if (activeGames > 3) {
            console.log("we got ".concat(apiGames.size, " games"));
            console.log("Too many active api games");
            reply.status(403).send({ error: "Too many active games" });
            return;
        }
        var game = new game_ts_1.Game("player1api", "player2api", null, null);
        game.apiState = "inited";
        var gameId = (0, global_ts_1.guid)();
        apiGames.set(gameId, game);
        reply.send({
            gameId: gameId,
            message: "Game initialized"
        });
    });
    server_ts_1.server.get("/api-game/start/:id", { preHandler: server_ts_1.server.mustHaveToken }, function (request, reply) {
        var game = apiGames.get(request.params.id);
        if (!game) {
            reply.code(404).send({ error: "Game not found" });
            return;
        }
        game.startApiGame();
        game.apiState = "started";
        reply.send({
            gameId: request.params.id,
            message: "Game started",
            gameState: game.getStateApi()
        });
    });
    server_ts_1.server.get("/api-game/state/:id", { preHandler: server_ts_1.server.mustHaveToken }, function (request, reply) {
        var game = apiGames.get(request.params.id);
        if (!game) {
            reply.code(404).send({ error: "Game not found" });
            return;
        }
        reply.send({
            gameId: request.params.id,
            message: "Game state",
            gameState: game.getStateApi()
        });
    });
    server_ts_1.server.post("/api-game/:id/:player/:move", { preHandler: server_ts_1.server.mustHaveToken }, function (request, reply) {
        var game = apiGames.get(request.params.id);
        if (!game) {
            reply.code(404).send({ error: "Game not found" });
            return;
        }
        var _a = request.params, player = _a.player, move = _a.move;
        if ((player != "player1api" && player != "player2api") || (move != "none" && move != "down" && move != "up")) {
            reply.send({ success: false });
            return;
        }
        game.moveApiGame(player, move);
        reply.send({ success: true });
    });
}
