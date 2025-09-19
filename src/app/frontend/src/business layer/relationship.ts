import { post } from "../views/request.ts";

export class Relationship {
	Id: number;
	User1Id: number;
	User2Id: number;
	Relationship: number;

	constructor(Id?: number, User1Id?: number, User2Id?: number, Relationship?: number) {
		this.Id = Id ?? -1;
		this.User1Id = User1Id ?? -1;
		this.User2Id = User2Id ?? -1;
		this.Relationship = Relationship ?? -1;
	}

	async add()
	{
		return post("/relationships", this);
	}
}
