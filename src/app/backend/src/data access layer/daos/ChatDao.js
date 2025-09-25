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
var database_ts_1 = require("../database.ts");
var ChatDao = /** @class */ (function () {
    function ChatDao() {
    }
    var _a;
    _a = ChatDao;
    ChatDao.storeMessage = function (senderId, receiverId, message, type) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(_a, function (_b) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var sql = "INSERT INTO messages (sender_id, receiver_id, content, content_type)\n                    VALUES (?, ?, ?, ?)";
                    return database_ts_1.db.run(sql, [senderId, receiverId, message, type], function (err) {
                        if (err)
                            return reject(err.message);
                        return resolve(this.lastID);
                    });
                })];
        });
    }); };
    ChatDao.getConversation = function (first, second) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(_a, function (_b) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var sql = "\n            SELECT \n            messages.*,\n            sender.Id AS sender_id,\n            sender.AvatarPath AS sender_avatar,\n            sender.Username AS sender_username,\n            receiver.Id AS receiver_id,\n            receiver.AvatarPath AS receiver_avatar,\n            receiver.Username AS receiver_username\n            FROM messages\n            JOIN Users AS sender ON messages.sender_id = sender.Id\n            JOIN Users AS receiver ON messages.receiver_id = receiver.Id\n            WHERE (messages.sender_id = ? AND messages.receiver_id = ?) \n            OR (messages.sender_id = ? AND messages.receiver_id = ?)\n            ORDER BY created_at DESC\n        ";
                    return database_ts_1.db.all(sql, [first, second, second, first], function (err, res) {
                        if (err)
                            return reject(err.message);
                        return resolve(res.map(function (row) { return ({
                            id: row.id,
                            message: row.content,
                            type: row.content_type,
                            createdAt: row.created_at,
                            sender: {
                                id: row.sender_id,
                                username: row.sender_username,
                                avatar: row.sender_avatar
                            },
                            receiver: {
                                id: row.receiver_id,
                                username: row.receiver_username,
                                avatar: row.receiver_avatar
                            }
                        }); }));
                    });
                })];
        });
    }); };
    ChatDao.getConversations = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(_a, function (_b) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var sql = "\n            SELECT \n            messages.*,\n            sender.Id AS sender_id,\n            sender.AvatarPath AS sender_avatar,\n            sender.Username AS sender_username,\n            receiver.Id AS receiver_id,\n            receiver.AvatarPath AS receiver_avatar,\n            receiver.Username AS receiver_username\n            FROM messages\n            JOIN Users AS sender ON messages.sender_id = sender.Id\n            JOIN Users AS receiver ON messages.receiver_id = receiver.Id\n            WHERE (messages.sender_id = ? OR messages.receiver_id = ?)\n            AND messages.created_at = (\n                SELECT MAX(created_at)\n                FROM messages m2\n                WHERE \n                  (m2.sender_id = messages.sender_id AND m2.receiver_id = messages.receiver_id)\n                  OR (m2.sender_id = messages.receiver_id AND m2.receiver_id = messages.sender_id)\n              )\n            GROUP BY messages.sender_id, messages.receiver_id\n            ORDER BY created_at DESC\n        ";
                    return database_ts_1.db.all(sql, [userId, userId], function (err, res) {
                        if (err)
                            return reject(err.message);
                        return resolve(res.map(function (row) { return ({
                            id: row.id,
                            message: row.content,
                            createdAt: row.created_at,
                            type: row.content_type,
                            sender: {
                                id: row.sender_id,
                                username: row.sender_username,
                                avatar: row.sender_avatar
                            },
                            receiver: {
                                id: row.receiver_id,
                                username: row.receiver_username,
                                avatar: row.receiver_avatar
                            }
                        }); }));
                    });
                })];
        });
    }); };
    ChatDao.getMessage = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(_a, function (_b) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var sql = "\n            SELECT \n            messages.*,\n            sender.Id AS sender_id,\n            sender.AvatarPath AS sender_avatar,\n            sender.Username AS sender_username,\n            receiver.Id AS receiver_id,\n            receiver.AvatarPath AS receiver_avatar,\n            receiver.Username AS receiver_username\n            FROM messages\n            JOIN Users AS sender ON messages.sender_id = sender.Id\n            JOIN Users AS receiver ON messages.receiver_id = receiver.Id\n            WHERE messages.id = ? \n            LIMIT 1;\n        ";
                    return database_ts_1.db.get(sql, [id], function (err, row) {
                        if (err)
                            return reject(err.message);
                        if (!row)
                            return resolve(null);
                        return resolve({
                            id: row.id,
                            message: row.content,
                            createdAt: row.created_at,
                            type: row.content_type,
                            sender: {
                                id: row.sender_id,
                                username: row.sender_username,
                                avatar: row.sender_avatar
                            },
                            receiver: {
                                id: row.receiver_id,
                                username: row.receiver_username,
                                avatar: row.receiver_avatar
                            }
                        });
                    });
                })];
        });
    }); };
    return ChatDao;
}());
exports.default = ChatDao;
