"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTables = void 0;
var global_ts_1 = require("../global.ts");
var database_ts_1 = require("./database.ts");
var createMessagesTable = function () {
    database_ts_1.db.run("\n\tCREATE TABLE IF NOT EXISTS messages (\n\t    id INTEGER PRIMARY KEY AUTOINCREMENT,\n        sender_id INTEGER NOT NULL,\n        receiver_id INTEGER NOT NULL,\n        content TEXT,\n        content_type TEXT NOT NULL,\n        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,\n        FOREIGN KEY (sender_id) REFERENCES Users(Id) ON DELETE CASCADE,\n        FOREIGN KEY (receiver_id) REFERENCES Users(Id) ON DELETE CASCADE\n\t);\n", function (err) {
        if (err)
            console.error(global_ts_1.red, 'Error creating table messages', err);
        else {
            console.log(global_ts_1.green, 'Table messages ready');
        }
    });
};
var createBlockedUsers = function () {
    database_ts_1.db.run("\n\tCREATE TABLE IF NOT EXISTS blocked_users (\n\t    id INTEGER PRIMARY KEY AUTOINCREMENT,\n        id1 INTEGER NOT NULL,\n        id2 INTEGER NOT NULL,\n        FOREIGN KEY (id1) REFERENCES Users(Id) ON DELETE CASCADE,\n        FOREIGN KEY (id2) REFERENCES Users(Id) ON DELETE CASCADE,\n        UNIQUE (id1, id2)\n\t);\n", function (err) {
        if (err)
            console.error(global_ts_1.red, 'Error creating table blocked_users', err);
        else {
            console.log(global_ts_1.green, 'Table blocked_users ready');
        }
    });
};
var createTables = function () {
    createMessagesTable();
    createBlockedUsers();
};
exports.createTables = createTables;
