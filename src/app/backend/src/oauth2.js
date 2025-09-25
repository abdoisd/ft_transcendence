"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.setSessionIdCookie = setSessionIdCookie;
exports.createJwt = createJwt;
exports.OAuth2Routes = OAuth2Routes;
var server_ts_1 = require("./server.ts");
var querystring_1 = require("querystring"); // To handle URL query strings
var user_ts_1 = require("./data access layer/user.ts");
var global_ts_1 = require("./global.ts");
var fs_1 = require("fs");
var path_1 = require("path");
var database_ts_1 = require("./data access layer/database.ts");
var global_ts_2 = require("./global.ts");
var server_ts_2 = require("./server.ts");
var promises_1 = require("stream/promises");
var global_ts_3 = require("./global.ts");
var CLIENT_ID = process.env.CLIENT_ID;
var REDIRECT_URI = process.env.REDIRECT_URI;
//!
function setSessionIdCookie(user, reply) {
    var sessionId = (0, global_ts_1.guid)();
    console.debug(global_ts_1.blue, "Setting sessionId for user");
    user.SessionId = sessionId;
    user.ExpirationDate = new Date(Date.now() + (60000 * 60 * 24)); // expire in 1 day
    var user2 = Object.assign(new user_ts_1.User(-1, "", "", "", -1, -1), user);
    user2.update().then(function (res) {
        if (!res)
            console.error(global_ts_1.red, "Error setting sessionId for user");
    });
    // set cookie to browser
    console.debug(global_ts_1.blue, "Setting sessionId for browser");
    reply.setCookie('sessionId', sessionId, {
        httpOnly: true, // client JS cannot access
        path: '/', // send cookie on all routes
        maxAge: 60 * 60 * 24, // session is not valid in server after 1 day
        secure: false, // set true if using HTTPS
    });
}
//!
function createJwt(Id) {
    return server_ts_1.server.jwt.sign({
        Id: Id,
        IsRoot: 0
    }, { expiresIn: '1d' });
}
// you can to register routes
function OAuth2Routes() {
    var _this = this;
    server_ts_1.server.get('/loginGoogle', function (req, reply) {
        // this is never reached
        console.debug(global_ts_1.blue, "/loginGoogle");
        var queryString = querystring_1.default.stringify({
            client_id: CLIENT_ID,
            redirect_uri: "https://localhost/loginGoogleCallback",
            response_type: 'code',
            scope: 'openid email profile',
        });
        // nginx is proxying to here
        // google only knows nginx
        // configure google with nginx
        reply.redirect("https://accounts.google.com/o/oauth2/v2/auth?".concat(queryString));
    });
    // google redirect user to config.WEBSITE_URL/loginGoogleCallback
    // and browser send request to our server
    server_ts_1.server.get('/loginGoogleCallback', function (req, reply) { return __awaiter(_this, void 0, void 0, function () {
        var code, googleResponseForToken, _a, _b, _c, _d, tokens, userRes, userObjFromGoogle, response, user, jwt, userr, params_1, jwt, params, newUser, res, userId, jwt;
        var _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    console.debug(global_ts_1.blue, "/loginGoogleCallback");
                    code = req.query.code;
                    _a = fetch;
                    _b = ['https://oauth2.googleapis.com/token'];
                    _e = {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    };
                    _d = (_c = querystring_1.default).stringify;
                    _f = {
                        code: code,
                        client_id: CLIENT_ID
                    };
                    return [4 /*yield*/, (0, server_ts_2.vaultGoogleClientSecret)()];
                case 1: return [4 /*yield*/, _a.apply(void 0, _b.concat([(_e.body = _d.apply(_c, [(_f.client_secret = _g.sent(),
                                _f.redirect_uri = REDIRECT_URI,
                                _f.grant_type = 'authorization_code',
                                _f)]),
                            _e)]))];
                case 2:
                    googleResponseForToken = _g.sent();
                    return [4 /*yield*/, googleResponseForToken.json()];
                case 3:
                    tokens = _g.sent();
                    return [4 /*yield*/, fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                            headers: { Authorization: "Bearer ".concat(tokens.access_token) }
                        })];
                case 4:
                    userRes = _g.sent();
                    return [4 /*yield*/, userRes.json()];
                case 5:
                    userObjFromGoogle = _g.sent();
                    return [4 /*yield*/, fetch(global_ts_2.config.WEBSITE_URL + "/data/user/getByGoogleId?GoogleId=".concat(encodeURIComponent(userObjFromGoogle.id)), { headers: { "Authorization": "Bearer ".concat(process.env.ROOT_TOKEN) } })];
                case 6:
                    response = _g.sent();
                    if (!response.ok) return [3 /*break*/, 8];
                    console.debug(global_ts_1.blue, "User in db");
                    return [4 /*yield*/, response.json()];
                case 7:
                    user = _g.sent();
                    if (user.Username == null) {
                        console.debug(global_ts_1.blue, "User has not username");
                        jwt = createJwt(user.Id);
                        console.debug(global_ts_1.yellow);
                        console.debug(global_ts_1.yellow, "server set jwt=" + jwt);
                        reply.redirect("https://localhost/newUser?Id=".concat(user.Id, "&jwt=").concat(jwt));
                    }
                    else {
                        console.debug(global_ts_1.blue, "User has username");
                        userr = Object.assign(new user_ts_1.User(-1, "", "", "", -1, -1), user);
                        if (userr.enabled2FA()) {
                            params_1 = querystring_1.default.stringify(__assign({}, user));
                            reply.redirect("https://localhost" + "/existingUser?Id=".concat(user.Id)); // removed all query params
                            return [2 /*return*/];
                        }
                        // SESSION ID
                        setSessionIdCookie(user, reply);
                        jwt = createJwt(user.Id);
                        console.debug(global_ts_1.yellow, "server set jwt=" + jwt); // this return jwt, hhhhhhh
                        params = querystring_1.default.stringify(__assign({}, user));
                        reply.redirect("https://localhost" + "/existingUser?".concat(params, "&jwt=").concat(jwt)); // redirect to home
                        return [2 /*return*/];
                    }
                    return [3 /*break*/, 10];
                case 8:
                    console.log(global_ts_1.blue, "User is not in db");
                    newUser = new user_ts_1.User(-1, userObjFromGoogle.id, null, "", 0, 0);
                    return [4 /*yield*/, newUser.add()];
                case 9:
                    res = _g.sent();
                    if (res) {
                        console.debug(global_ts_1.blue, "User added to db");
                        userId = res;
                        jwt = createJwt(userId);
                        console.debug(global_ts_1.yellow);
                        console.debug(global_ts_1.yellow, "server set jwt=" + jwt);
                        // 2FA
                        reply.redirect("https://localhost/newUser?Id=".concat(userId, "&jwt=").concat(jwt));
                    }
                    else {
                        console.error(global_ts_1.red, "Error adding new user");
                        reply.status(500).send("Error: failure adding user");
                    }
                    _g.label = 10;
                case 10: return [2 /*return*/];
            }
        });
    }); });
    // server.post("/uploadProfile/:id", { preHandler: (server as any).byItsOwnUser }, async (req, reply) => {
    // 	console.debug(blue, "/uploadProfile");
    // 	// Get the parts of the multipart form
    // 	const parts = req.parts();
    // 	let username = null;
    // 	let avatarPath = null;
    // 	let Id = req.params.id;
    // 	var fileName: string | null = null;
    // 	const savedFiles: string[] = [];
    // 	for await (const part of parts) {
    // 		if (part.type == "file") {
    // 			for await (const _ of part.file) {
    // 				// ignore chunks
    // 			}
    // 			// doesn’t wait for more chunks
    // 			// while (part.file.read())
    // 			// {
    // 			// }
    // 			// part.file.read();
    // 			// await pipeline(part.file, fs.createWriteStream("/dev/null"));
    // 		} else {
    // 			if (part.type === "field" && part.fieldname === "username") {
    // 				username = (part as any).value;
    // 			}
    // 		}
    // 	}
    // 	// only avatar
    // 	if (username == null)
    // 	{
    // 		console.debug(blue, "username is null");
    // 		const user: User = await User.getById(Id);
    // 		if (user)
    // 		{
    // 			if (user.AvatarPath)
    // 			{
    // 				// update existing avatar
    // 				fileName = user.AvatarPath;
    // 			}
    // 			else
    // 			{
    // 				// first avatar
    // 				fileName = Guid() + ".png";
    // 				user.AvatarPath = fileName;
    // 				user.update(); // Ensure update is awaited and user is an instance of a class with update method
    // 				//! HERE
    // 				// fetch(config.WEBSITE_URL + `/data/user/update`,{
    // 				// 	method: "PUT",
    // 				// 	headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.ROOT_TOKEN}` }, // is this important, for fastify I think
    // 				// 	body: JSON.stringify(new User(user.Id, user.GoogleId, user.Username, fileName!, user.Wins, user.Losses, user.SessionId, user.ExpirationDate)), //?
    // 				// })
    // 			}
    // 			for (const file of savedFiles) {
    // 				if (file) {
    // 					const avatarPath = path.join(process.cwd(), "Avatars", fileName); //!
    // 					// Save the file in server local storage
    // 					const writeStream = fs.createWriteStream(avatarPath);
    // 					(file as any).pipe(writeStream);
    // 				}
    // 			}
    // 		}
    // 		return ;
    // 	}
    // 	if (username)
    // 	{
    // 		if (username.length > 20 || username.length < 3 || username.trim() === "" || !/^[a-zA-Z0-9_]+$/.test(username))
    // 			return reply.status(400).send();
    // 	}
    // 	// use saved files objects
    // 	for await (const file of savedFiles) {
    // 		if (file) {
    // 			// It's a file
    // 			fileName = Guid() + ".png"; // filename: date_filename, not unique but good for now
    // 			const avatarPath = path.join(process.cwd(), "Avatars", fileName); //!
    // 			// Save the file
    // 			const writeStream = fs.createWriteStream(avatarPath); // open file in process and create it in disk
    // 			await (file as any).pipe(writeStream); // write to it
    // 			break ;
    // 		}
    // 	}
    // 	if (Id == null || (username == null || username.trim() == "")) {
    // 		console.error(red, "Missing Id or username");
    // 		reply.status(400).send("Error: Missing Id or username");
    // 		return ;
    // 	}
    // 	// Now you have both
    // 	console.debug(blue, "Id:", Id);
    // 	console.debug(blue, "Username:", username);
    // 	console.debug(blue, "Avatar saved at:", fileName);
    // 	//! keep file path when no avatar
    // 	if (fileName == null)
    // 	{
    // 		// const response = await fetch(config.WEBSITE_URL + `/data/user/getById?Id=${Id}`, {headers: { "Authorization": `Bearer ${process.env.ROOT_TOKEN}` }});
    // 		// if (response.ok) // user found
    // 		// {
    // 		// 	const user: User = await response.json();
    // 		// 	fileName = user.AvatarPath;
    // 		// }
    // 		const user: User = await User.getById(Id);
    // 		if (user)
    // 		{
    // 			fileName = user.AvatarPath;
    // 		}
    // 	}
    // 	const userr: User = await User.getById(Id); // Ensure userr is declared and typed
    // 	if (!userr)
    // 		return reply.status(404).send();
    // 	// update user username and avatar path in db
    // 	console.debug(blue, "Updating user in db, fileName:", fileName);
    // 	const user: User = new User(Id!, userr.GoogleId, username!, fileName!, 0, 0);
    // 	//! HERE
    // 	// const response = await fetch(config.WEBSITE_URL + `/data/user/update`,{ // server domain
    // 	// 	method: "PUT",
    // 	// 	headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.ROOT_TOKEN}` }, // is this important, for fastify I think
    // 	// 	body: JSON.stringify(user),
    // 	// });
    // 	const response = await user.update();
    // 	if (response)
    // 	{
    // 		// SESSION ID
    // 		setSessionIdCookie(user, reply);
    // 		reply.send();
    // 	}
    // 	else
    // 		reply.status(500).send("Error: failure updating user");
    // });
    server_ts_1.server.post("/uploadProfile/:id", { preHandler: server_ts_1.server.byItsOwnUser }, function (req, reply) { return __awaiter(_this, void 0, void 0, function () {
        var parts, username, avatarPath, filename, _a, parts_1, parts_1_1, part, writeStream, e_1_1, user, success;
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
                        filename = (0, global_ts_3.guid)() + ".png";
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
                    if (!username)
                        return [2 /*return*/, reply.status(400).send()];
                    if (username.trim() == "" ||
                        username.length < 3 ||
                        username.length > 20 ||
                        !/^[a-zA-Z0-9_]+$/.test(username)) {
                        return [2 /*return*/, reply.status(400).send()];
                    }
                    return [4 /*yield*/, user_ts_1.User.getById(req.params.id)];
                case 13:
                    user = _e.sent();
                    user.Username = username !== null && username !== void 0 ? username : user.Username;
                    user.AvatarPath = filename !== null && filename !== void 0 ? filename : user.AvatarPath;
                    return [4 /*yield*/, user.update()];
                case 14:
                    success = _e.sent();
                    if (success) {
                        // SESSION ID
                        setSessionIdCookie(user, reply);
                        return [2 /*return*/, reply.send()];
                    }
                    else
                        return [2 /*return*/, reply.status(500).send()];
                    return [2 /*return*/];
            }
        });
    }); });
    server_ts_1.server.post("/validateSession", function (request, reply) {
        // console.debug(yellow, "/validateSession");
        var sessionId = request.cookies.sessionId;
        if (!sessionId) {
            console.debug(global_ts_1.blue, "sessionId cookie not found"); // the browser didn't send it or user removed it
            return reply.status(404).send(); // didn't found session id
        }
        database_ts_1.db.get("SELECT * FROM Users WHERE SessionId = ?", [sessionId], function (err, row) {
            if (err) {
                console.error(global_ts_1.red, 'Error querying user by sessionId:', err);
                return reply.status(500).send();
            }
            if (row) {
                // console.debug(blue, "User in db found by SessionId");
                //*
                var userRow = row; // Type assertion
                if (userRow.ExpirationDate < (new Date()).getTime()) {
                    console.debug(global_ts_1.blue, "Session expired");
                    return reply.status(401).send();
                }
                reply.send(userRow);
            }
            else {
                console.debug(global_ts_1.blue, "User not found by SessionId");
                reply.status(404).send();
            }
        });
    });
}
