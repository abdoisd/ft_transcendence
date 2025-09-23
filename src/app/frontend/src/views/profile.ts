import { UserDTO } from "../business layer/user.ts";

export async function ProfileView()
{
	document.getElementById("main-views")!.innerHTML = profileViewStaticPart;

	const loggedInUser: UserDTO = clsGlobal.LoggedInUser!;
	if (loggedInUser)
	{
		document.getElementById("Username")!.textContent = loggedInUser.Username;
		document.getElementById("Avatar")!.src = "/data/user/getAvatarById?Id=" + loggedInUser.Id + "&_=" + new Date().getTime(); // make requests not the same
		document.getElementById("Wins")!.textContent = loggedInUser.Wins.toString();
		document.getElementById("Losses")!.textContent = loggedInUser.Losses.toString();

		// select by html tag
		// const container = document.querySelector("div")!;
		// select by class
		const container = document.querySelector(".match-history")!;

		/**
		 * if ai, in db:
		 * User2Id = null
		 * WinnerId = null (if ai wins) or User1Id (if user wins)
		 */

		const matches = await loggedInUser.getMatchHistory();

		if (!matches)
		{
			container.textContent = "Error while fetching match history.";
			container.style.color = "red";
			return;
		}

		if (matches.length == 0)
		{
			container.textContent = "No matches played yet.";
			container.style.color = "green";
			return;
		}
		
		matches.forEach(async (match) => {

			const recordDiv = document.createElement("div");

			if (match.User2Id == null)
			{
				recordDiv.textContent = `${match.Date}: ${clsGlobal.LoggedInUser.Username} vs AI → ${(match.WinnerId == null? "AI" : clsGlobal.LoggedInUser.Username)}`;
			}
			else
			{
				const user1 = await UserDTO.getById(match.User1Id);
				const user2 = await UserDTO.getById(match.User2Id);

				if (!user1 || !user2)
					return;
	
				const winnerUsername = match.WinnerId === user1?.Id ? user1?.Username : user2?.Username;
				
				recordDiv.textContent = `${match.Date}: ${clsGlobal.LoggedInUser.Username} vs ${clsGlobal.LoggedInUser.Username == user1.Username ? user2.Username: user1.Username } → ${winnerUsername}`;
			}

			container.appendChild(recordDiv);
		});
	}
	else
		console.debug("No logged in user found!");
}

const profileViewStaticPart = `
<div><span id="Username" style="margin-right: 10px;"></span><a class="anchor-general" href="/profileEdit" onclick="route()">Edit</a></div>
<img id="Avatar" src="" style="width: 100px; height: auto;" alt="avatar">
<div>Wins: <span id="Wins"></span></div>
<div>Losses: <span id="Losses"></span></div>
<p>Match history:</p>
<div class="match-history">
</div>
`;
