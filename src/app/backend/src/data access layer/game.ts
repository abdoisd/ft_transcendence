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

import { db } from "./database.ts";
import { green, red, yellow } from "../global.ts";
import { server } from "../server.ts";

// db stuff
db.run(`
	CREATE TABLE IF NOT EXISTS Games (
		Id INTEGER PRIMARY KEY AUTOINCREMENT,
		User1Id INTEGER NOT NULL,
		User2Id INTEGER NULL, -- ai game
		Date TEXT NOT NULL DEFAULT NULL,
		WinnerId INTEGER NULL, -- ai wins
		TournamentId INTEGER NULL, -- game not in tournament

		FOREIGN KEY (User1Id) REFERENCES Users(Id),
		FOREIGN KEY (User2Id) REFERENCES Users(Id)
	);
`, (err) => {
	if (err)
		console.error(red, 'Error creating table Games', err);
	else
		console.log(green, 'Table Games ready');
});

// between server and db
export class clsGame {
	Id;
	User1Id;
	User2Id;
	Date: Date;
	WinnerId;
	TournamentId; // if games in tournaments are saved

	constructor(obj)
	{
		Object.assign(this, obj);
	}

	// get by id
	static getById(Id)
	{

		console.log(green, 'Game.getById');
		console.debug(yellow, 'Id: ', Id);

		return new Promise((resolve, reject) => {
			const query = `
				SELECT * FROM Games WHERE Id = ?
			`;
			db.get(query, [Id], (err, row) => {
				if (err)
				{
					console.error(red, 'Error: Game.get: ', err);
					// reject(err);
				}
				else
				{
					if (row)
					{
						const game = new clsGame(row);
						resolve(game);
					}
					else
					{
						resolve(null);
					}
				}
			});
		});	
	}

	static getByUserId(Id): Promise<clsGame[] | null>
	{
		console.log(green, 'Game.getByUserId');
		console.debug(yellow, 'UserId: ', Id);

		return new Promise((resolve, reject) => {
			const query = `
				SELECT * FROM Games WHERE User1Id = ? OR User2Id = ?
				ORDER BY Date DESC
			`;
			db.all(query, [Id, Id], (err, rows) => {
				if (err)
				{
					console.error(red, 'Error: Game.getByUserId: ', err);
					reject(null);
				}
				else
				{
					// make them class instances
					const games = rows.map(row => {
						const game = new clsGame(row);
						return game;
					});
					resolve(games); // return array of games
					// resolve(rows);
				}
			});
		});	
	}

	// users must get games history
	// no sensitive data in this class
	// we add game after it finishes
	add()
	{
		console.log(green, 'Game.add');
		// console.debug(yellow, 'Adding: ', this); // COMMENTED THIS 
		
		return new Promise((resolve, reject) => {
			const query = `
				INSERT INTO Games (User1Id, User2Id, Date, WinnerId, TournamentId)
				VALUES (?, ?, ?, ?, ?)
			`;
			db.run(query, [this.User1Id, this.User2Id, this.Date, this.WinnerId, this.TournamentId], function (err) {
				if (err) // to test this
				{
					console.error(red, 'Error: Game.add: ', err);
					// reject(err); // throw err;
				}
				else
				{
					resolve(this.lastID); // return the id of the inserted game
				}
			});
		});
	}

	static getLastId(): Promise<number>
	{
		console.log(green, 'Game.getLastId');
		
		const query = "SELECT MAX(Id) FROM Games";
		return new Promise((resolve, reject) => {
			db.get(query, (err, row) => {
				if (err)
				{
					console.error(red, 'Error: Game.getLastId: ', err);
				}
				else
				{
					resolve((row as any).LastId);
					// if no rows
				}
			});
		});
	}
}

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
