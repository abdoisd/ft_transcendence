import { UserDTO } from '../business layer/user.ts';
import { TwoFAView } from './2fa.ts';
import { HomeView } from './home.ts';
import { getOnlyFetch } from './request.ts';

export function LoginWithGoogle() {
	window.history.replaceState({}, '', '/login');
	document.getElementById("body")!.innerHTML = profileViewStaticPart;
}

function requestBackend() {
	window.location.pathname = '/loginGoogle';
}

export function NewUser() {

	const params = new URLSearchParams(window.location.search);
	
	const jwt = params.get('jwt');
	console.debug("setting jwt in localStorage: ", jwt);
	localStorage.setItem("jwt", jwt);
	console.debug("jwt in localStorage: ", localStorage.getItem("jwt"));

	getOnlyFetch("/data/user/getById", {Id: params.get("Id")})
	.then((response) => {
		if (!response.ok)
		{

			fetch("/validateSession", {
				method: "POST",
				credentials: "include", // to send cookies
			})
			.then(response => {
				if (!response.ok)
				{
					LoginWithGoogle();
					return ;
				}
				else
				{
					//!
					window.history.replaceState({}, '', '/');
					HomeView();
					return ;
				}
			})

		}
	});
	
	document.getElementById("body")!.innerHTML = usernameAvatarForm;
};

export async function existingUser() { // cookie is set automatically

	console.debug("existingUser()");

	const params = new URLSearchParams(window.location.search);

	if (!params.has('Id')) {
		LoginWithGoogle();
		return ;
    }

	const userId = Number(params.get('Id'));

	const response = await getOnlyFetch("/data/user/enabled2FA", { Id: userId });
	if (response.ok)
	{
		console.debug("User has 2FA enabled, showing 2FA form");
		clsGlobal.userId = userId;
		TwoFAView();
		return ;
	}
	else
		console.debug("User has NOT 2FA enabled, access grant");

	const jwt = params.get('jwt');
	console.debug("setting jwt in localStorage: ", jwt);
	localStorage.setItem("jwt", jwt);

	console.debug("Filling loggedInUser");
	globalThis.clsGlobal.LoggedInUser = new UserDTO(
        Number(params.get('Id')),
        params.get('GoogleId') || '',
        params.get('Username') || null,
        params.get('AvatarPath') || null,
        Number(params.get('Wins') || 0),
        Number(params.get('Losses') || 0),
        params.get('SessionId') || null,
        params.get('ExpirationDate') ? new Date(params.get('ExpirationDate')!) : null
    );

	//!
	window.history.replaceState({}, '', '/');
	HomeView();
}

async function usernameAvatarFormHandleSubmit(event: Event)
{
	event.preventDefault();
	
	console.debug("usernameAvatarFormHandleSubmit()");

	const usernameElement = document.getElementById("username") as HTMLInputElement;
	const avatarElement = document.getElementById("avatar") as HTMLInputElement;

	const user: UserDTO = await UserDTO.getByUsername(usernameElement.value);
	if (user)
	{
		console.debug("Username taken");

		const errorSpan = document.getElementById('username-error');
		errorSpan!.textContent = 'Username is already taken!';
		errorSpan!.style.display = 'inline';
		return ;
	}
	else
	{
		console.debug("Username not taken");
		
		const formData = new FormData();

		if (avatarElement.files && avatarElement.files.length > 0)
		{
			console.debug("Avatar file selected");
			formData.append("avatar", avatarElement.files[0]!);
		}

		const username = usernameElement.value;
		formData.append("username", username);

		const Id = new URLSearchParams(window.location.search).get("Id");
		formData.append("Id", Id!);

		//?
		fetch("/uploadProfile/" + Id, {
    	    method: "POST",
    	    body: formData, // body as object? not string
			headers: {
				Authorization: `Bearer ${localStorage.getItem("jwt")}`
			}
    	})
    	.then(async response => { // is then gonna wait for this
			if (response.ok)
			{

				console.debug("Filling loggedInUser");
				const user: UserDTO = await UserDTO.getById(Number(Id));
				globalThis.clsGlobal.LoggedInUser = user;

				window.history.replaceState({}, '', '/');
				HomeView();
			}
			else
				alert("Error uploading profile: Invalid input.");
		})
    	.catch(error => {
    	    console.error("Upload error:", error);
    	});
	}

}

window.requestBackend = requestBackend;
window.usernameAvatarFormHandleSubmit = usernameAvatarFormHandleSubmit;

const profileViewStaticPart = `
<div class="full-in-grid" style="display: flex; align-items: center; justify-content: center;">
	<button id="myButton" onclick="requestBackend()">Login With Google</button>
</div>
`;

const usernameAvatarForm = `
<form id="edit-profile-form" class="full-in-grid" style="color: white; display: flex; flex-direction: column; align-items: center; justify-content: center;" onsubmit="usernameAvatarFormHandleSubmit(event)">
<h1>Continue profile:</h1>
<br>
  <label>
    Username:
    <input type="text" id="username" name="username" required>
  </label>
  <span id="username-error" style="color: red; display: none;"></span>
  <br><br>
  <label>
    Avatar:
    <input type="file" id="avatar" name="avatar" accept="image/*">
  </label>
  <br><br>
  <button type="submit">Submit</button>
</form>
`;
