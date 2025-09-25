

export async function listFriendsView()
{
	document.getElementById("main-views")!.innerHTML = listFriendsViewStaticPart;

	const list = document.getElementById("lstFriends");
	const template = document.getElementById("user-template");

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
