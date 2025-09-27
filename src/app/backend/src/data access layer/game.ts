
import { db } from "./database.ts";
import { green, red, yellow } from "../global.ts";
import { server } from "../server.ts";

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

export class clsGame {
	Id;
	User1Id;
	User2Id;
	Date: Date;
	WinnerId;

	constructor(obj)
	{
		Object.assign(this, obj);
	}

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
					reject(err);
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
					const games = rows.map(row => {
						const game = new clsGame(row);
						return game;
					});
					resolve(games);
				}
			});
		});	
	}

	add()
	{
		console.log(green, 'Game.add');
		// console.debug(yellow, 'Adding: ', this);
		
		return new Promise((resolve, reject) => {
			const query = `
				INSERT INTO Games (User1Id, User2Id, Date, WinnerId, TournamentId)
				VALUES (?, ?, ?, ?, ?)
			`;
			db.run(query, [this.User1Id, this.User2Id, this.Date, this.WinnerId, this.TournamentId], function (err) {
				if (err)
				{
					console.error(red, 'Error: Game.add: ', err);
					reject(err);
				}
				else
				{
					resolve(this.lastID);
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
				}
			});
		});
	}
}
