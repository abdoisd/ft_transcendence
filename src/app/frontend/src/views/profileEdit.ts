import { UserDTO } from "../business layer/user.ts";
import { route } from "../frontend.ts";
import { post } from "./request.ts"

export function ProfileEditView()
{
	document.getElementById("main-views")!.innerHTML = profileEditViewStaticPart;
}

// function EditUser(event: Event)
// {
// 	// curr logged in user

// 	// edit
// 		// username: with checking
// 		// avatar

// 	event.preventDefault();

// 	// get username + avatar
// 	const usernameElement = document.getElementById("username") as HTMLInputElement;
// 	const username = usernameElement.value;
// 	const errorSpan = document.getElementById('username-error');

// 	// check username
// 	if (username && username != "")
// 	{
// 		// updating with username
		
// 		fetch("/data/user/getByUsername?username=" + username, {
// 			headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` }
// 		})
// 		.then(response => {
// 			if (response.ok) // user found
// 			{
// 				console.debug("Username taken");
				
// 				errorSpan!.textContent = 'Username is already taken!';
// 				errorSpan!.style.display = 'inline';
// 				return ;
// 			}
// 			else
// 			{
// 				console.debug("Username not taken");
// 				errorSpan!.textContent = '';
	
// 				const avatarElement = document.getElementById("avatar") as HTMLInputElement;
				
// 				// form data obj
// 				const formData = new FormData();
	
// 				// append avatar if any
// 				if (avatarElement.files && avatarElement.files.length > 0)
// 				{
// 					console.debug("Avatar file selected");
// 					formData.append("avatar", avatarElement.files[0]!);
// 				}
	
// 				// append username + id
// 				formData.append("username", username);
// 				formData.append("Id", globalThis.clsGlobal.LoggedInUser.Id.toString());
	
// 				// ask server to update profile
// 				fetch("/uploadProfile", {
// 					method: "POST",
// 					body: formData,
// 					headers: {
// 						Authorization: `Bearer ${localStorage.getItem("jwt")}`
// 					}
// 				})
// 				.then(async response => {
// 					if (response.ok)
// 					{
// 						// update global logged in user info
// 						const user: UserDTO = await UserDTO.getById(Number(globalThis.clsGlobal.LoggedInUser.Id));
// 						globalThis.clsGlobal.LoggedInUser = user;
	
// 						route(null, "/profile");
// 					}
// 					else
// 						document.write("Error uploading profile. Please try again.");
// 				})
// 				.catch(error => {
// 					console.error("Upload error:", error);
// 				});
// 			}
// 		});
// 	}
// 	else // no username
// 	{
// 		// update only avatar
// 		console.debug("update only avatar");
		
// 		const avatarElement = document.getElementById("avatar") as HTMLInputElement;
// 		if (avatarElement.files && avatarElement.files.length > 0)
// 		{
// 			// form data obj
// 			const formData = new FormData();

// 			console.debug("Here 1")

// 			// append avatar
// 			formData.append("avatar", avatarElement.files[0]!);

// 			console.debug("Here 2")

// 			// append id
// 			formData.append("Id", globalThis.clsGlobal.LoggedInUser.Id.toString());

// 			// ask server to update profile
// 			fetch("/uploadProfile", {
// 				method: "POST",
// 				body: formData,
// 				headers: {
// 					Authorization: `Bearer ${localStorage.getItem("jwt")}`
// 				}
// 			})
// 			.then(async response => {
// 				if (response.ok)
// 				{
// 					// update global logged in user info
// 					const user: UserDTO = await UserDTO.getById(Number(globalThis.clsGlobal.LoggedInUser.Id));
// 					globalThis.clsGlobal.LoggedInUser = user;

// 					route(null, "/profile"); // calling route just bc of history
// 				}
// 				else
// 					document.write("Error uploading profile. Please try again.");
// 			})
// 			.catch(error => {
// 				console.error("Upload error:", error);
// 			});
// 		}
// 		else // nothing to update
// 		{
// 			alert("Nothing to update");
// 			return ;
// 		}
// 	}


// }

// update profile: username and avatar with multipart/form-data
async function EditUser(event: Event)
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
	const avatarElement = document.getElementById("avatar") as HTMLInputElement;

	// // check username
	// if (username && username != "")
	// {
	// 	// updating with username
		
	// 	fetch("/data/user/getByUsername?username=" + username, {
	// 		headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` }
	// 	})
	// 	.then(response => {
	// 		if (response.ok) // user found
	// 		{
	// 			console.debug("Username taken");
				
	// 			errorSpan!.textContent = 'Username is already taken!';
	// 			errorSpan!.style.display = 'inline';
	// 			return ;
	// 		}
	// 		else
	// 		{
	// 			console.debug("Username not taken");
	// 			errorSpan!.textContent = '';
	
	// 			const avatarElement = document.getElementById("avatar") as HTMLInputElement;
				
	// 			// form data obj
	// 			const formData = new FormData();
	
	// 			// append avatar if any
	// 			if (avatarElement.files && avatarElement.files.length > 0)
	// 			{
	// 				console.debug("Avatar file selected");
	// 				formData.append("avatar", avatarElement.files[0]!);
	// 			}
	
	// 			// append username + id
	// 			formData.append("username", username);
	// 			formData.append("Id", globalThis.clsGlobal.LoggedInUser.Id.toString());
	
	// 			// ask server to update profile
	// 			fetch("/uploadProfile", {
	// 				method: "POST",
	// 				body: formData,
	// 				headers: {
	// 					Authorization: `Bearer ${localStorage.getItem("jwt")}`
	// 				}
	// 			})
	// 			.then(async response => {
	// 				if (response.ok)
	// 				{
	// 					// update global logged in user info
	// 					const user: UserDTO = await UserDTO.getById(Number(globalThis.clsGlobal.LoggedInUser.Id));
	// 					globalThis.clsGlobal.LoggedInUser = user;
	
	// 					route(null, "/profile");
	// 				}
	// 				else
	// 					document.write("Error uploading profile. Please try again.");
	// 			})
	// 			.catch(error => {
	// 				console.error("Upload error:", error);
	// 			});
	// 		}
	// 	});
	// }
	// else // no username
	// {
	// 	// update only avatar
	// 	console.debug("update only avatar");
		
	// 	const avatarElement = document.getElementById("avatar") as HTMLInputElement;
	// 	if (avatarElement.files && avatarElement.files.length > 0)
	// 	{
	// 		// form data obj
	// 		const formData = new FormData();

	// 		console.debug("Here 1")

	// 		// append avatar
	// 		formData.append("avatar", avatarElement.files[0]!);

	// 		console.debug("Here 2")

	// 		// append id
	// 		formData.append("Id", globalThis.clsGlobal.LoggedInUser.Id.toString());

	// 		// ask server to update profile
	// 		fetch("/uploadProfile", {
	// 			method: "POST",
	// 			body: formData,
	// 			headers: {
	// 				Authorization: `Bearer ${localStorage.getItem("jwt")}`
	// 			}
	// 		})
	// 		.then(async response => {
	// 			if (response.ok)
	// 			{
	// 				// update global logged in user info
	// 				const user: UserDTO = await UserDTO.getById(Number(globalThis.clsGlobal.LoggedInUser.Id));
	// 				globalThis.clsGlobal.LoggedInUser = user;

	// 				route(null, "/profile"); // calling route just bc of history
	// 			}
	// 			else
	// 				document.write("Error uploading profile. Please try again.");
	// 		})
	// 		.catch(error => {
	// 			console.error("Upload error:", error);
	// 		});
	// 	}
	// 	else // nothing to update
	// 	{
	// 		alert("Nothing to update");
	// 		return ;
	// 	}
	// }

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
			// update global logged in user info
			const user: UserDTO = await UserDTO.getById(Number(globalThis.clsGlobal.LoggedInUser.Id));
			globalThis.clsGlobal.LoggedInUser = user;

			route(null, "/profile");
		}
		else
			// document.write("Error uploading profile. Please try again.");
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
