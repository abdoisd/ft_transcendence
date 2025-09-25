"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
var sqlite3_1 = require("sqlite3");
var global_ts_1 = require("../global.ts");
var server_ts_1 = require("../server.ts"); // import variable
// create/connect to database AND create tables
exports.db = new sqlite3_1.default.Database('ft_transcendence', function (err) {
    if (err)
        console.error(global_ts_1.red, 'Error: creating the database:', err);
    else {
        server_ts_1.connectedToSqlite.set(1);
        console.log(global_ts_1.green, 'Database opened');
    }
});
exports.db.run("\n\tCREATE TABLE IF NOT EXISTS Relationships (\n\t    Id INTEGER PRIMARY KEY AUTOINCREMENT,\n\t    User1Id INTEGER NOT NULL,\n\t    User2Id INTEGER NOT NULL,\n\t    Relationship INTEGER NOT NULL CHECK (Relationship IN (0, 1)),\n\t    FOREIGN KEY (User1Id) REFERENCES Users(Id),\n\t    FOREIGN KEY (User2Id) REFERENCES Users(Id)\n\t);\n", function (err) {
    if (err)
        console.error(global_ts_1.red, 'Error creating table Relationships', err);
    else
        console.log(global_ts_1.green, 'Table Relationships ready');
});
