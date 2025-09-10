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

	static get(Id)
	{
		fetch("http://localhost:9000/users/" + Id)
		.then(response => response.json()) // binary to memory json object
		.then(data => {
			console.log(data);
		})
	}

	update()
	{
		fetch("http://localhost:9000/users", {
			method: "PUT",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(this)
		})
		// .then(response => response.json()) // binary to memory json object
		// .then(response => {
		// 	console.log(response);
		// })
	}
}

UserDTO.get(21);

const user = new UserDTO(
	21,
	"clientuser",
	"/avatars/clientuser.png",
	15,
	7,
	new Date()
);
user.update();
