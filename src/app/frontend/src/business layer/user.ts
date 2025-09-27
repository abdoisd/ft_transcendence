
class clsGame {
	Id;
	User1Id;
	User2Id: number | null;
	Date: Date;
	WinnerId;
	TournamentId: number | null;
}

export class UserDTO
{
	Id: number;
	Username: string | null;
	AvatarPath: string | null;
	Wins: number;
	Losses: number;
	LastActivity: Date | null;

	constructor(id: number, username: string | null, avatarPath: string | null,
		wins: number, losses: number)
	{
		this.Id = id;
		this.Username = username;
		this.AvatarPath = avatarPath;
		this.Wins = wins;
		this.Losses = losses;
	}

	static async getAllUsers()
	{
		const response = await fetch('data/user/getAll');
		if (!response.ok)
		{
			return [];
		}
		const usersArray = await response.json();
		const users: UserDTO[] = usersArray.map((userObject: any) => Object.assign(new UserDTO(-1, "", "", "", -1, -1), userObject));
		return users;
	}

	static async getById(Id)
	{
		return get("/data/user/getById", { Id: Id });
	}

	static async getByUsername(username: string)
	{
		const tmp = username;
		
		return await get("/data/user/getByUsername", { username: tmp });
	}

	async update(): Promise<boolean> {
		if (this.Id < 0)
			return false;
        const response = await fetch(`/data/user/update`, {
            method: "PUT",
            headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${localStorage.getItem("jwt")}`
			},
            body: JSON.stringify(this),
        });
        return response.ok;
    }

	async delete(): Promise<boolean> {
		if (this.Id < 0)
			return false;
        const response = await fetch(`/data/user/delete`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Id: this.Id }),
        });
        return response.ok;
    }

	getFriends()
	{
		return get("data/user/getFriends", { Id: this.Id })
		.then((friendsArray) => {
			if (friendsArray)
				return friendsArray;
			return [];
		});
	}

	getMatchHistory(): Promise<clsGame[] | null>
	{
		return get("/users/" + this.Id + "/games");
	}
}

import { get } from "../views/request.ts";
