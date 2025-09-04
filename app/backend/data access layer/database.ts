import sqlite3 from "sqlite3";
import { green, red } from "../global.ts";
import { connectedToSqlite } from "../server.ts"; // import variable

// create/connect to database AND create tables

export const db = new sqlite3.Database('ft_transcendence', (err) => //!
{
	if (err)
		console.error(red, 'Error when creating the database', err);
	else
	{
		connectedToSqlite.set(1);
		console.log(green, 'Database opened');
	}
});

db.run(`
	CREATE TABLE IF NOT EXISTS Users (
	    Id INTEGER PRIMARY KEY AUTOINCREMENT,
	    GoogleId TEXT NOT NULL,
	    Username TEXT NULL DEFAULT NULL,
	    AvatarPath TEXT NULL DEFAULT NULL,
	    Wins INTEGER NOT NULL DEFAULT 0,
	    Losses INTEGER NOT NULL DEFAULT 0,
	    SessionId TEXT NULL DEFAULT NULL,
	    ExpirationDate TEXT NULL DEFAULT NULL
	);
`, (err) => {
	if (err)
		console.error(red, 'Error creating table Users', err);
	else
		console.log(green, 'Table Users ready');
});

db.run(`
	CREATE TABLE IF NOT EXISTS Relationships (
	    Id INTEGER PRIMARY KEY AUTOINCREMENT,
	    User1Id INTEGER NOT NULL,
	    User2Id INTEGER NOT NULL,
	    Relationship INTEGER NOT NULL CHECK (Relationship IN (0, 1)),
	    FOREIGN KEY (User1Id) REFERENCES Users(Id),
	    FOREIGN KEY (User2Id) REFERENCES Users(Id)
	);
`, (err) => {
	if (err)
		console.error(red, 'Error creating table Relationships', err);
	else
		console.log(green, 'Table Relationships ready');
});
