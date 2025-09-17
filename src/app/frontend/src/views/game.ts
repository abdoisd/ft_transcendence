import { wsClient } from "./gameRemote.ts";

export async function GameView()
{
	document.getElementById("main-views")!.innerHTML = gameViewStaticPart;
}

const gameViewStaticPart = `
<h1>Game modes</h1>
<button>local 1v1</button>
<button onclick="GameRemoteView()">remote 1v1</button>
<button>3d local 1v1</button>
<button>AI</button>
<button onclick="JoinATournament()">Join a tournament</button>
`;

function	JoinATournament()
{
	wsClient.emit("join-tournament", {
		userId: clsGlobal.LoggedInUser.Id
	});
}
window.JoinATournament = JoinATournament;
