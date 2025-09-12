import { UserDTO } from "../business layer/user.ts";

export function ProfileView()
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
`;
