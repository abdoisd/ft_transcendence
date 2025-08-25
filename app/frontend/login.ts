import { routes, route } from "./frontend.ts";
import { clsUser } from "./classes/user.ts";

// login workflow

export function LoginWorkflow()
{
	// get cookie from browser
	const cookies = document.cookie.split("; ");
	const loginCookie = cookies.find(row => row.startsWith("login=")); // value

	if (!loginCookie) // no cookie
	{
		console.log("No cookie, showing login view");
		document.getElementById("root")!.innerHTML = routes["/login"]; // just the login view string
		// when he files the form, cookie will be set
		return ;
	}

	// yes cookie -> auto login
	
	const value = decodeURIComponent(loginCookie.split("=")[1]); // decode uri
	const [username, password] = value.split(":");
	console.log("Auto login with cookie: " + username + " " + password);

	var userInForm = { username: username, password: password };

	// check login
	fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' // but the server has to get it as json
        },
        body: JSON.stringify(userInForm) // body is string
    })
    .then(response => response.json())
    .then(result => {
        console.log('Server response:', result);
		if (result.success)
		{

			// set logged in user
			console.log("setting user: ");
			globalThis.clsGlobal.LoggedInUser = new clsUser(99, userInForm.username || "default username", userInForm.password || "default password");
			console.log(globalThis.clsGlobal.LoggedInUser);

			// set cookie here for user
			// data in url <=> encoding username and password
			const value = encodeURIComponent(username + ":" + password);
			document.cookie = `login=${value}`;

			console.log("Now user is set");

			route(undefined, "/home");
		}
    })
    .catch(error => console.error('Error:', error));
}
