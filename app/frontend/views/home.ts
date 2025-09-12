export function HomeView()
{
	document.getElementById("body")!.innerHTML = HomeViewStaticPart;
}

const HomeViewStaticPart: string = `
<nav style="grid-area: nav;">
	<a class="flex-item nav-anchor" href="/" onclick="route()">home</a>
	<a class="flex-item nav-anchor" href="/friends" onclick="route()">friends</a>
	<a class="flex-item nav-anchor" href="/profile" onclick="route()">profile</a>
	<a class="flex-item nav-anchor" href="/settings" onclick="route()">settings</a>
</nav>
<main id="main-views" style="grid-area: main; display: flex; flex-direction: column; align-items: center;">
	<a class="main-anchor" href="/game" onclick="route()">play</a>
	<a class="main-anchor chat" href="/chat" onclick="route()">chat</a>

	<a>Join a tournament</a>

</main>
<footer style="grid-area: footer;">
	2025 — ft_transcendence Inc.
</footer>
`;

// const old = `
// <nav class="flex-container" style="grid-area: nav;">
// 	<a class="flex-item nav-anchor" href="/" onclick="route()">home</a>
// 	<a class="flex-item nav-anchor" href="/friends" onclick="route()">friends</a>
// 	<a class="flex-item nav-anchor" href="/profile" onclick="route()">profile</a>
// 	<a class="flex-item nav-anchor" href="/settings" onclick="route()">settings</a>
// </nav>
// <main id="main-views" style="grid-area: main; display: flex; flex-direction: column; align-items: center;">
// 	<a class="main-anchor" style="margin-top: 125px;" href="/game" onclick="route()">play</a>
// 	<a class="main-anchor chat" href="/chat" onclick="route()">chat</a>

// 	normal text
// 	<a>link text</a>
// 	<button>button text</button>
	
// </main>
// <footer style="grid-area: footer;">
// 	2025 — ft_transcendence Inc.
// </footer>
// `;
