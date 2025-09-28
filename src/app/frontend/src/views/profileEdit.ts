import { UserDTO } from "../business layer/user.ts";
import { route } from "../frontend.ts";

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
	<div class="card center">
		<h2 class="headline mv-5">Update Your Profile</h2>
		<form id="edit-profile-form" onsubmit="EditUser(event)">

			<div class="mb-3">
				<label class="text-secondary">Username</label>
				<div class="input flex">
					<input class="flex-1" type="text" id="username" name="username">
				</div>
				
				<span id="username-error" style="color: red; display: none;"></span>
			</div>



			<div class="mb-3">
				<label class="text-secondary">Avatar</label>
				<div class="input">
					<input type="file" id="avatar" name="avatar" accept="image/*" class="file">
				</div>
			</div>

			<button type="submit" class="btn btn-primary mt-6 w-full gap-small mb-3">
				<svg xmlns="http://www.w3.org/2000/svg" fill="white" width="24px" height="24px" viewBox="0 0 24 24"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>
				Save
			</button>
		</form>
	</div>
`;
