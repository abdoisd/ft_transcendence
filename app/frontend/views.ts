// VIEWS

export var loginPage: string = '<h1>Login</h1><a href="/home" onclick="route()">Login</a>'; // a request /home
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
