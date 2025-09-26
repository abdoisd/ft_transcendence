import { UserDTO } from '../business layer/user.ts';
import { TwoFAView } from './2fa.ts';
import { HomeView } from './home.ts';
import { getOnlyFetch } from './request.ts';

export function LoginWithGoogle() {
	window.history.replaceState({}, '', '/login');
	document.getElementById("body")!.innerHTML = loginViewStaticPart;
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

const loginViewStaticPart = `
<div class="flex flex-center full-in-grid">
	<div class="card">
		<div class="mb-7 w-full text-center">
			<h1 class="mb-1 headline mt-2">Welcome!</h1>

			<p class="text-secondary">Sign in with your Google account to continue.</p>
		</div>
		<button class="btn btn-secondary mh-5" id="myButton" onclick="requestBackend()">
			<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
			Login With Google
		</button>
	</div>
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
