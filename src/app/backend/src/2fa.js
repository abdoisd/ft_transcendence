"use strict";
// enable 2fa for user
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
exports.Enable2faRoutes = Enable2faRoutes;
var server_ts_1 = require("./server.ts");
var speakeasy_1 = require("speakeasy");
var qrcode_1 = require("qrcode");
var global_ts_1 = require("./global.ts");
var user_ts_1 = require("./data access layer/user.ts");
var oauth2_ts_1 = require("./oauth2.ts");
var oauth2_ts_2 = require("./oauth2.ts");
function Enable2faRoutes() {
    var _this = this;
    // input: id
    server_ts_1.server.get("/auth/2fa", { preHandler: server_ts_1.server.byItsOwnUser }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
        var userId, secret, user, qrCodeDataURL;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userId = request.query.Id;
                    secret = speakeasy_1.default.generateSecret({});
                    return [4 /*yield*/, user_ts_1.User.getById(userId)];
                case 1:
                    user = _a.sent();
                    user.TOTPSecretPending = secret.base32;
                    user.update();
                    console.debug(global_ts_1.yellow, "secret: ", secret);
                    return [4 /*yield*/, qrcode_1.default.toDataURL(secret.otpauth_url)];
                case 2:
                    qrCodeDataURL = _a.sent();
                    console.debug(global_ts_1.yellow, "qrCodeDataURL: ", qrCodeDataURL);
                    reply.send({ qrCode: qrCodeDataURL }); // response body
                    return [2 /*return*/];
            }
        });
    }); });
    // input: id, code
    server_ts_1.server.get("/auth/2fa/enable", { preHandler: server_ts_1.server.byItsOwnUser }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
        var userId, code, user, secret, verified, user_1, jwt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.debug(global_ts_1.yellow, "/auth/2fa/enable");
                    userId = request.query.Id;
                    code = request.query.code;
                    if (!userId || !code || userId.trim() == "" || code.trim() == "")
                        return [2 /*return*/, reply.status(400).send()];
                    console.debug(global_ts_1.yellow, "code: ", code);
                    return [4 /*yield*/, user_ts_1.User.getById(userId)];
                case 1:
                    user = _a.sent();
                    secret = user.TOTPSecretPending;
                    console.debug(global_ts_1.yellow, "secret 2: ", secret);
                    verified = speakeasy_1.default.totp.verify({
                        secret: secret,
                        encoding: "base32",
                        token: code
                    });
                    if (!verified) return [3 /*break*/, 3];
                    return [4 /*yield*/, user_ts_1.User.getById(userId)];
                case 2:
                    user_1 = _a.sent();
                    user_1.TOTPSecret = secret;
                    user_1.update();
                    jwt = (0, oauth2_ts_1.createJwt)(user_1.Id);
                    // set session cookie here
                    (0, oauth2_ts_2.setSessionIdCookie)(user_1, reply);
                    reply.send({ jwt: jwt, user: user_1 });
                    return [3 /*break*/, 4];
                case 3:
                    reply.status(400).send();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    }); });
    server_ts_1.server.get("/auth/2fa/verify", function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
        var userId, code, user, secret, verified, jwt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.debug(global_ts_1.yellow, "/auth/2fa/verify");
                    userId = request.query.Id;
                    code = request.query.code;
                    if (!userId || !code || userId.trim() == "" || code.trim() == "")
                        return [2 /*return*/, reply.status(400).send()];
                    return [4 /*yield*/, user_ts_1.User.getById(userId)];
                case 1:
                    user = _a.sent();
                    secret = user.TOTPSecret;
                    verified = speakeasy_1.default.totp.verify({
                        secret: secret,
                        encoding: "base32",
                        token: code
                    });
                    if (verified) {
                        jwt = (0, oauth2_ts_1.createJwt)(user.Id);
                        // set session cookie here
                        (0, oauth2_ts_2.setSessionIdCookie)(user, reply);
                        reply.send({ jwt: jwt, user: user });
                    }
                    else
                        reply.status(403).send();
                    return [2 /*return*/];
            }
        });
    }); });
}
/**
 * qr code with many representations
 */
