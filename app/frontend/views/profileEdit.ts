import { User } from "../business layer/user.ts";
import { route } from "../frontend.ts";

export function ProfileEditView()
{
	document.getElementById("main-views")!.innerHTML = profileEditViewStaticPart;
}

function EditUser(event: Event)
{
	// curr logged in user

	// edit
		// username: with checking
		// avatar

	event.preventDefault();

	// get username + avatar
	const usernameElement = document.getElementById("username") as HTMLInputElement;
	const username = usernameElement.value;
	const errorSpan = document.getElementById('username-error');

	// check username
	if (username && username != "")
	{
		fetch("/data/user/getByUsername?username=" + username)
		.then(response => {
			if (response.ok) // user found
			{
				console.debug("Username taken");
				
				errorSpan!.textContent = 'Username is already taken!';
				errorSpan!.style.display = 'inline';
				return ;
			}
			else
			{
				console.debug("Username not taken");
				errorSpan!.textContent = '';
	
				const avatarElement = document.getElementById("avatar") as HTMLInputElement;
				
				// form data obj
				const formData = new FormData();
	
				// append avatar if any
				if (avatarElement.files && avatarElement.files.length > 0)
				{
					console.debug("Avatar file selected");
					formData.append("avatar", avatarElement.files[0]!);
				}
	
				// append username + id
				formData.append("username", username);
				formData.append("Id", globalThis.clsGlobal.LoggedInUser.Id.toString());
	
				// ask server to update profile
				fetch("http://localhost:3000/uploadProfile", {
					method: "POST",
					body: formData,
				})
				.then(async response => {
					if (response.ok)
					{
						// update global logged in user info
						const user: User = await User.getById(Number(globalThis.clsGlobal.LoggedInUser.Id));
						globalThis.clsGlobal.LoggedInUser = user;
	
						alert("Profile updated");
						// render profile
						route(null, "/profile");
					}
					else
						document.write("Error uploading profile. Please try again.");
				})
				.catch(error => {
					console.error("Upload error:", error);
				});
			}
		});
	}
	else // no username
	{
		// update only avatar
		console.debug("update only avatar");
		
		const avatarElement = document.getElementById("avatar") as HTMLInputElement;
		if (avatarElement.files && avatarElement.files.length > 0)
		{
			// form data obj
			const formData = new FormData();

			// append avatar
			formData.append("avatar", avatarElement.files[0]!);

			// append id
			formData.append("Id", globalThis.clsGlobal.LoggedInUser.Id.toString());

			// ask server to update profile
			fetch("http://localhost:3000/uploadProfile", {
				method: "POST",
				body: formData,
			})
			.then(async response => {
				if (response.ok)
				{
					// update global logged in user info
					const user: User = await User.getById(Number(globalThis.clsGlobal.LoggedInUser.Id));
					globalThis.clsGlobal.LoggedInUser = user;

					alert("Profile updated");
					route(null, "/profile");
				}
				else
					document.write("Error uploading profile. Please try again.");
			})
			.catch(error => {
				console.error("Upload error:", error);
			});
		}
		else // nothing to update
		{
			alert("Nothing to update");
			return ;
		}
	}


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
