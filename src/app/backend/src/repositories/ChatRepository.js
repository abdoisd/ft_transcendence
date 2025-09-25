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
var ChatDao_ts_1 = require("../data access layer/daos/ChatDao.ts");
var chat_ts_1 = require("../chat.ts");
var ChatRepository = /** @class */ (function () {
    function ChatRepository() {
    }
    var _a;
    _a = ChatRepository;
    ChatRepository.storeMessage = function (me, receiverId, message, type) { return __awaiter(void 0, void 0, void 0, function () {
        var id, result, _b, _c, _d;
        return __generator(_a, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, ChatDao_ts_1.default.storeMessage(me, receiverId, message, type)];
                case 1:
                    id = _e.sent();
                    if (!id)
                        return [2 /*return*/, null];
                    _b = this.messageMapper;
                    return [4 /*yield*/, ChatDao_ts_1.default.getMessage(id)];
                case 2:
                    result = _b.apply(this, [_e.sent(), me]);
                    _c = chat_ts_1.emitMessage;
                    _d = [receiverId];
                    return [4 /*yield*/, this.getMessage(result.id, receiverId)];
                case 3:
                    _c.apply(void 0, _d.concat([_e.sent()]));
                    return [2 /*return*/, result];
            }
        });
    }); };
    ChatRepository.getMessage = function (id, userId) { return __awaiter(void 0, void 0, void 0, function () {
        var msg;
        return __generator(_a, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, ChatDao_ts_1.default.getMessage(id)];
                case 1:
                    msg = _b.sent();
                    return [2 /*return*/, this.messageMapper(msg, userId)];
            }
        });
    }); };
    ChatRepository.getConversation = function (first, second) { return __awaiter(void 0, void 0, void 0, function () {
        var conversations;
        var _this = _a;
        return __generator(_a, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, ChatDao_ts_1.default.getConversation(first, second)];
                case 1:
                    conversations = _b.sent();
                    return [2 /*return*/, conversations.map(function (e) {
                            return _this.messageMapper(e, first);
                        })];
            }
        });
    }); };
    ChatRepository.getConversations = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
        var conversations;
        var _this = _a;
        return __generator(_a, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, ChatDao_ts_1.default.getConversations(userId)];
                case 1:
                    conversations = _b.sent();
                    return [2 /*return*/, conversations.map(function (e) {
                            return _this.messageMapper(e, userId);
                        })];
            }
        });
    }); };
    ChatRepository.acceptInviteChecker = function (msgId, meId) { return __awaiter(void 0, void 0, void 0, function () {
        var msg, result, _b;
        return __generator(_a, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, ChatDao_ts_1.default.getMessage(msgId)];
                case 1:
                    msg = _c.sent();
                    if (!msg)
                        throw new Error("NO_MSG_FOUND");
                    _b = this.messageMapper;
                    return [4 /*yield*/, ChatDao_ts_1.default.getMessage(msgId)];
                case 2:
                    result = _b.apply(this, [_c.sent(), meId]);
                    if (result.receiver.id != meId)
                        throw new Error("FORBIDDEN");
                    if (result.type != "INVITE")
                        throw new Error("NOT VALID");
                    return [2 /*return*/, result];
            }
        });
    }); };
    ChatRepository.messageMapper = function (message, me) {
        if (!message)
            return null;
        var meSender = message.sender.id === me;
        return {
            id: message.id,
            type: message.type,
            message: message.message,
            sender_is_me: meSender,
            sender_id: message.sender.id,
            created_at: message.createdAt,
            sender: message.sender,
            receiver: message.receiver
        };
    };
    return ChatRepository;
}());
exports.default = ChatRepository;
