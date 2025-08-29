import { User } from '../Business Layer/user.ts';
import { HomeView } from './home.ts';

export function LoginWithGoogle() {
	document.getElementById("root")!.innerHTML = profileViewStaticPart;
}

function requestBackend() {
	// browser send request to server
	window.location.pathname = '/loginGoogle';
}

export function NewUser() {
	document.getElementById("root")!.innerHTML = usernameAvatarForm;
};

export function existingUser() {
	// get user from query string
	const params = new URLSearchParams(window.location.search);

	if (!params.has('Id')) {
		console.error("Invalid user data in query");
        globalThis.clsGlobal.LoggedInUser = null;
		return ;
    }

	// if invalid query, what will happen is 
	console.debug("Filling loggedInUser");
	globalThis.clsGlobal.LoggedInUser = new User(
        Number(params.get('Id')),
        params.get('GoogleId') || '',
        params.get('Username') || null,
        params.get('AvatarPath') || null,
        Number(params.get('Wins') || 0),
        Number(params.get('Losses') || 0),
        params.get('SessionId') || null,
        params.get('ExpirationDate') ? new Date(params.get('ExpirationDate')!) : null
    );

	HomeView();
}

// user must be in the database
async function usernameAvatarFormHandleSubmit(event: Event)
{
	event.preventDefault();
	
	console.debug("usernameAvatarFormHandleSubmit()");

	const usernameElement = document.getElementById("username") as HTMLInputElement;
	const avatarElement = document.getElementById("avatar") as HTMLInputElement;

	const user: User = await User.getByUsername(usernameElement.value);
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

		fetch("http://localhost:8080/uploadProfile", {
    	    method: "POST",
    	    body: formData, // body as object? not string
    	})
    	.then(async response => { // is then gonna wait for this
			if (response.ok)
			{
				
				
				console.debug("Filling loggedInUser");
				const user: User = await User.getById(Number(Id));
				globalThis.clsGlobal.LoggedInUser = user;

				HomeView();
				// document.write("Profile finished, redirecting to home...");
			}
			else
				document.write("Error uploading profile. Please try again.");
		})
    	.catch(error => {
    	    console.error("Upload error:", error);
    	});
	}

}

/**
 * THE RULE IS:
 * don't fill globalThis.loggedInUser when a new user until you send username to server and you have response.ok
 * 
 * if user in db:
 * 	if username == null, the server must redirect to /newUser
 * else the server must redirect to /existingUser
 */

window.requestBackend = requestBackend;
window.usernameAvatarFormHandleSubmit = usernameAvatarFormHandleSubmit;

// this called route
const profileViewStaticPartOld = `
<a href="/loginGoogle">loginWithGoogle</a> // to request from backend
`;

const profileViewStaticPart = `
<button id="myButton" onclick="requestBackend()">Login With Google</button>
`;

// ask for username and avatar
const usernameAvatarForm = `
<form id="edit-profile-form" style="color: white;" onsubmit="usernameAvatarFormHandleSubmit(event)">

Continue profile:
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
