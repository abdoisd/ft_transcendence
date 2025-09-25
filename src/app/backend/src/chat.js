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
exports.emitMessageWithType = exports.emitMessage = exports.chatWs = void 0;
var server_ts_1 = require("./server.ts");
var webSocket_ts_1 = require("./webSocket.ts");
var ChatRepository_ts_1 = require("./repositories/ChatRepository.ts");
var users = {};
var chatWs = function () {
    var io = server_ts_1.ws.of("/chat");
    io.use(function (socket, next) {
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
    io.on("connection", function (socket) {
        console.log("".concat(socket.userId, " connected"));
        users[socket.userId] = socket.id;
        socket.on('disconnect', function () {
            console.log("".concat(socket.userId, " disconnect"));
            delete users[socket.userId];
        });
        socket.on('check-invite', function (msgId) { return __awaiter(void 0, void 0, void 0, function () {
            var result, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, ChatRepository_ts_1.default.acceptInviteChecker(msgId, socket.userId)];
                    case 1:
                        result = _a.sent();
                        (0, exports.emitMessageWithType)(result.sender_id, "check-game", "");
                        webSocket_ts_1.userIdUserId.set(socket.userId, result.sender_id);
                        webSocket_ts_1.userIdUserId.set(result.sender_id, socket.userId);
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _a.sent();
                        console.log(err_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        socket.on("ready", function (status) {
            if (status) {
                (0, exports.emitMessageWithType)(socket.userId, "start", "");
                (0, exports.emitMessageWithType)(webSocket_ts_1.userIdUserId.get(socket.userId), "start", "");
            }
            else {
                webSocket_ts_1.userIdUserId.delete(webSocket_ts_1.userIdUserId.get(socket.userId));
                webSocket_ts_1.userIdUserId.delete(socket.userId);
            }
        });
    });
};
exports.chatWs = chatWs;
var emitMessage = function (userId, msg) {
    var io = server_ts_1.ws.of("/chat");
    if (!users[userId])
        return;
    io.to(users[userId]).emit("msg", msg);
};
exports.emitMessage = emitMessage;
var emitMessageWithType = function (userId, msgType, msg) {
    var io = server_ts_1.ws.of("/chat");
    if (!users[userId])
        return false;
    io.to(users[userId]).emit(msgType, msg);
    return true;
};
exports.emitMessageWithType = emitMessageWithType;
