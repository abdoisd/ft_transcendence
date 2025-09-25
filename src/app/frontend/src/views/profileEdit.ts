import { UserDTO } from "../business layer/user.ts";
import { route } from "../frontend.ts";
import { post } from "./request.ts"

export function ProfileEditView()
{
	document.getElementById("main-views")!.innerHTML = profileEditViewStaticPart;
}

async function EditUser(event: Event)
{
	event.preventDefault();

	const usernameElement = document.getElementById("username") as HTMLInputElement;
	const username = usernameElement.value;
	const errorSpan = document.getElementById('username-error');
	const avatarElement = document.getElementById("avatar") as HTMLInputElement;

	if ((!username || username == "") && (!avatarElement.files || avatarElement.files.length == 0))
	{
		alert("Nothing to update");
		return ;
	}

	if (username && username != "")
	{
		const user = await UserDTO.getByUsername(username);
		if (user)
		{
			errorSpan!.textContent = 'Username is already taken!';
			errorSpan!.style.display = 'inline';
			return ;
		}
	}

	const formData = new FormData();

	if (avatarElement.files && avatarElement.files.length > 0)
	{
		console.debug("Avatar file selected");
		formData.append("avatar", avatarElement.files[0]!);
	}

	if (username && username != "")
		formData.append("username", username);

	const jwt = localStorage.getItem('jwt');
	return fetch("/updateProfile/" + clsGlobal.LoggedInUser.Id.toString(), {
		method: 'PUT',
		headers: {
			'Authorization': 'Bearer ' + jwt
		},
		body: formData
	})
	.then(async response => {
		if (response.ok)
		{
			const user: UserDTO = await UserDTO.getById(Number(globalThis.clsGlobal.LoggedInUser.Id));
			globalThis.clsGlobal.LoggedInUser = user;

			route(null, "/profile");
		}
		else
			alert("Error uploading profile. Invalid input.");
	})

}
window.EditUser = EditUser;

const profileEditViewStaticPart = `
<form id="edit-profile-form" onsubmit="EditUser(event)">

  <label>
    Username:
    <input type="text" id="username" name="username">
  </label>
  <span id="username-error" style="color: red; display: none;"></span>
  <br>

  <label>
    Avatar: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    <input type="file" id="avatar" name="avatar" accept="image/*">
  </label>
  <br>

  <button type="submit">Save</button>
</form>
`;
