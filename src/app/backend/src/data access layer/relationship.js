"use strict";
// data access
// class
// add, update, delete from Relationships table
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
exports.Relationship = void 0;
exports.relationshipRoutes = relationshipRoutes;
var server_ts_1 = require("../server.ts");
var database_ts_1 = require("./database.ts");
var global_ts_1 = require("../global.ts");
var Relationship = /** @class */ (function () {
    // constr and default one
    function Relationship(Id, User1Id, User2Id, Relationship) {
        this.Id = Id !== null && Id !== void 0 ? Id : -1;
        this.User1Id = User1Id !== null && User1Id !== void 0 ? User1Id : -1;
        this.User2Id = User2Id !== null && User2Id !== void 0 ? User2Id : -1;
        this.Relationship = Relationship !== null && Relationship !== void 0 ? Relationship : -1;
    }
    Relationship.getAll = function () {
        return new Promise(function (resolve, reject) {
            database_ts_1.db.all('SELECT * FROM Relationships', function (err, rows) {
                if (err)
                    reject(null); // returning
                else
                    resolve(rows);
            });
        });
    };
    Relationship.getById = function (Id) {
        return new Promise(function (resolve, reject) {
            database_ts_1.db.get('SELECT * FROM Relationships WHERE Id = ?', [Id], function (err, row) {
                if (err)
                    reject(null);
                else
                    resolve(row || null);
            });
        });
    };
    Relationship.prototype.add = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
                            database_ts_1.db.run('INSERT INTO Relationships (User1Id, User2Id, Relationship) VALUES (?, ?, ?)', [_this.User1Id, _this.User2Id, _this.Relationship], function (err) {
                                if (err) {
                                    console.error(global_ts_1.red, "Relationship.add", err);
                                    reject(-1);
                                }
                                else
                                    resolve(this.lastID);
                            });
                        })];
                    case 1:
                        result = _a.sent();
                        this.Id = result;
                        return [2 /*return*/];
                }
            });
        });
    };
    Relationship.prototype.update = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            database_ts_1.db.run('UPDATE Relationships SET User1Id = ?, User2Id = ?, Relationship = ? WHERE Id = ?', [_this.User1Id, _this.User2Id, _this.Relationship, _this.Id], function (err) {
                if (err) {
                    console.error(global_ts_1.red, "Relationship.update", err);
                    reject(false);
                }
                else
                    resolve(this.changes > 0);
            });
        });
    };
    // for using in the server
    Relationship.prototype.delete = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            database_ts_1.db.run('DELETE FROM Relationships WHERE Id = ?', [_this.Id], function (err) {
                if (err)
                    reject(false);
                else
                    resolve(this.changes > 0);
            });
        });
    };
    Relationship.deleteById = function (Id) {
        return new Promise(function (resolve, reject) {
            database_ts_1.db.run('DELETE FROM Relationships WHERE Id = ?', [Id], function (err) {
                if (err)
                    reject(false);
                else
                    resolve(this.changes > 0);
            });
        });
    };
    return Relationship;
}());
exports.Relationship = Relationship;
// THIS IS SQLITE
var relationshipAddSchema = {
    body: {
        type: "object",
        required: ["User1Id", "User2Id", "Relationship"],
        properties: {
            User1Id: { type: "integer" },
            User2Id: { type: "integer" },
            Relationship: { type: "integer", enum: [0, 1] }
        }
    }
};
// routes
// THIS IS FASTIFY
function relationshipRoutes() {
    var _this = this;
    // ADD FRIEND, ONLY IF YOU ARE USER1
    server_ts_1.server.post("/relationships", { preHandler: server_ts_1.server.byItsOwnUser, schema: relationshipAddSchema }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
        var relationship;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    relationship = Object.assign(new Relationship(), request.body);
                    return [4 /*yield*/, relationship.add()];
                case 1:
                    _a.sent();
                    if (relationship.Id == -1) {
                        reply.status(500).send();
                    }
                    else {
                        reply.send();
                    }
                    return [2 /*return*/];
            }
        });
    }); });
    // // FOR BLOCKING, ONLY IF YOU ARE USER1
    // server.put("/relationships", { preHandler: (server as any).byItsOwnUser }, async (request, reply) => {
    // 	const relationship: Relationship = Object.assign(new Relationship(), request.body);
    // 	const res = await relationship.update();
    // 	if (res == false) {
    // 		reply.status(500).send();
    // 	} else {
    // 		reply.send(res);
    // 	}
    // });
}
