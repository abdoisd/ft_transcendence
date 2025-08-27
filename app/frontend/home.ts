export function HomeView()
{
	document.getElementById("root")!.innerHTML = HomeViewStaticPart;
}

const HomeViewStaticPart: string = `
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
			font-size: 30px;
			margin-right: 20px;
			margin-left: 20px;
			font-weight: 900;
			font-style: italic;
			text-transform: uppercase;
		}
		.block {
			font-family: "Arial Black", Impact, sans-serif;
			display: block;
			margin-bottom: 10px;
			text-align: center;
			margin: 25px auto;
			font-size: 150px;
		}
		a:hover {
			text-decoration: underline; /* Underline on hover */
			text-decoration-color: red;
			text-decoration-thickness: 6px;
			text-underline-offset: 10px;
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
	</body>
`;
