import { UserDTO } from "../business layer/user.ts";
import { getQuery } from "../utils/utils.ts";

export async function ProfileView() {

	const id = getQuery("id");

	const user: UserDTO | null = !id ? clsGlobal.LoggedInUser : await UserDTO.getById(id);
	const mainView = document.getElementById("main-views")!;

	if (user) {
		const isMe = user.Id === clsGlobal.LoggedInUser?.Id;

		mainView.innerHTML = isMe ? meProfileViewStaticPart : profileViewStaticPart;

		document.getElementById("Username")!.textContent = user.Username;
		document.getElementById("Avatar")!.src = "/data/user/getAvatarById?Id=" + user.Id + "&_=" + new Date().getTime(); // make requests not the same
		document.getElementById("Wins")!.textContent = user.Wins.toString();
		document.getElementById("Losses")!.textContent = user.Losses.toString();

		// select by html tag
		// const container = document.querySelector("div")!;
		// select by class
		const container = document.querySelector(".match-history")!;

		/**
		 * if ai, in db:
		 * User2Id = null
		 * WinnerId = null (if ai wins) or User1Id (if user wins)
		 */

		const matches = await user.getMatchHistory();

		if (!matches) {
			container.textContent = "Error while fetching match history.";
			container.style.color = "red";
			return;
		}

		if (matches.length == 0) {
			container.textContent = "No matches played yet.";
			container.style.color = "green";
			return;
		}

		matches.forEach(async (match) => {

			const recordDiv = document.createElement("div");

			if (match.User2Id == null) {
				recordDiv.textContent = `${match.Date}: ${user.Username} vs AI → ${(match.WinnerId == null ? "AI" : user.Username)}`;
			}
			else {
				const user1 = await UserDTO.getById(match.User1Id);
				const user2 = await UserDTO.getById(match.User2Id);

				if (!user1 || !user2)
					return;

				const winnerUsername = match.WinnerId === user1?.Id ? user1?.Username : user2?.Username;

				recordDiv.textContent = `${match.Date}: ${user.Username} vs ${user.Username == user1.Username ? user2.Username : user1.Username} → ${winnerUsername}`;
			}

			container.appendChild(recordDiv);
		});
	}
	else {
		console.debug("No logged in user found!");
		mainView.innerHTML = '<h4>User not found</h4>'
	}
}

const profileViewStaticPart = `
<div><span id="Username" style="margin-right: 10px;"></span></div>
<img id="Avatar" src="" style="width: 100px; height: auto;" alt="avatar">
<div>Wins: <span id="Wins"></span></div>
<div>Losses: <span id="Losses"></span></div>
<p>Match history:</p>
<div class="match-history">
</div>
`;


const meProfileViewStaticPart = `
<div><span id="Username" style="margin-right: 10px;"></span><a class="anchor-general" href="/profileEdit" onclick="route()" id="edit">Edit</a></div>
<img id="Avatar" src="" style="width: 100px; height: auto;" alt="avatar">
<div>Wins: <span id="Wins"></span></div>
<div>Losses: <span id="Losses"></span></div>
<p>Match history:</p>
<div class="match-history">
</div>
`;
