export function HomeView()
{
	document.getElementById("body")!.innerHTML = HomeViewStaticPart;
}

const HomeViewStaticPart: string = `
<nav style="grid-area: nav;">
	<a class="flex-item anchor-nav" href="/" onclick="route()">home</a>
	<a class="flex-item anchor-nav" href="/friends" onclick="route()">friends</a>
	<a class="flex-item anchor-nav" href="/profile" onclick="route()">profile</a>
	<a class="flex-item anchor-nav" href="/settings" onclick="route()">settings</a>
</nav>
<main id="main-views" style="grid-area: main; display: flex; flex-direction: column; align-items: center;">
	<a class="anchor-main" href="/game" onclick="route()">play</a>
	<a class="anchor-main anchor-chat" href="/chat" onclick="route()">chat</a>

	<a class="anchor-general">Join a tournament</a>

</main>
<footer style="grid-area: footer; font-weight: 1; text-align: center;">
	2025 — ft_transcendence Inc.
</footer>
`;

// const old = `
// <nav class="flex-container" style="grid-area: nav;">
// 	<a class="flex-item anchor-nav" href="/" onclick="route()">home</a>
// 	<a class="flex-item anchor-nav" href="/friends" onclick="route()">friends</a>
// 	<a class="flex-item anchor-nav" href="/profile" onclick="route()">profile</a>
// 	<a class="flex-item anchor-nav" href="/settings" onclick="route()">settings</a>
// </nav>
// <main id="main-views" style="grid-area: main; display: flex; flex-direction: column; align-items: center;">
// 	<a class="anchor-main" style="margin-top: 125px;" href="/game" onclick="route()">play</a>
// 	<a class="anchor-main chat" href="/chat" onclick="route()">chat</a>

// 	normal text
// 	<a>link text</a>
// 	<button>button text</button>
	
// </main>
// <footer style="grid-area: footer;">
// 	2025 — ft_transcendence Inc.
// </footer>
// `;
