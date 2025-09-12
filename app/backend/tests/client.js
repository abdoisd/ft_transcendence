
async function get(path: string, params = {})
{
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${path}?${queryString}` : path;
    return fetch(url)
	.then((response) => {
		if (response.ok)
			return response.json();
		else
			return null;
	});
}

class UserDTO
{
	Id;
	Username;
	AvatarPath;
	Wins;
	Losses;
	LastActivity;

	constructor(
		Id,
		Username,
		AvatarPath,
		Wins,
		Losses,
		LastActivity
	) {
		this.Id = Id;
		this.Username = Username;
		this.AvatarPath = AvatarPath;
		this.Wins = Wins;
		this.Losses = Losses;
		this.LastActivity = LastActivity;
	}

	// return user
	static async get(Id)
	{
		// await here is useless
		return fetch("http://localhost:9000/users/" + Id)
		.then(response => response.json()) // binary to memory json object
		.then(data => {
			const user = Object.assign(new UserDTO(), data);
			return user;
		})
	}

	// update()
	// {
	// 	fetch("http://localhost:9000/users", {
	// 		method: "PUT",
	// 		headers: {
	// 			"Content-Type": "application/json"
	// 		},
	// 		body: JSON.stringify(this)
	// 	})
	// 	// .then(response => response.json()) // binary to memory json object
	// 	// .then(response => {
	// 	// 	console.log(response);
	// 	// })
	// }
}

const user = await UserDTO.get(21);
console.log(user);

// const user = new UserDTO(
// 	21,
// 	"clientuser",
// 	"/avatars/clientuser.png",
// 	15,
// 	7,
// 	new Date()
// );
// user.update();
