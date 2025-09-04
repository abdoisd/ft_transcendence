// data access
// class
// add, update, delete from Relationships table

import { server } from '../server.ts'
import { db } from "./database.ts";

export class Relationship {
	Id: number;
	User1Id: number;
	User2Id: number;
	Relationship: number;

	// constr and default one
	constructor(Id?: number, User1Id?: number, User2Id?: number, Relationship?: number) {
		this.Id = Id ?? -1;
		this.User1Id = User1Id ?? -1;
		this.User2Id = User2Id ?? -1;
		this.Relationship = Relationship ?? -1;
	}

	// old
	// return db.all('SELECT * FROM Relationships', (err, rows) => {
	// 	if (err)
		// 		return null;
	// 	return rows;
	// });

	// db.all runs asynchronously, in the background, we define callback to handle it
	// here we use promise to use async/await with it
	static getAll(): Promise<any[] | null> // return rows or null
	{
		return new Promise((resolve, reject) => {
			db.all('SELECT * FROM Relationships', (err, rows) => {
				if (err)
					reject(null); // returning
				else
					resolve(rows);
			});
		});
	}

	static getById(Id: number): Promise<any | null> {
		return new Promise((resolve, reject) => {
		  db.get('SELECT * FROM Relationships WHERE Id = ?', [Id], (err, row) => {
			if (err) reject(null);
			else resolve(row || null);
		  });
		});
	}

	async add() {
		const result: number = await new Promise((resolve, reject) => {
			db.run(
				'INSERT INTO Relationships (User1Id, User2Id, Relationship) VALUES (?, ?, ?)',
				[this.User1Id, this.User2Id, this.Relationship],
				function (err) {
					if (err) reject(-1);
					else resolve(this.lastID);
				}
			);
		});
		this.Id = result;
	}

	update(): Promise<boolean> {
		return new Promise((resolve, reject) => {
			db.run(
				'UPDATE Relationships SET User1Id = ?, User2Id = ?, Relationship = ? WHERE Id = ?',
				[this.User1Id, this.User2Id, this.Relationship, this.Id],
				function (err) {
					if (err) reject(false);
					else resolve(this.changes > 0);
				}
			);
		});
	}
	
	// for using in the server
	delete(): Promise<boolean> {
		return new Promise((resolve, reject) => {
			db.run('DELETE FROM Relationships WHERE Id = ?', [this.Id], function (err) {
				if (err) reject(false);
				else resolve(this.changes > 0);
			});
		});
	}
	
	static deleteById(Id: number): Promise<boolean> {
		return new Promise((resolve, reject) => {
			db.run('DELETE FROM Relationships WHERE Id = ?', [Id], function (err) {
				if (err) reject(false);
				else resolve(this.changes > 0);
			});
		});
	}

	//

	// // get friends per user
	// static getFriendsPerUserId(Id: number): Promise<any[] | null> // return rows or null
	// {
	// 	return new Promise((resolve, reject) => {
	// 		db.all('select * from relationships where (User1Id = ? or User2Id = ?) and Relationship = 1;', [Id], (err, rows) => {
	// 			if (err)
	// 				reject(null); // returning
	// 			else
	// 				resolve(rows);
	// 		});
	// 	});
	// }

}
// THIS IS SQLITE

// routes
// THIS IS FASTIFY
export function relationshipRoutes()
{
	server.get("/data/relationship/getAll", async (request, reply) => {
		const res = await Relationship.getAll(); // fastify will await
		if (res == null) {
			reply.status(500).send();
		} else {
			reply.send(res);
		}
	});
	
	// you get Relationship auto from this
	server.get("/data/relationship/getById", async (request, reply) => {
		const Id = Number((request.query as any).Id);
		const relationship = await Relationship.getById(Id);
		if (relationship == null) {
			reply.status(404).send();
		} else {
			reply.send(relationship);
		}
	});
	
	server.post("/data/relationship/add", async (request, reply) => {
		const relationship: Relationship = Object.assign(new Relationship(), request.body);
		await relationship.add();
		if (relationship.Id == -1) {
			reply.status(500).send();
		} else {
			reply.send();
		}
	});
	
	// put for replacing
	server.put("/data/relationship/update", async (request, reply) => {
		const relationship: Relationship = Object.assign(new Relationship(), request.body);
		const res = await relationship.update();
		if (res == false) {
			reply.status(500).send();
		} else {
			reply.send(res);
		}
	});

	server.delete("/data/relationship/delete", async (request, reply) => {
		const Id = Number((request.query as any).Id);
		const res = await Relationship.deleteById(Id);
		if (res == false) {
			reply.status(500).send();
		} else {
			reply.send(res);
		}
	});

	// // get friends per user
	// server.get("/data/relationship/getFriendsPerUserId", async (request, reply) => {
	// 	const Id = Number((request.query as any).Id);
	// 	const res = await Relationship.getFriendsPerUserId(Id); // fastify will await
	// 	if (res == null) {
	// 		reply.status(500).send();
	// 	} else {
	// 		reply.send(res);
	// 	}
	// });
}

// relationships
// client server exchange: Relationship objects
