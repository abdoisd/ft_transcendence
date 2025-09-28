import sqlite3 from "sqlite3";
import { green, red } from "../global.ts";

export const db = new sqlite3.Database('ft_transcendence', (err) =>
{
	if (err)
		console.error(red, 'Error: creating the database:', err);
	else
		console.log(green, 'Database opened');
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
