export function HomeView()
{
	document.getElementById("root")!.innerHTML = HomeViewStaticPart;
}

const HomeViewStaticPart: string = `
	<div style="display: flex; flex-direction: column; min-height: 100vh;">
		<nav style="color: white; border: solid 1px; padding: 50px 20px 30px; display: flex; flex-direction: row; justify-content: center;">
			<a href="/" onclick="route()">Home</a>
			<a href="/friends" onclick="route()">Friends</a>
			<a href="/profile" onclick="route()">Profile</a>
			<a href="/settings" onclick="route()">Settings</a>
		</nav>
		<main id="main-views" style="flex: 1 1; border: solid 1px; padding: 20px; color: #ffffff;">
			<a class="block" style="color: white; text-decoration: none;" href="/game" onclick="route()">Play</a>
			<a class="block" style="color: red; text-decoration: none;" href="/chat" onclick="route()">Chat</a>
		</main>
		<footer style="border: solid 1px; color: rgb(200, 200, 200); padding: 20px; text-align: center;">
			2025 — ft_transcendence Inc.
		</footer>
	</div>
`;

