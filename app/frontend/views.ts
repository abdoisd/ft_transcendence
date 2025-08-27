import { route } from './frontend.ts';
import { handleLocation } from './frontend.ts';
import { clsUser } from "./classes/user.ts";

// VIEWS

// LOGIN FORM/VIEW
// THIS NEVER CHANGES
export var loginPage: string = `
<h1>Login Form</h1>
<label for="username">Username:</label>
<input type="text" id="username" name="username" required>
<br>
<label for="password">Password:</label>
<input type="password" id="password" name="password" required>
<br>
<button onclick="sendJSON()">Login</button>
`;
// login view handling submit
function sendJSON() {

	// get data
    const userInForm = {
        username: (document.getElementById('username') as HTMLInputElement).value,
        password: (document.getElementById('password') as HTMLInputElement).value
    };

	// post { username, password }
	// get { result.success true/false }
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
			console.log("client-side/frontend: form action: login success");

			// set cookie here for user
			// data in url <=> encoding username and password
			const value = encodeURIComponent(userInForm.username + ":" + userInForm.password);
			document.cookie = `login=${value}`;

			// set logged in user
			globalThis.clsGlobal.LoggedInUser = new clsUser(99, userInForm.username || "default username", userInForm.password || "default password");
			console.log("user is " + clsGlobal.LoggedInUser.id, clsGlobal.LoggedInUser.username, clsGlobal.LoggedInUser.password);

			route(undefined, "/home");
		}
    })
    .catch(error => console.error('Error:', error));
}
(window as any).sendJSON = sendJSON;

// href update the window.location.pathname
export var homePage: string = `
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Document</title>
	<style>
		* {
			margin: 0;
			padding: 0;
		}
		a {
			padding: 5px 10px;
			text-decoration: none;
			color: #ffffff;
			font-size: 25px;
			margin-right: 20px;
			margin-left: 20px;
			font-weight: 900;
			font-style: italic;
		}
		a:hover {
			text-decoration: underline; /* Underline on hover */
			text-decoration-color: red;
			text-decoration-thickness: 6px;
			text-underline-offset: 10px;
		}
		.block {
			font-family: "Arial Black", Impact, sans-serif;
			display: block;
			margin-bottom: 10px;
			text-align: center;
			margin: 20px auto;
			font-size: 100px;
			text-transform: uppercase;
		}
		body {
			background-image: url('bg.jpg');
    		background-repeat: no-repeat;
    		background-size: cover;        /* fills the screen, may crop */
    		background-position: center;   /* centers the image */
    		background-attachment: fixed;  /* optional: stays in place on scroll */
			font-family: 'Montserrat', sans-serif;
		}
	</style>
</head>
	<body style="display: flex; flex-direction: column; min-height: 100vh;">
		<nav style="color: white; border: solid 1px; padding: 20px; border-radius: 10px; display: flex; flex-direction: row; justify-content: center;">
			<a href="/default" onclick="route()">Default View</a>
			<a href="/profile" onclick="route()">Profile</a>
			<a href="/friends" onclick="route()">Friends</a>
			<a href="/settings" onclick="route()">Settings</a>
		</nav>
		<main id="main-views" style="flex: 1 1; border: solid 1px; padding: 20px; color: #ffffff;">
			<a class="block" href="/game" onclick="route()">Play</a>
			<a class="block" style="color: red;" href="/chat" onclick="route()">Chat</a>
		</main>
		<footer style="border: solid 1px; padding: 20px; border-radius: 10px; color: white;">
			2025 — ft_transcendence Inc.
		</footer>
	</body>
`;
export var notFoundPage: string = '<h1>404 Not Found</h1><a href="/home" onclick="route()">Go to Home</a>';
export var friendsView: string = `<p>Friends View</p>`;
export var gameView: string = `<p>Game View</p>`;
export var chatView: string = `<p>Chat View</p>`;
export var settingsView: string = `<p>Settings View</p>`;
export var profileView: string = `<p>Profile View</p>`;
