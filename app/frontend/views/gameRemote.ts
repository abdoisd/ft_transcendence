import { io } from "socket.io-client";

const WHITE = "#FFFFFF";
const CYAN = "#00FFFF";
const BRIGHT_YELLOW = "#FFD700";
const OPAQUE_WHITE = "#37E07B66";
const DARK_CYAN = "#193C4A";
const BALL_RADIUS = 9;

class ClientGame {
	canvas;
	ctx;
	leftId;
	rightId;
	state;
	looping;
	
	constructor(canvas, ctx, leftId, rightId) {
		this.canvas = canvas;
		this.ctx = ctx;
		this.leftId = leftId;
		this.rightId = rightId;

		this.state = {
			paddles: {},
			ball: {}

		};
		
		this.looping = true;
	}

	draw() {
		const { paddles, ball } = this.state;
		
		if (!paddles || !ball || !this.leftId || !this.rightId || !paddles[this.leftId] || !paddles[this.rightId])
			return;

		if (!this.looping)
			return;
		
		const ctx = this.ctx;
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		const scaleX = this.canvas.width / 800;
		const scaleY = this.canvas.height / 600;

                    // draw the outline

		// board
		ctx.fillStyle = "#000000";
		ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		ctx.setLineDash([12*scaleX,12*scaleY]);
		ctx.strokeStyle = "#FFFFFF";
		ctx.beginPath();
		ctx.moveTo(this.canvas.width/2, 0);
		ctx.lineTo(this.canvas.width/2, this.canvas.height);
		ctx.stroke();

		ctx.beginPath();
		ctx.arc(this.canvas.width / 2, this.canvas.height / 2, 75, 0, 2 * Math.PI);
		ctx.strokeStyle = "white";             // outline color
		ctx.lineWidth = 2;   
		ctx.setLineDash([]);                  // outline thickness
		ctx.stroke();      

		// paddles 
		ctx.fillStyle = "#ff1a1a";
		let paddleWidth = 10 * scaleX;
		let paddleHeight = 150 * scaleY;
		ctx.fillRect(10*scaleX - 5, paddles[this.leftId].y*scaleY, paddleWidth, paddleHeight);
		ctx.fillRect(this.canvas.width - 5 * scaleX - paddleWidth, paddles[this.rightId].y*scaleY, paddleWidth, paddleHeight);

		// ball
		ctx.fillStyle = "red";
		ctx.beginPath();
		ctx.arc(ball.x * scaleX, ball.y * scaleY, BALL_RADIUS*Math.sqrt(scaleX*scaleY), 0, Math.PI*2);
		ctx.fill();
	}

	gameLoop() {
		if (this.looping) {
			this.draw();
		}
	}
}

export const wsClient = io();

export async function GameRemoteView()
{
	document.getElementById("main-views")!.innerHTML = gameRemoteViewStaticPart;

	const canvas = document.querySelector(".canvas");
	const ctx = canvas.getContext("2d");

	const board = document.querySelector(".board");
	const rect = board.getBoundingClientRect();
	canvas.width = rect.width;
	canvas.height = rect.height;

	function setScores(left, right) {
		const scoreLeft = document.querySelector(".score-p1");
		const scoreRight = document.querySelector(".score-p2");
		scoreLeft.textContent = left;
		scoreRight.textContent = right;
	}

	const btnFindOpponent = document.querySelector(".start-game");

	//? WS CLIENT


	btnFindOpponent.addEventListener("click", () => {
		wsClient.emit("join-game", {
			userId: clsGlobal.LoggedInUser.Id
		});
	});

	wsClient.on("score-state", score => {
		setScores(score.left, score.right);
	})

	let game = null;
	wsClient.on("start-game", initialState => {
		setScores(0, 0);
		game = new ClientGame(canvas, ctx, initialState.players[0], initialState.players[1], wsClient);
		game.state = initialState;
		game.draw();
	});

	wsClient.on("game-state", state => {
		if (game) {
			game.state = state;
			if (game.looping)
				game.draw();
		}
	});

	wsClient.on("new-winner", winner => {
		console.log("The winner: ", winner);
	})

	wsClient.on("opponent-left", () => {
		game.looping = false;
	});

	//? WS EVENTS HERE

	type tournamentDTO = {
		userId: number | undefined,
		gameId,
		tournamentId: number | undefined
	}

	//

	window.addEventListener("keydown", event => {
		if (["ArrowUp", "ArrowDown", "w", "s"].includes(event.key))
			wsClient.emit("paddle-move", { key: event.key, pressedState: true });
	});

	window.addEventListener("keyup", event => {
		if (["ArrowUp", "ArrowDown", "w", "s"].includes(event.key))
			wsClient.emit("paddle-move", { key: event.key, pressedState: false });
	});

}
window.GameRemoteView = GameRemoteView;

const gameRemoteViewStaticPart = `
<div class="scores">
	<div>
		<p class="p1">P1</p>
		<p class="score-p1">0</p>
	</div>
	<div>
		<p class="score-p2">0</p>
		<p class="p2">P2</p>
	</div>
</div>
<div class="board body">
	<canvas class="canvas">
		Your Browser Is Not Supported; It's doesn't support canvas
	</canvas>
</div>
<button class="start-game">Find Opponent</button>
`;
