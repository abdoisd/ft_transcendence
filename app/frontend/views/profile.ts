import { User } from "../Business Layer/user.ts";

export function ProfileView()
{
	document.getElementById("main-views")!.innerHTML = profileViewStaticPart;

	// set user info here
		// username
		// avatar
		// wins
		// loses

	// get user from global
	const user: User = clsGlobal.LoggedInUser!;
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
Username: <span id="Username"></span><br>
Avatar: <img id="Avatar" src="" style="width: 100px; height: auto;" alt="avatar"><br>
Wins: <span id="Wins"></span><br>
Losses: <span id="Losses"></span>
<br>
<a href="/profileEdit" onclick="route()">Edit</a>
<br>
<p>Match history:</p>
`;
