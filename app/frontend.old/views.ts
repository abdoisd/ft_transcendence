import { route } from './frontend.ts';
import { clsUser } from './frontend.ts';

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
// ACTION OF LOGIN FORM
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

			// // set cookie here for user
			// // data in url <=> encoding username and password
			// const value = encodeURIComponent(userInForm.username + ":" + userInForm.password);
			// document.cookie = `login=${value}`;

			globalThis.clsGlobal.LoggedInUser = new clsUser(99, userInForm.username || "default username", userInForm.password || "default password");
			console.log("user is " + clsGlobal.LoggedInUser.id, clsGlobal.LoggedInUser.username, clsGlobal.LoggedInUser.password);

			// window.location.pathname = '/home';
			route(); // it will take window.event
		}
    })
    .catch(error => console.error('Error:', error));
}
(window as any).sendJSON = sendJSON;




// href update the window.location.pathname
export var homePage: string = `
<nav>
	Navigation:
	<a href="/default" onclick="route()">Default View</a>
	<a href="/profile" onclick="route()">Profile</a>
	<a href="/friends" onclick="route()">Friends</a>
	<a href="/settings" onclick="route()">Settings</a>
</nav>
<hr>
<main id="main-views">
	<a href="/game" onclick="route()">Play</a>
	<a href="/chat" onclick="route()">Chat</a>
	<a href="/dataView" onclick="route()">Users View</a>
	<p id="pp">data table: </p>
	<table id="usersTable" border="1">

    <thead>
      <tr>
        <th>ID</th>
        <th>UserName</th>
        <th>PassWord</th>
      </tr>
    </thead>

    <tbody>
      <!-- Rows will be populated here -->
    </tbody>
  </table>
</main>
<hr>
<footer>
2025 — ft_transcendence Inc.
</footer>
`;
export var notFoundPage: string = '<h1>404 Not Found</h1><a href="/home" onclick="route()">Go to Home</a>';
export var friendsView: string = `<p>Friends View</p>`;
export var gameView: string = `<p>Game View</p>`;
export var chatView: string = `<p>Chat View</p>`;
export var settingsView: string = `<p>Settings View</p>`;
export var profileView: string = `<p>Profile View</p>`;
