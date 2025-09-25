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
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectedToSqlite = exports.ws = exports.server = void 0;
exports.vaultGoogleClientSecret = vaultGoogleClientSecret;
// fastify
var fastify_1 = require("fastify");
var static_1 = require("@fastify/static");
var multipart_1 = require("@fastify/multipart");
var cookie_1 = require("@fastify/cookie");
var jwt_1 = require("@fastify/jwt");
var socket_io_1 = require("socket.io");
// dotenv
var dotenv_1 = require("dotenv");
dotenv_1.default.config({ path: './env/.env' });
dotenv_1.default.config({ path: './.env' });
console.log(global_ts_2.yellow, process.env.VAULT_TOKEN);
console.log(global_ts_2.yellow, process.env.JWT_SECRET);
// config
var global_ts_1 = require("./global.ts");
// modules
var path_1 = require("path");
// globals
var global_ts_2 = require("./global.ts");
// routes
var user_ts_1 = require("./data access layer/user.ts");
var oauth2_ts_1 = require("./oauth2.ts");
var relationship_ts_1 = require("./data access layer/relationship.ts");
var _2fa_ts_1 = require("./2fa.ts");
exports.server = (0, fastify_1.default)({ bodyLimit: 3048576 }); // 1mb
exports.ws = new socket_io_1.Server(exports.server.server, {
    cors: {
        origin: "https://localhost",
    },
});
// REGISTER PLUGINS
exports.server.register(cookie_1.default, {});
exports.server.register(multipart_1.default);
exports.server.register(static_1.default, {
    root: path_1.default.join(process.cwd(), "./public"),
});
exports.server.setNotFoundHandler(function (request, reply) {
    if (request.url.split("/").length > 2)
        return reply.status(404).send();
    reply.sendFile("index.html");
});
exports.server.register(jwt_1.default, {
    secret: process.env.JWT_SECRET || 'defaultSecret'
});
// game / socket.io
var webSocket_ts_1 = require("./webSocket.ts");
(0, webSocket_ts_1.webSocket)();
(0, chat_ts_1.chatWs)();
// prometheus
var prom_client_1 = require("prom-client");
var register = new prom_client_1.default.Registry(); // Create a Registry which registers the metrics
prom_client_1.default.collectDefaultMetrics({ register: register }); // Add default metrics to the registry
var requestCounter = new prom_client_1.default.Counter({
    name: 'server_requests_total',
    help: 'Total number of server requests',
    labelNames: ['request_method', 'requested_file', 'response_status']
});
register.registerMetric(requestCounter);
exports.server.addHook('onResponse', function (request, reply, done) {
    requestCounter.inc({
        request_method: request.method,
        requested_file: request.url,
        response_status: reply.statusCode
    });
    done();
});
exports.server.get('/metrics', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _b = (_a = reply
                    .header('Content-Type', register.contentType))
                    .send;
                return [4 /*yield*/, register.metrics()];
            case 1:
                _b.apply(_a, [_c.sent()]);
                return [2 /*return*/];
        }
    });
}); });
// sqlite metrics
exports.connectedToSqlite = new prom_client_1.default.Gauge({
    name: 'connected_to_sqlite',
    help: 'Whether process connected to sqlite db (1 = true, 0 = false)',
});
register.registerMetric(exports.connectedToSqlite);
exports.connectedToSqlite.set(0);
// post to logstash
// import { logstash } from "./logstash.ts";
// logstash();
// vault
var node_vault_1 = require("node-vault");
var vault = (0, node_vault_1.default)({
    apiVersion: 'v1',
    endpoint: 'https://vault-server:8200',
    token: process.env.VAULT_TOKEN || '', //*
    requestOptions: {
        strictSSL: false
    }
});
function vaultGoogleClientSecret() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, vault.read('secret/data/node-app')
                    .then(function (result) {
                    return result.data.data.CLIENT_SECRET;
                })];
        });
    });
}
// ==================================================================================================
// request and it's response
exports.server.addHook('onSend', function (request, reply, payload) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        console.info(global_ts_2.magenta, "Request to server: " + request.method + " " + request.url);
        console.info(global_ts_2.magenta, "Server response: " + reply.statusCode);
        return [2 /*return*/];
    });
}); });
// // for timing things
// server.addHook('onRequest', async (request) => {
// 	console.info(magenta, "Request to server: " + request.method + " " + request.url);
// });
// server.addHook('onResponse', async (request, reply) => {
// 	console.info(magenta, "Server response: " + reply.statusCode);
// });
var game_api_ts_1 = require("./game api/game api.ts");
var chat_ts_1 = require("./chat.ts");
var api_routes_ts_1 = require("./api/api_routes.ts");
var start = function () { return __awaiter(void 0, void 0, void 0, function () {
    var host, port, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                console.log("Starting server...");
                // register routes
                (0, user_ts_1.UserRoutes)();
                (0, oauth2_ts_1.OAuth2Routes)();
                exports.server.register(relationship_ts_1.relationshipRoutes);
                exports.server.register(_2fa_ts_1.Enable2faRoutes);
                (0, game_api_ts_1.gameRoutes)();
                (0, api_routes_ts_1.default)();
                exports.server.ready(function (err) {
                    if (err)
                        throw err;
                    console.log(exports.server.printRoutes());
                });
                host = global_ts_1.config.HOST || 'localhost';
                port = global_ts_1.config.PORT ? Number(global_ts_1.config.PORT) : 3000;
                return [4 /*yield*/, exports.server.listen({ port: port, host: host })];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                err_1 = _a.sent();
                exports.server.log.error(err_1);
                process.exit(1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
start();
