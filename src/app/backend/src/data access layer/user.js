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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.TOURNAMENT_AVATAR = exports.TOURNAMENT_NAME = exports.TOURNAMENT_ID = void 0;
exports.UserRoutes = UserRoutes;
var database_ts_1 = require("./database.ts");
var global_ts_1 = require("../global.ts");
var path_1 = require("path");
var fs_1 = require("fs");
var server_ts_1 = require("../server.ts"); // import variable
var global_ts_2 = require("../global.ts");
var game_ts_1 = require("./game.ts");
var promises_1 = require("stream/promises");
var chat_ts_1 = require("./chat.ts");
exports.TOURNAMENT_ID = 100;
exports.TOURNAMENT_NAME = "Tournament";
exports.TOURNAMENT_AVATAR = "tournament-avatar.png";
database_ts_1.db.run("\n\tCREATE TABLE IF NOT EXISTS Users (\n\t\tId INTEGER PRIMARY KEY AUTOINCREMENT,\n\t\tGoogleId TEXT NOT NULL,\n\t\tUsername TEXT NULL DEFAULT NULL,\n\t\tAvatarPath TEXT NULL DEFAULT NULL,\n\t\tWins INTEGER NOT NULL DEFAULT 0,\n\t\tLosses INTEGER NOT NULL DEFAULT 0,\n\t\tSessionId TEXT NULL DEFAULT NULL,\n\t\tExpirationDate TEXT NULL DEFAULT NULL,\n\t\tLastActivity TEXT NULL DEFAULT NULL,\n\t\tTOTPSecretPending TEXT NULL DEFAULT NULL,\n\t\tTOTPSecret TEXT NULL DEFAULT NULL\n\t);\n", function (err) {
    if (err)
        console.error(global_ts_1.red, 'Error creating table Users', err);
    else {
        insertefaultUsers();
        (0, chat_ts_1.createTables)();
        console.log(global_ts_1.green, 'Table Users ready');
    }
});
var insertefaultUsers = function () {
    database_ts_1.db.run("\n\t\tINSERT OR IGNORE INTO Users (Id, GoogleId, Username, AvatarPath) VALUES (?, ?, ?, ?);\n\t", [exports.TOURNAMENT_ID, "dummy", exports.TOURNAMENT_NAME, exports.TOURNAMENT_AVATAR], function (err) {
        if (err)
            console.error(global_ts_1.red, 'Error creating defaults users', err);
    });
};
var User = /** @class */ (function () {
    function User(id, googleOpenID, username, avatarPath, wins, losses, sessionId, expirationDate, lastActivity, TOTPSecretPending, TOTPSecret) {
        if (sessionId === void 0) { sessionId = null; }
        if (expirationDate === void 0) { expirationDate = null; }
        this.Id = id;
        this.GoogleId = googleOpenID;
        this.Username = username;
        this.AvatarPath = avatarPath;
        this.Wins = wins;
        this.Losses = losses;
        this.SessionId = sessionId;
        this.ExpirationDate = expirationDate;
        this.LastActivity = lastActivity;
        this.TOTPSecretPending = TOTPSecretPending;
        this.TOTPSecret = TOTPSecret;
    }
    User.getById = function (Id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        database_ts_1.db.get('SELECT * FROM Users WHERE Id = ?', [Id], function (err, row) {
                            if (err) {
                                console.log(global_ts_1.red, 'Error: User.getById: ', err);
                                reject(null);
                            }
                            else
                                resolve(row ? new User(row.Id, row.GoogleId, row.Username, row.AvatarPath, row.Wins, row.Losses, row.SessionId, row.ExpirationDate, row.LastActivity, row.TOTPSecretPending, row.TOTPSecret) : null);
                        });
                    })];
            });
        });
    };
    // get by username
    User.getByUsername = function (username) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log(global_ts_1.green, 'User.getByUsername');
                console.debug(global_ts_1.yellow, 'Username: ', username);
                // promise with background task
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        database_ts_1.db.get('SELECT * FROM Users WHERE Username = ?', [username], function (err, row) {
                            if (err) {
                                console.log(global_ts_1.red, 'Error: User.getByUsername: ', err);
                                reject(null);
                            }
                            else //*
                                resolve(row ? new User(row.Id, row.GoogleId, row.Username, row.AvatarPath, row.Wins, row.Losses, row.SessionId, row.ExpirationDate, row.LastActivity) : null);
                        });
                    })];
            });
        });
    };
    User.prototype.add = function () {
        var _this = this;
        console.log(global_ts_1.green, "User.add");
        console.debug(global_ts_1.yellow, 'Adding: ', this);
        return new Promise(function (resolve, reject) {
            database_ts_1.db.run("INSERT INTO Users (GoogleId, Username, AvatarPath, SessionId, ExpirationDate, LastActivity) VALUES (?, ?, ?, ?, ?, ?);", [_this.GoogleId, _this.Username, _this.AvatarPath, _this.SessionId, _this.ExpirationDate, new Date()], function (err) {
                if (err) {
                    console.log(global_ts_1.red, 'Error: User.add: ', err);
                    reject(null);
                }
                else
                    resolve(this.lastID);
            });
        });
    };
    //!
    User.prototype.update = function () {
        var _this = this;
        console.log(global_ts_1.green, 'User.update');
        console.debug(global_ts_1.yellow, 'Updating: ', this);
        return new Promise(function (resolve, reject) {
            database_ts_1.db.run("UPDATE Users SET GoogleId = ?, Username = ?, AvatarPath = ?, Wins = ?, Losses = ?, SessionId = ?, ExpirationDate = ?, LastActivity = ?, TOTPSecretPending = ?, TOTPSecret = ? WHERE Id = ?", [_this.GoogleId, _this.Username, _this.AvatarPath, _this.Wins, _this.Losses, _this.SessionId, _this.ExpirationDate, new Date(), _this.TOTPSecretPending, _this.TOTPSecret, _this.Id], function (err) {
                if (err) {
                    console.log(global_ts_1.red, 'Error: User.update: ', err);
                    reject(false);
                }
                else
                    resolve(this.changes > 0);
            });
        });
    };
    // can be static and normal
    // like a view
    User.getFriends = function (Id) {
        return new Promise(function (resolve, reject) {
            database_ts_1.db.all('SELECT u.Id, u.Username, u.Wins, u.Losses, u.LastActivity FROM Users u JOIN Relationships r ON (u.Id = r.User1Id AND r.User2Id = ?) OR (u.Id = r.User2Id AND r.User1Id = ?) WHERE r.Relationship = 1', [Id, Id], function (err, rows) {
                if (err) {
                    console.log(global_ts_1.red, 'Error: User.getById: ', err);
                    reject(null); // to test those
                }
                else
                    resolve(rows);
            });
        });
    };
    User.prototype.enabled2FA = function () {
        // has TOTPSecret in db
        return this.TOTPSecret != null && this.TOTPSecret != '';
    };
    return User;
}());
exports.User = User;
// to send user info to client
// get all
// get by ...
var UserDTO = /** @class */ (function () {
    function UserDTO(fullUser) {
        if (fullUser) {
            this.Id = fullUser.Id;
            this.Username = fullUser.Username;
            this.Wins = fullUser.Wins;
            this.Losses = fullUser.Losses;
        }
    }
    // get by username
    UserDTO.getByUsername = function (username) {
        return __awaiter(this, void 0, void 0, function () {
            var fullUser, userDTO;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log(global_ts_1.green, 'UserDTO.getByUsername');
                        console.debug(global_ts_1.yellow, 'Username: ', username);
                        return [4 /*yield*/, User.getByUsername(username)];
                    case 1:
                        fullUser = _a.sent();
                        if (!fullUser)
                            return [2 /*return*/, null];
                        userDTO = new UserDTO(fullUser);
                        return [2 /*return*/, userDTO];
                }
            });
        });
    };
    UserDTO.getById = function (Id) {
        return __awaiter(this, void 0, void 0, function () {
            var fullUser, userDTO;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, User.getById(Id)];
                    case 1:
                        fullUser = _a.sent();
                        if (!fullUser)
                            return [2 /*return*/, null];
                        userDTO = new UserDTO(fullUser);
                        return [2 /*return*/, userDTO];
                }
            });
        });
    };
    //!
    UserDTO.prototype.update = function () {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, User.getById(this.Id)];
                    case 1:
                        user = _a.sent();
                        user.Username = this.Username;
                        user.update();
                        return [2 /*return*/];
                }
            });
        });
    };
    return UserDTO;
}());
function UserRoutes() {
    var _this = this;
    server_ts_1.server.decorate('mustHaveToken', function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
        var payload, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, request.jwtVerify()];
                case 1:
                    _a.sent();
                    payload = request.user;
                    if (payload.IsRoot) {
                        console.log(global_ts_1.yellow, 'Admin access granted');
                        return [2 /*return*/];
                    }
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    return [2 /*return*/, reply.status(401).send({ error: err_1 })]; // Unauthorized
                case 3: return [2 /*return*/];
            }
        });
    }); });
    server_ts_1.server.decorate('byItsOwnUser', function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
        var payload, user, Id, GoogleId, user, relationship, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    return [4 /*yield*/, request.jwtVerify()];
                case 1:
                    _a.sent();
                    payload = request.user;
                    if (payload.IsRoot) {
                        console.log(global_ts_1.yellow, 'Admin access granted');
                        return [2 /*return*/];
                    }
                    if (!(request.method == "PUT")) return [3 /*break*/, 2];
                    user = request.body;
                    // for /updateProfile/3 and update user
                    if ((request.params.id || user.Id) != payload.Id)
                        return [2 /*return*/, reply.status(403).send()]; // Forbidden
                    return [3 /*break*/, 7];
                case 2:
                    if (!(request.method == "DELETE" || request.method == "GET")) return [3 /*break*/, 6];
                    Id = request.query.Id || request.params.id;
                    if (!!Id) return [3 /*break*/, 4];
                    GoogleId = request.query.GoogleId;
                    if (!GoogleId)
                        return [2 /*return*/, reply.status(400).send()]; // Bad request
                    return [4 /*yield*/, User.getById(payload.Id)];
                case 3:
                    user = _a.sent();
                    if (GoogleId != user.GoogleId)
                        return [2 /*return*/, reply.status(403).send()];
                    return [3 /*break*/, 5];
                case 4:
                    if (Id != payload.Id)
                        return [2 /*return*/, reply.status(403).send()]; // Forbidden
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    if (request.method == "POST") {
                        relationship = request.body;
                        if (((relationship === null || relationship === void 0 ? void 0 : relationship.User1Id) || request.params.id) != payload.Id)
                            return [2 /*return*/, reply.status(403).send()];
                    }
                    _a.label = 7;
                case 7: return [3 /*break*/, 9];
                case 8:
                    err_2 = _a.sent();
                    // console.debug(yellow, "here 4")
                    return [2 /*return*/, reply.status(401).send({ error: err_2 })]; // Unauthorized
                case 9: return [2 /*return*/];
            }
        });
    }); });
    server_ts_1.server.get('/data/user/getById', { preHandler: server_ts_1.server.mustHaveToken }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
        var Id, user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    Id = request.query.Id;
                    return [4 /*yield*/, UserDTO.getById(Id)];
                case 1:
                    user = _a.sent();
                    if (user)
                        reply.send(user); // send dto
                    else
                        reply.status(404).send();
                    return [2 /*return*/];
            }
        });
    }); });
    // why is this here
    // server.get('/data/user/getById', { preHandler: (server as any).byItsOwnUser }, (request, reply) => {
    // 	const Id = (request.query as { Id: number }).Id;
    // 	db.get("select * from users where Id = ?", [Id], (err, row) => {
    // 		if (err)
    // 		{
    // 			console.error('Error: get /data/user/getById: ', err);
    // 			reply.status(500).send();
    // 		}
    // 		else
    // 		{
    // 			if (!row) // user not found
    // 			{
    // 				console.log(red, 'get /data/user/getById: User not found: ', Id);
    // 				reply.status(404).send();
    // 			}
    // 			reply.send(row); // user object as in body as a stringified json
    // 		}
    // 	});
    // });
    // serving avatars
    server_ts_1.server.get('/data/user/getAvatarById', function (request, reply) {
        // console.log(request.cookies);
        // if cookie is not for the user id, you can't get it
        var Id = request.query.Id;
        User.getById(Id)
            .then(function (user) {
            // get the avatar path
            database_ts_1.db.get("SELECT AvatarPath FROM users WHERE Id = ?", [Id], function (err, row) {
                var defaultAvatarPath = "./avatars/default-avatar.png";
                reply.type("image/png"); // set content-type
                if (err) // database error
                 {
                    console.error(global_ts_1.red, 'Error: /data/user/getAvatarById:', err);
                    if (!fs_1.default.existsSync(defaultAvatarPath)) {
                        reply.status(500).send();
                        return;
                    }
                    fs_1.default.createReadStream(defaultAvatarPath).pipe(reply.raw); // serve default
                    return;
                }
                // user not found !
                if (!row || !row.AvatarPath) {
                    console.debug(global_ts_1.blue, 'User not found in db or no avatar for him');
                    if (!fs_1.default.existsSync(defaultAvatarPath)) {
                        reply.status(500).send();
                        return;
                    }
                    fs_1.default.createReadStream(defaultAvatarPath).pipe(reply.raw); // serve default
                    return;
                }
                // Full avatar path
                var filePath = path_1.default.join(process.cwd(), "avatars", row.AvatarPath);
                // if dir not found
                // if file not found
                if (!fs_1.default.existsSync(filePath)) {
                    console.debug(global_ts_1.blue, 'Avatar file not found, serving default');
                    if (!fs_1.default.existsSync(defaultAvatarPath)) {
                        reply.status(500).send();
                        return;
                    }
                    fs_1.default.createReadStream(defaultAvatarPath).pipe(reply.raw);
                    return;
                }
                // Send the image file
                console.debug(global_ts_1.blue, 'Serving the proper avatar');
                reply.type("image/jpeg");
                fs_1.default.createReadStream(filePath).pipe(reply.raw); // readable stream pipe to writable stream
                // A file stream is a way to read or write a file piece by piece, instead of loading the entire file into memory at once
            });
        });
    });
    server_ts_1.server.get('/data/user/getByUsername', { preHandler: server_ts_1.server.mustHaveToken }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
        var username, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    username = request.query.username;
                    if (!username || username.trim() == "" || username.length < 3 || username.length > 20 || !/^[a-zA-Z0-9_]+$/.test(username)) {
                        return [2 /*return*/, reply.status(400).send()];
                    }
                    return [4 /*yield*/, UserDTO.getByUsername(username)];
                case 1:
                    res = _a.sent();
                    if (res)
                        reply.send(res);
                    else
                        reply.status(404).send();
                    return [2 /*return*/];
            }
        });
    }); });
    // what is this route for
    server_ts_1.server.get('/data/user/getByGoogleId', { preHandler: server_ts_1.server.byItsOwnUser }, function (request, reply) {
        var GoogleId = request.query.GoogleId; // the query string is a json object: url ? Id=${encodeURIComponent(Id)
        database_ts_1.db.get("select * from users where GoogleId = ?", [GoogleId], function (err, row) {
            if (err) {
                console.error(global_ts_1.red, 'Error: get /data/user/getByGoogleId: ', err);
                reply.status(500).send();
            }
            else {
                if (!row) // user not found
                 {
                    console.log(global_ts_1.red, 'get /data/user/getByGoogleId: User not found: ', GoogleId);
                    reply.status(404).send();
                    return;
                }
                reply.send(row); // user object as in body as a stringified json
            }
        });
    });
    // return userDTO
    // server.put('/data/user/update', { preHandler: server.byItsOwnUser }, (request, reply) => {
    // 	console.info(green, "PUT users");
    // 	const user = request.body;
    // 	db.run("update users set Username = ?, AvatarPath = ?, Wins = ?, Losses = ?, SessionId = ?, ExpirationDate = ?, LastActivity = ?, TOTPSecretPending = ?, TOTPSecret = ? where Id = ?",
    // 		[user.Username, user.AvatarPath, user.Wins, user.Losses, user.SessionId, user.ExpirationDate, new Date(), user.TOTPSecretPending, user.TOTPSecret, user.Id], function(err) {
    // 		if (err) // useless bc database throws to server and server return 500
    // 		{
    // 			console.log(red, 'Error: get /data/user/update: ', err);
    // 			reply.status(500).send();
    // 		}
    // 		else
    // 		{
    // 			if (this.changes < 1)
    // 				reply.status(500).send();
    // 			else
    // 				reply.send();
    // 		}
    // 	});
    // });
    var updateUserSchema = {
        body: {
            type: 'object',
            required: ['Id', 'Username'],
            properties: {
                Id: { type: 'number' },
                Username: { type: "string", minLength: 3, maxLength: 20, pattern: "^[a-zA-Z0-9_]+$" } // str protect
            }
        }
    };
    server_ts_1.server.put('/data/user/update', { preHandler: server_ts_1.server.byItsOwnUser, schema: updateUserSchema }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
        var userObj, user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userObj = request.body;
                    user = new UserDTO();
                    user.Id = userObj.Id;
                    user.Username = userObj.Username;
                    user.Wins = userObj.Wins;
                    user.Losses = userObj.Losses;
                    user.LastActivity = userObj.LastActivity;
                    return [4 /*yield*/, user.update()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // server.delete('/data/user/delete', { preHandler: (server as any).byItsOwnUser }, (request, reply) => {
    // 	const { Id } = request.query as { Id: number };
    // 	db.run("delete from users where id = ?", [Id], function(err) {
    // 		if (err)
    // 		{
    // 			console.log(red, 'Error: get /data/user/delete: ', err);
    // 			reply.status(500).send();
    // 		}
    // 		else
    // 		{
    // 			if (this.changes < 1)
    // 				reply.status(500).send();
    // 			else
    // 				reply.send();
    // 		}
    // 	});
    // });
    // 
    // get friends
    server_ts_1.server.get('/data/user/getFriends', { preHandler: server_ts_1.server.byItsOwnUser }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
        var Id, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    Id = request.query.Id;
                    _b = (_a = reply).send;
                    return [4 /*yield*/, User.getFriends(Id)];
                case 1:
                    _b.apply(_a, [_c.sent()]);
                    return [2 /*return*/];
            }
        });
    }); });
    // problem if I added jwt checking
    server_ts_1.server.get('/data/user/enabled2FA', function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
        var Id, user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    Id = request.query.Id;
                    return [4 /*yield*/, User.getById(Id)];
                case 1:
                    user = _a.sent();
                    if (!user)
                        return [2 /*return*/, reply.status(404).send()];
                    if (user.enabled2FA())
                        reply.status(200).send();
                    else
                        reply.status(404).send();
                    return [2 /*return*/];
            }
        });
    }); });
    // you must give it
    // id
    // username or avatar or both In multipart form data
    server_ts_1.server.put("/updateProfile/:id", { preHandler: server_ts_1.server.byItsOwnUser }, function (req, reply) { return __awaiter(_this, void 0, void 0, function () {
        var parts, username, avatarPath, filename, _a, parts_1, parts_1_1, part, writeStream, e_1_1, user;
        var _b, e_1, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    parts = req.parts();
                    username = null;
                    avatarPath = null;
                    filename = null;
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 6, 7, 12]);
                    _a = true, parts_1 = __asyncValues(parts);
                    _e.label = 2;
                case 2: return [4 /*yield*/, parts_1.next()];
                case 3:
                    if (!(parts_1_1 = _e.sent(), _b = parts_1_1.done, !_b)) return [3 /*break*/, 5];
                    _d = parts_1_1.value;
                    _a = false;
                    part = _d;
                    if (part.type === "file" && part.fieldname === "avatar") {
                        filename = (0, global_ts_2.guid)() + ".png";
                        avatarPath = path_1.default.join(process.cwd(), "avatars", filename);
                        writeStream = fs_1.default.createWriteStream(avatarPath);
                        (0, promises_1.pipeline)(part.file, writeStream);
                    }
                    else if (part.type === "field" && part.fieldname === "username") {
                        username = part.value;
                    }
                    _e.label = 4;
                case 4:
                    _a = true;
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 12];
                case 6:
                    e_1_1 = _e.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 12];
                case 7:
                    _e.trys.push([7, , 10, 11]);
                    if (!(!_a && !_b && (_c = parts_1.return))) return [3 /*break*/, 9];
                    return [4 /*yield*/, _c.call(parts_1)];
                case 8:
                    _e.sent();
                    _e.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 11: return [7 /*endfinally*/];
                case 12:
                    if (username) {
                        if (username.trim() === "" ||
                            username.length < 3 ||
                            username.length > 20 ||
                            !/^[a-zA-Z0-9_]+$/.test(username)) {
                            return [2 /*return*/, reply.status(400).send()];
                        }
                    }
                    return [4 /*yield*/, User.getById(req.params.id)];
                case 13:
                    user = _e.sent();
                    user.Username = username !== null && username !== void 0 ? username : user.Username;
                    user.AvatarPath = filename !== null && filename !== void 0 ? filename : user.AvatarPath;
                    return [4 /*yield*/, user.update()];
                case 14:
                    _e.sent(); // why wait
                    reply.send();
                    return [2 /*return*/];
            }
        });
    }); });
    // get user games
    server_ts_1.server.get("/users/:id/games", { preHandler: server_ts_1.server.byItsOwnUser }, function (req, reply) { return __awaiter(_this, void 0, void 0, function () {
        var games;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log(global_ts_1.green, 'GET /users/:id/games');
                    console.debug(global_ts_1.yellow, 'User ID: ', req.params.id);
                    return [4 /*yield*/, game_ts_1.clsGame.getByUserId(req.params.id)];
                case 1:
                    games = _a.sent();
                    return [2 /*return*/, reply.send(games)];
            }
        });
    }); });
}
// WHEN YOU UPDATE SOMETHING
// ? number == params number
// valid: /data/user/delete
