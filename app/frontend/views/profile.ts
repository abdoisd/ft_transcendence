import { UserDTO } from "../business layer/user.ts";

export async function ProfileView()
{
	document.getElementById("main-views")!.innerHTML = profileViewStaticPart;

	// set user info here
		// username
		// avatar
		// wins
		// loses

	// get user from global
	const user: UserDTO = clsGlobal.LoggedInUser!;
	if (user)
	{
		document.getElementById("Username")!.textContent = user.Username;
		document.getElementById("Avatar")!.src = "/data/user/getAvatarById?Id=" + user.Id + "&_=" + new Date().getTime(); // make requests not the same
		// so we must make serving avatars alone
		document.getElementById("Wins")!.textContent = user.Wins.toString();
		document.getElementById("Losses")!.textContent = user.Losses.toString();

		// select by html element/tag
		// const container = document.querySelector("div")!;
		// select by class
		const container = document.querySelector(".match-history")!;

		// match history
		const matches = await user.getMatchHistory();
		matches.forEach(async (match) => {

			const recordDiv = document.createElement("div");

			const user1 = await UserDTO.getById(match.User1Id);
			const user2 = await UserDTO.getById(match.User2Id);

			const winnerUsername = match.WinnerId === user1?.Id ? user1?.Username : user2?.Username;
			
			// recordDiv.textContent = `${user1?.Username} vs ${user2?.Username} → ${winnerUsername}`;
			recordDiv.textContent = `${clsGlobal.LoggedInUser.Username} vs ${clsGlobal.LoggedInUser.Username == user1.Username ? user2.Username: user1.Username } → ${winnerUsername}`;

			container.appendChild(recordDiv);
		});
	}
	else
		console.debug("No logged in user found!");
}

const profileViewStaticPart = `
<div><span id="Username" style="margin-right: 10px;"></span><a href="/profileEdit" onclick="route()">Edit</a></div>
<img id="Avatar" src="" style="width: 100px; height: auto;" alt="avatar">
<div>Wins: <span id="Wins"></span></div>
<div>Losses: <span id="Losses"></span></div>
<p>Match history:</p>
<div class="match-history">
</div>
`;
