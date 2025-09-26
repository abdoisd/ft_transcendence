import { UserDTO } from "../business layer/user.ts"
import { Relationship } from "../business layer/relationship.ts";


export function addFriendView()
{
	document.getElementById("main-views")!.innerHTML = addFriendViewStaticPart;
	const input = document.getElementById("txtUsername") as HTMLInputElement;
	input.focus();
}

const addFriendViewStaticPart: string = `
	<div class="card">
	<form onsubmit="searchUserButton(event);" class="mh-5 mt-3"> <!-- passing the event -->
		<label class="text-secondary">Find user by username</label>
		<div class="input">
			<input type="text" id="txtUsername" placeholder="Username" required>
		</div>
		<button type="submit" class="btn btn-primary mt-6 w-full gap-small mb-3">
		<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
			<path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
		</svg>
			Search
		</button>
	</form>
	<div id="result"></div>
	</div>
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