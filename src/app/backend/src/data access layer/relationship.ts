import { server } from '../server.ts'
import { db } from "./database.ts";
import { red, yellow } from "../global.ts";

export class Relationship {
	Id: number;
	User1Id: number;
	User2Id: number;
	Relationship: -1 | 0 | 1;

	constructor(Id?: number, User1Id?: number, User2Id?: number, Relationship?: 0 | 1) {
		this.Id = Id ?? -1;
		this.User1Id = User1Id ?? -1;
		this.User2Id = User2Id ?? -1;
		this.Relationship = Relationship ?? -1;
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
}

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

import { User } from "./user.ts"

export function relationshipRoutes()
{
	server.post("/relationships", { preHandler: (server as any).byItsOwnUser, schema: relationshipAddSchema }, async (request, reply) => {
		const relationship: Relationship = Object.assign(new Relationship(), request.body);

		if (relationship.User1Id === relationship.User2Id) {
			console.debug(yellow, "User cannot have a relationship with themselves");
			reply.status(400).send();
			return ;
		}

		// Check if the 2nd user exists
		const user2 = await User.getById(relationship.User2Id);
		if (!user2) {
			console.debug(yellow, "User2 does not exist");
			reply.status(400).send();
			return ;
		}

		const user1Friends = await User.getFriends(relationship.User1Id);
		if (user1Friends && relationship.Relationship == 1)
		{
			for (const friend of user1Friends) {
				if (friend.Id === relationship.User2Id) {
					console.debug(yellow, "Already a friend");
					reply.status(400).send();
					return ;
				}
			}
		}

		await relationship.add();
		if (relationship.Id == -1) {
			reply.status(400).send();
		} else {
			reply.send();
		}
	});
}
