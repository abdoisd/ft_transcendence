
import { get } from "./request.ts"
import { UserDTO } from "../business layer/user.ts"
import { Relationship } from "../business layer/relationship.ts";

export function friendsView()
{
	document.getElementById("main-views")!.innerHTML = friendsViewStaticPart;
}

const friendsViewStaticPart: string = `
<p>Friends View:</p>
<a href="/addFriend" onclick="route()">Add Friend</a>
<br>
<a href="/listFriends" onclick="route()">List Friends</a>
`;

/**
 * go to another view: <a href="#/another-view">Another view</a>
 */

// SUB VIEWS

// ADD FRIEND VIEW

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
	// display user mini profile / user not found

	const resultDiv = document.getElementById("result")!;

	//?
	const jwt = localStorage.getItem("jwt");
	console.debug("setting jwt to request: ", jwt);
	
	// get
	foundUser = await UserDTO.getByUsername((document.getElementById("txtUsername") as HTMLInputElement).value);
	// foundUser = await get("/data/user/getByUsername", { username: (document.getElementById("txtUsername") as HTMLInputElement).value }, jwt)
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

// LIST FRIENDS VIEW

export async function listFriendsView()
{
	document.getElementById("main-views")!.innerHTML = listFriendsViewStaticPart;

	// code to fill list
	const list = document.getElementById("lstFriends");
	const template = document.getElementById("user-template");

	// relationships
		// get all relationships per user
	// user
		// get all friends
	
	// frontend
	const users = await clsGlobal.LoggedInUser.getFriends();
	if (users.length == 0)
	{
		list!.innerHTML = "No friends yet";
		return;
	}
	users.forEach((user) => {
		const newListItem = template.content.cloneNode(true); // clone template automatically
		newListItem.querySelector(".user-id").textContent = user.Id;
		newListItem.querySelector(".username").textContent = user.Username;

		var online = true;
		if ((new Date().getTime() - user.LastActivity) >= 1000 * 60 * 2)
			online = false;
		newListItem.querySelector(".online-status").textContent = online ? "online" : "offline";
		
		list.appendChild(newListItem);
	});
}

const listFriendsViewStaticPart: string = `
<template id="user-template">
<li>
	id: <span class="user-id"></span>
	username: <span class="username"></span>
	online: <span class="online-status">unknown</span>
	<!-- <button>Add as Friend</button> -->
</li>
</template>
<p>list:</p>
<ul id="lstFriends">
</ul>
`;
