
// send requests to server with fetch that's it

export class User
{
	Id: number;
	GoogleId: string;
	Username: string | null;
	AvatarPath: string | null; // set it to null if there is no, so we have null in db
	Wins: number;
	Losses: number;
	SessionId: string | null;
	ExpirationDate: Date | null;
	LastActivity: Date | null;

	constructor(id: number, googleOpenID: string, username: string | null, avatarPath: string | null,
		wins: number, losses: number, sessionId: string | null = null, expirationDate: Date | null = null)
	{
		this.Id = id;
		this.GoogleId = googleOpenID;
		this.Username = username;
		this.AvatarPath = avatarPath;
		this.Wins = wins;
		this.Losses = losses;
		this.SessionId = sessionId;
		this.ExpirationDate = expirationDate;
	}
	
	static async getAllUsers()
	{
		const response = await fetch('data/user/getAll'); // the browser use the same curr domain and port
		if (!response.ok)
		{
			return [];
		}
		const usersArray = await response.json();
		const users: User[] = usersArray.map((userObject: any) => Object.assign(new User(-1, "", "", "", -1, -1), userObject));
		return users;
	}

	static async getById(Id: number)
	{
		const response = await fetch(`http://localhost:3000/data/user/getById?Id=${encodeURIComponent(Id)}`);
		if (!response.ok) return null;
		const userObject = await response.json();
		return Object.assign(new User(-1, "", "", "", -1, -1), userObject);
	}

	static async getByUsername(username: string)
	{
		const response = await fetch(`http://localhost:3000/data/user/getByUsername?username=${encodeURIComponent(username)}`);
		if (!response.ok) return null;
		const userObject = await response.json();
		return Object.assign(new User(-1, "", "", "", -1, -1), userObject);
	}

	async add(): Promise<boolean> {
        const response = await fetch(`http://localhost:3000/data/user/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(this),
        });
        if (!response.ok) return false;
        this.Id = (await response.json()).Id;
		return true;
    }

	async update(): Promise<boolean> {
		if (this.Id < 0)
			return false;
        const response = await fetch(`http://localhost:3000/data/user/update`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(this),
        });
        return response.ok;
    }

	async delete(): Promise<boolean> {
		if (this.Id < 0)
			return false;
        const response = await fetch(`http://localhost:3000/data/user/delete`, {
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
}

import { get } from "../views/request.ts";
