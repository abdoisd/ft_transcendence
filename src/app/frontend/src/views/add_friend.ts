import { UserDTO } from "../business layer/user.ts"
import { Relationship } from "../business layer/relationship.ts";


export function addFriendView()
{
	document.getElementById("main-views")!.innerHTML = addFriendViewStaticPart;
	const input = document.getElementById("txtUsername") as HTMLInputElement;
	input.focus();
}

const addFriendViewStaticPart: string = `
<form onsubmit="searchUserButton(event);"> <!-- passing the event -->
	<label for="name">Find user by id:</label>
	<input type="text" id="txtUsername" placeholder="Username" required>
	<input type="submit" value="Search">
</form>
<div id="result"></div>
`;

function userMiniProfile(user: UserDTO)
{
	const btnAddFriend = "<button onclick='addFriend()'>add as friend</button>";
	const divContent = "user: id: " + user.Id + " username: " + user.Username + " " + btnAddFriend;
	return divContent;
}

var foundUser: UserDTO;

async function searchUserButton(event?: Event)
{
	event?.preventDefault();

	const resultDiv = document.getElementById("result")!;

	const jwt = localStorage.getItem("jwt");
	console.debug("setting jwt to request: ", jwt);
	
	foundUser = await UserDTO.getByUsername((document.getElementById("txtUsername") as HTMLInputElement).value);
	if (foundUser)
		resultDiv.innerHTML = userMiniProfile(foundUser);
	else
		resultDiv.innerHTML = "User not found";
}
window.searchUserButton = searchUserButton;

async function addFriend()
{
	if (clsGlobal.LoggedInUser.Id == foundUser.Id)
	{
		alert("You cannot add yourself as a friend");
		return;
	}

	const UsersFriends = await clsGlobal.LoggedInUser.getFriends();
	UsersFriends.forEach((userFriend) => {
		if (userFriend.Id == foundUser.Id)
		{
			alert("You are already friends with this user");
		}
	});
	
	const relationship: Relationship = new Relationship(-1, clsGlobal.LoggedInUser.Id, foundUser.Id, 1);
	const response = await relationship.add();
	if (response.ok)
		alert("Friend added");
	else
		alert("Error adding friend");
}
window.addFriend = addFriend;