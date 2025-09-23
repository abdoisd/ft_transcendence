// data access
// class
// add, update, delete from Relationships table

import { server } from '../server.ts'
import { db } from "./database.ts";
import { red, yellow } from "../global.ts";

export class Relationship {
	Id: number;
	User1Id: number;
	User2Id: number;
	Relationship: -1 | 0 | 1;

	// constr and default one
	constructor(Id?: number, User1Id?: number, User2Id?: number, Relationship?: 0 | 1) {
		this.Id = Id ?? -1;
		this.User1Id = User1Id ?? -1;
		this.User2Id = User2Id ?? -1;
		this.Relationship = Relationship ?? -1;
	}

	static getAll(): Promise<any[] | null>
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
					if (err)
					{
						console.error(red, "Relationship.add", err);
						reject(-1);
					}
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
					if (err)
					{
						console.error(red, "Relationship.update", err);
						reject(false);
					}
					else
						resolve(this.changes > 0);
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

}
// THIS IS SQLITE

const relationshipAddSchema = {
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
export function relationshipRoutes()
{

	// ADD FRIEND, ONLY IF YOU ARE USER1
	server.post("/relationships", { preHandler: (server as any).byItsOwnUser, schema: relationshipAddSchema }, async (request, reply) => {
		const relationship: Relationship = Object.assign(new Relationship(), request.body);
		await relationship.add();
		if (relationship.Id == -1) {
			reply.status(500).send();
		} else {
			reply.send();
		}
	});

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
