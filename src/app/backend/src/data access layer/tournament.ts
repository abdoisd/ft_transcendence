import { db } from './database.ts';
import { green, red } from '../global.ts';

db.run(`
	CREATE TABLE IF NOT EXISTS Tournaments (
		Id INTEGER PRIMARY KEY AUTOINCREMENT
	);
`, (err) => {
	if (err)
		console.error(red, 'Error creating table Tournaments:', err);
	else
		console.log(green, 'Table Tournaments ready');
});

export class clsTournament
{
	static getLastId(): Promise<number>
	{
		return new Promise((resolve, reject) => {
			const query = `
				SELECT MAX(Id) as LastId FROM Tournaments
			`;
			db.get(query, [], (err, row) => {
				if (err)
				{
					console.error(red, 'Error: Tournament.getLastId: ', err);
				}
				else
				{
					if (row)
					{
						resolve((row as any).LastId);
					}
					else
					{
						resolve(0);
					}
				}
			});
		});
	}
}
