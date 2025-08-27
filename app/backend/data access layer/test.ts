class User
{
	ID: number;
	GoogleOpenID: string;
	Username: string;
	AvatarPath: string;
	Wins: number;
	Losses: number;

	constructor(id: number, googleOpenID: string, username: string, avatarPath: string, wins: number, losses: number)
	{
		this.ID = id;
		this.GoogleOpenID = googleOpenID;
		this.Username = username;
		this.AvatarPath = avatarPath;
		this.Wins = wins;
		this.Losses = losses;
	}
}

const username = "Alice";

var Response = await fetch(`http://localhost:8080/data/user/getByUsername?username=${encodeURIComponent(username)}`);

if (!Response.ok)
	console.log("Error: ", Response.statusText);
else
{
	Response = await Response.json(); // to get request body as JSON
	const user: User = Object.assign(new User(-1, "", "", "", -1, -1), Response); // uses properties names to assign values
	console.log(user);
}
