// minimal fastify server
import Fastify from 'fastify';

const server = Fastify();

// data access
class User
{
	Id;
	GoogleId;
	Username;
	AvatarPath;
	Wins;
	Losses;
	SessionId;
	ExpirationDate;
	LastActivity;

	// data access
	static getById(Id)
	{
		// db logic
		const fullUser = {
			Id: 1,
			GoogleId: "GoogleId",
			Username: 'testuser',
			AvatarPath: '/avatars/testuser.png',
			Wins: 10,
			Losses: 5,
			SessionId: -1,
			ExpirationDate: new Date(),
			LastActivity: new Date()
		}
		return fullUser;
	}

	update()
	{
		// db logic
		console.log("Setting in db: ", this);
	}
}

// DTO for communication with client
class UserDTO
{
	Id;
	Username;
	AvatarPath;
	Wins;
	Losses;
	LastActivity;

	constructor(
		user
	) {
		this.Id = user.Id;
		this.Username = user.Username;
		this.AvatarPath = user.AvatarPath;
		this.Wins = user.Wins;
		this.Losses = user.Losses;
		this.LastActivity = user.LastActivity;
	}

	// uses full user object to create a DTO's
	static getById(Id)
	{
		const user = User.getById(Id);
		return new UserDTO(user);;
	}
}

// routes
server.get('/users/:id', async (request, reply) => {
	const userId = request.params.id;
	reply.send(UserDTO.getById(userId));
});
server.put('/users', async (request, reply) => {
	const userObj = request.body;

	const userId = userObj.Id;
	const user = Object.assign(new User(), User.getById(userId));

	// assign new values
	// Object.assign(user, userObj); // assigns everything
	user.Username = userObj.Username;
	// user.AvatarPath = userObj.AvatarPath;
	// user.Wins = userObj.Wins;
	// user.Losses = userObj.Losses;
	
	user.update();
	reply.send();
});

try {
	await server.listen({ host: "0.0.0.0", port: 9000 });
}
catch (err)
{
	server.log.error(err);
	process.exit(1);
}


// client post dto, server must have full object to update db

