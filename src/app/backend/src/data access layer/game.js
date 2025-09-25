"use strict";
/**
 * CREATE TABLE IF NOT EXISTS Games (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    User1Id INTEGER NOT NULL,
    User2Id INTEGER NULL, -- ai game
    Date TEXT NOT NULL DEFAULT NULL,
    WinnerId INTEGER NOT NULL,
    TournamentId INTEGER NULL, -- game not in tournament

    FOREIGN KEY (User1Id) REFERENCES Users(Id),
    FOREIGN KEY (User2Id) REFERENCES Users(Id)
);
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.clsGame = void 0;
var database_ts_1 = require("./database.ts");
var global_ts_1 = require("../global.ts");
// db stuff
database_ts_1.db.run("\n\tCREATE TABLE IF NOT EXISTS Games (\n\t\tId INTEGER PRIMARY KEY AUTOINCREMENT,\n\t\tUser1Id INTEGER NOT NULL,\n\t\tUser2Id INTEGER NULL, -- ai game\n\t\tDate TEXT NOT NULL DEFAULT NULL,\n\t\tWinnerId INTEGER NULL, -- ai wins\n\t\tTournamentId INTEGER NULL, -- game not in tournament\n\n\t\tFOREIGN KEY (User1Id) REFERENCES Users(Id),\n\t\tFOREIGN KEY (User2Id) REFERENCES Users(Id)\n\t);\n", function (err) {
    if (err)
        console.error(global_ts_1.red, 'Error creating table Games', err);
    else
        console.log(global_ts_1.green, 'Table Games ready');
});
// between server and db
var clsGame = /** @class */ (function () {
    function clsGame(obj) {
        Object.assign(this, obj);
    }
    // get by id
    clsGame.getById = function (Id) {
        console.log(global_ts_1.green, 'Game.getById');
        console.debug(global_ts_1.yellow, 'Id: ', Id);
        return new Promise(function (resolve, reject) {
            var query = "\n\t\t\t\tSELECT * FROM Games WHERE Id = ?\n\t\t\t";
            database_ts_1.db.get(query, [Id], function (err, row) {
                if (err) {
                    console.error(global_ts_1.red, 'Error: Game.get: ', err);
                    // reject(err);
                }
                else {
                    if (row) {
                        var game = new clsGame(row);
                        resolve(game);
                    }
                    else {
                        resolve(null);
                    }
                }
            });
        });
    };
    clsGame.getByUserId = function (Id) {
        console.log(global_ts_1.green, 'Game.getByUserId');
        console.debug(global_ts_1.yellow, 'UserId: ', Id);
        return new Promise(function (resolve, reject) {
            var query = "\n\t\t\t\tSELECT * FROM Games WHERE User1Id = ? OR User2Id = ?\n\t\t\t\tORDER BY Date DESC\n\t\t\t";
            database_ts_1.db.all(query, [Id, Id], function (err, rows) {
                if (err) {
                    console.error(global_ts_1.red, 'Error: Game.getByUserId: ', err);
                    reject(null);
                }
                else {
                    // make them class instances
                    var games = rows.map(function (row) {
                        var game = new clsGame(row);
                        return game;
                    });
                    resolve(games); // return array of games
                    // resolve(rows);
                }
            });
        });
    };
    // users must get games history
    // no sensitive data in this class
    // we add game after it finishes
    clsGame.prototype.add = function () {
        var _this = this;
        console.log(global_ts_1.green, 'Game.add');
        console.debug(global_ts_1.yellow, 'Adding: ', this);
        return new Promise(function (resolve, reject) {
            var query = "\n\t\t\t\tINSERT INTO Games (User1Id, User2Id, Date, WinnerId, TournamentId)\n\t\t\t\tVALUES (?, ?, ?, ?, ?)\n\t\t\t";
            database_ts_1.db.run(query, [_this.User1Id, _this.User2Id, _this.Date, _this.WinnerId, _this.TournamentId], function (err) {
                if (err) // to test this
                 {
                    console.error(global_ts_1.red, 'Error: Game.add: ', err);
                    // reject(err); // throw err;
                }
                else {
                    resolve(this.lastID); // return the id of the inserted game
                }
            });
        });
    };
    clsGame.getLastId = function () {
        console.log(global_ts_1.green, 'Game.getLastId');
        var query = "SELECT MAX(Id) FROM Games";
        return new Promise(function (resolve, reject) {
            database_ts_1.db.get(query, function (err, row) {
                if (err) {
                    console.error(global_ts_1.red, 'Error: Game.getLastId: ', err);
                }
                else {
                    resolve(row.LastId);
                    // if no rows
                }
            });
        });
    };
    return clsGame;
}());
exports.clsGame = clsGame;
// function gameRoutes()
// {
// 	server.get("/games/:userId",  (req, res) => {
// 	});
// }
// // usage
// const obj = {
// 	Id: -1, // autoincrement
// 	User1Id: 1,
// 	User2Id: 2,
// 	Date: new Date(),
// 	WinnerId: 1, // 1 user1 wins, 2 user2 wins, 0 draw
// 	TournamentId: null // not in tournament
// }
// const game: Game = new Game(obj);
// game.add();
