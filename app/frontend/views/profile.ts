import { User } from "../Business Layer/user.ts";

export function ProfileView()
{
	document.getElementById("main-views")!.innerHTML = profileViewStaticPart;

	User.getById(1).then((userObject) => {
		if (!userObject) return console.error("User not found!");
		console.log(userObject);
		const user: User = userObject;
		document.getElementById("Username")!.textContent = user.Username;
		document.getElementById("Avatar")!.src = "man.png";
		document.getElementById("Wins")!.textContent = user.Wins.toString();
		document.getElementById("Losses")!.textContent = user.Losses.toString();
	});

}

const profileViewStaticPart = `
Username: <span id="Username"></span><br>
Avatar: <img id="Avatar" src="" style="width: 100px; height: auto;" alt="avatar"><br>
Wins: <span id="Wins"></span><br>
Losses: <span id="Losses"></span>
<br>
<a href="/profileEdit" onclick="route()">Edit</a>
<br>
<a href="/profileMatchHistory" onclick="route()">Match History</a>
`;
