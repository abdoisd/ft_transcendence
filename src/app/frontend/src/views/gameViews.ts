import { GameModesView } from "./game";
import { gameOverView } from "./game";

export function setScores(left, right, leftUsername, rightUsername) {
	const scoreLeft = document.querySelector(".score-p1");
	const scoreRight = document.querySelector(".score-p2");
	if (!scoreLeft || !scoreRight) {
		return;
	}
	scoreLeft.textContent = left;
	scoreRight.textContent = right;

	const pLeft = document.querySelector(".p1");
	const pRight = document.querySelector(".p2");
	if (!pLeft || !pRight) {
		return;
	}
	pLeft.textContent = leftUsername;
	pRight.textContent = rightUsername;
}

export function tournamentOverview(data, noFurtherUpdates) {
	document.getElementById("main-views")!.innerHTML = `
	<h1>Tournament summary:</h1>
	<div class="semi-match-1">Semi: ${data.semi1.one} vs ${data.semi1.two} -> ${data.semi1.winner}</div>
	<div class="semi-match-2">Semi: ${data.semi2.one} vs ${data.semi2.two} -> ${data.semi2.winner}</div>
	<div class="final-match">Final: ${data.final.one} vs ${data.final.two} -> ${data.final.winner}</div>
	<button class="game-modes">Game Modes</button>
	`;
	document.querySelector(".game-modes")?.addEventListener("click", () => {
		window.gameManager.leaveActiveGame();
		GameModesView();
	});
	if (noFurtherUpdates)
		window.gameManager.leaveActiveGame();
}

export function gameOverViewStaticPart(winner, loser) {
	return `
	<h1>Game Over</h1>
	<div class="winner">${winner} won.</div>
	<div class="loser">${loser} lost.</div>
	<button class="game-modes">Game Modes</button>
	`;
}

export function voidedTournament() {
	document.getElementById("main-views")!.innerHTML = `
	<h1>Tournament is void</h1>
	<div>The tournament has been voided as one player has left.</div>
	<button class="game-modes">Game Modes</button>
	`
	document.querySelector(".game-modes")?.addEventListener("click", GameModesView);
}

export function opponentLeftGame() {
	document.getElementById("main-views")!.innerHTML = `
	<h1>Game Over</h1>
	<div class="winner">The opponent has disconnected!</div>
	<button class="game-modes">Game Modes</button>
	`
	document.querySelector(".game-modes")?.addEventListener("click", GameModesView);
}

export const gameModesViewStaticPart = `
	<div class="w-full column h-full flex flex-center mv-5">
		<h1 class="large-headline text-center">Choose Your <span class="primary">Game Mode</span></h1>
		<p class="mt-3 text-center text-secondary max-width w-full mh-5">Select how you want to play. Challenge our AI, dive into a 3D experience, or compete against others.</p>

		<div class="mt-10 flow-row gap-medium center-justify gap-row-large">
			
		<a href="/ai-game" onclick="route()" class="card-btn flex-center">
				<div class="p-5 round icon">
					<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 48 48">
						<g id="Layer_2" data-name="Layer 2">
						<g id="invisible_box" data-name="invisible box">
							<rect width="48" height="48" fill="none"/>
						</g>
						<g id="Q3_icons" data-name="Q3 icons">
							<g>
							<path d="M17.9,2h-.4L7.6,6.6a1,1,0,0,0-.6.9v7.4l-.6.5-4,3.3a.8.8,0,0,0-.4.8v9a.9.9,0,0,0,.4.8l4,3.3.6.5v7.4a1,1,0,0,0,.6.9l9.9,4.5h.4l.6-.2,4-2.7V25.5H21a1.5,1.5,0,0,1,0-3h1.5V4.9l-4-2.7ZM9,13.5l2.8,1.9a1.5,1.5,0,0,1,.4,2.1,1.4,1.4,0,0,1-1.2.7,1.1,1.1,0,0,1-.8-.3L9,17.1Zm-5,9H7.5a1.5,1.5,0,0,1,0,3H4Zm5,8.4,1.2-.8a1.4,1.4,0,0,1,2,.4,1.5,1.5,0,0,1-.4,2.1L9,34.5ZM19.5,18.6l-4,4v2.8l4,4v5.2l-3.4,3.5a2.1,2.1,0,0,1-1.1.4,2.1,2.1,0,0,1-1.1-.4,1.6,1.6,0,0,1,0-2.2l2.6-2.5V30.6l-4-4V21.4l4-4V14.6l-2.6-2.5a1.6,1.6,0,1,1,2.2-2.2l3.4,3.5Z"/>
							<path d="M45.6,18.7l-4-3.3-.6-.5V7.5a1,1,0,0,0-.6-.9L30.5,2.1h-.4l-.6.2-4,2.7V22.5H27a1.5,1.5,0,0,1,0,3H25.5V43.1l4,2.7.6.2h.4l9.9-4.5a1,1,0,0,0,.6-.9V33.1l.6-.5,4-3.3a.9.9,0,0,0,.4-.8v-9A.8.8,0,0,0,45.6,18.7ZM39,17.1l-1.2.8a1.1,1.1,0,0,1-.8.3,1.4,1.4,0,0,1-1.2-.7,1.5,1.5,0,0,1,.4-2.1L39,13.5ZM28.5,29.4l4-4V22.6l-4-4V13.4l3.4-3.5a1.6,1.6,0,0,1,2.2,2.2l-2.6,2.5v2.8l4,4v5.2l-4,4v2.8l2.6,2.5a1.6,1.6,0,0,1,0,2.2,1.7,1.7,0,0,1-2.2,0l-3.4-3.5ZM39,34.5l-2.8-1.9a1.5,1.5,0,0,1-.4-2.1,1.4,1.4,0,0,1,2-.4l1.2.8Zm5-9H40.5a1.5,1.5,0,0,1,0-3H44Z"/>
							</g>
						</g>
						</g>
					</svg>
				</div>
			
				<h2 class="mt-4 mb-3">AI Challenge</h2>
				<p class="text-secondary text-center">Test your skills against our advanced intelligence opponent.</p>

				<div class="rounded-btn mt-6 mb-3">
					<p>Play Now</p>
				</div>
			</a>

			<a href="/api-game" onclick="route()" class="card-btn flex-center">
				<div class="p-5 round icon">
					<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25" />
					</svg>
				</div>
			
				<h2 class="mt-4 mb-3">API Mode</h2>
				<p class="text-secondary text-center">Play a game using API.</p>

				<div class="rounded-btn mt-6 mb-3">
					<p>Play Now</p>
				</div>
			</a>

			<a href="/tournament-game" onclick="route()" class="card-btn flex-center">
				<div class="p-5 round icon">
					<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" fill="currentColor" class="size-6">
						<path fill-rule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.6 6.73 6.73 0 0 0 2.743 1.346A6.707 6.707 0 0 1 9.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 0 0-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 0 1-1.112-3.173 6.73 6.73 0 0 0 2.743-1.347 6.753 6.753 0 0 0 6.139-5.6.75.75 0 0 0-.585-.858 47.077 47.077 0 0 0-3.07-.543V2.62a.75.75 0 0 0-.658-.744 49.22 49.22 0 0 0-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 0 0-.657.744Zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 0 1 3.16 5.337a45.6 45.6 0 0 1 2.006-.343v.256Zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 0 1-2.863 3.207 6.72 6.72 0 0 0 .857-3.294Z" clip-rule="evenodd" />
					</svg>
				</div>
			
				<h2 class="mt-4 mb-3">Tournament</h2>

				<p class="text-secondary text-center">Complete for the top spot.</p>

				<div class="rounded-btn mt-6 mb-3">
					<p>Join</p>
				</div>
			</a>
			
			<a href="/remote-game" onclick="route()" class="card-btn flex-center">
				<div class="p-5 round icon">
					<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" fill="currentColor" class="size-6">
						<path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
					</svg>
				</div>
			
				<h2 class="mt-4 mb-3">Multiplayer</h2>

				<p class="text-secondary text-center">Complete against friends or players from around the world in real-time.</p>

				<div class="rounded-btn mt-6 mb-3">
					<p>Play Now</p>
				</div>
			</a>

			<a href="/3d-game" onclick="route()" class="card-btn flex-center">
				<div class="p-5 round icon">
					<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" />
					</svg>
				</div>
			
				<h2 class="mt-4 mb-3">3D Mode</h2>
				<p class="text-secondary text-center">Immerse yourself in a stunning 3D gaming environemnt.</p>

				<div class="rounded-btn mt-6 mb-3">
					<p>Enter 3D</p>
				</div>
			</a>
		</div>
	</div>
`;

export const apiGameStaticPart = `
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
<button class="start-api-game">Start Game</button>
`

export const aiGameViewStaticPart = `
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
<button class="start-ai-game">Start Game</button>
`;

export const remoteGameViewStaticPart = `
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
<button class="start-remote-game">Find Opponent</button>
`;

export const inviteGameViewStaticPart = `
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
`;

export const Three3DGameViewStaticPart = `
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
<div class="board body" style="flex:1; min-height: 70vh;">
<canvas class="canvas" style="width: 100vw; height: 100vh;"></canvas>
</div>
<button class="start-3d-game">Start Game</button>
`;

export const tournamentGameViewStaticPart = `
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
<div class="counter"></div>
<div class="board body">
	<canvas class="canvas"></canvas>
</div>
<button class="start-tournament-game">Join Tournament</button>
`;

const BALL_RADIUS = 9;
const SERVER_WIDTH = 1000;
const SERVER_HEIGHT = 800;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 150;
export class ClientGame {
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
		const scaleX = this.canvas.width / SERVER_WIDTH;
		const scaleY = this.canvas.height / SERVER_HEIGHT;

		// board
		ctx.fillStyle = "#000000";
		ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		ctx.setLineDash([12 * scaleX, 12 * scaleY]);
		ctx.strokeStyle = "#FFFFFF";
		ctx.beginPath();
		ctx.moveTo(this.canvas.width / 2, 0);
		ctx.lineTo(this.canvas.width / 2, this.canvas.height);
		ctx.stroke();

		// draw outline
		ctx.beginPath();
		ctx.arc(this.canvas.width / 2, this.canvas.height / 2, 75, 0, 2 * Math.PI);
		ctx.strokeStyle = "white";
		ctx.lineWidth = 2;
		ctx.setLineDash([]);
		ctx.stroke();

		// paddles 
		ctx.fillStyle = "#ff1a1a";
		let paddleWidth = PADDLE_WIDTH * scaleX;
		let paddleHeight = PADDLE_HEIGHT * scaleY;
		ctx.fillRect(0 * scaleX, paddles[this.leftId].y * scaleY, paddleWidth, paddleHeight);
		ctx.fillRect((SERVER_WIDTH - PADDLE_WIDTH) * scaleX, paddles[this.rightId].y * scaleY, paddleWidth, paddleHeight);

		// ball
		ctx.fillStyle = "red";
		ctx.beginPath();
		ctx.arc(ball.x * scaleX, ball.y * scaleY, BALL_RADIUS * Math.sqrt(scaleX * scaleY), 0, Math.PI * 2);
		ctx.fill();
	}

	gameLoop() {
		if (this.looping) {
			this.draw();
		}
	}
}

import { Engine, Scene, FreeCamera, Vector3, HemisphericLight, MeshBuilder, StandardMaterial, Camera, Light, Mesh, Color3, DynamicTexture } from "@babylonjs/core";

const WHITE = "#FFFFFF";
const CYAN = "#00FFFF";
const OPAQUE_WHITE = "#37E07B";
const RED = "#E63946";

const CAMERA_POINT = new Vector3(0, 14, 23.5);
const FOCAL_POINT = new Vector3(0, 0, 0);
const LIGHT_POINT = new Vector3(20, 2, 20);

const BOARD_WITDTH = 10;
const BOARD_HEIGHT = 0.2;
const BOARD_DEPTH = 20;

const LINE_SPACING = 0.5;
const LINE_WIDTH = LINE_SPACING;
const LINE_HEIGHT = 0.01;
const LINE_DEPTH = 0.1;

const PADDLE_WIDTH_3D = 1.5;
const PADDLE_HEIGHT_3D = 0.3;
const PADDLE_DEPTH = 0.15;
const PAD_ONE_POS = new Vector3(0, BOARD_HEIGHT / 2 + PADDLE_HEIGHT_3D / 2, 10 - 0.2);
const PAD_TWO_POS = new Vector3(0, BOARD_HEIGHT / 2 + PADDLE_HEIGHT_3D / 2, -10 + 0.2);

const WALL_WIDTH = BOARD_HEIGHT;
const WALL_HEIGHT = BOARD_HEIGHT + 0.3;
const WALL_DEPTH = BOARD_DEPTH;
const LEFT_WALL_POS = new Vector3(-BOARD_WITDTH / 2 - WALL_WIDTH / 2, WALL_HEIGHT / 2 - BOARD_HEIGHT / 2, 0);
const RIGHT_WALL_POS = new Vector3(BOARD_WITDTH / 2 + WALL_WIDTH / 2, WALL_HEIGHT / 2 - BOARD_HEIGHT / 2, 0);

const BALL_DIAMETER = 0.35;
const BALL_RADIUS_3D = BALL_DIAMETER / 2;
const BALL_POS = new Vector3(0, BALL_DIAMETER + 1, 0);
const INITIAL_VELOCITY = 5;
const MAX_VELOCITY = 25;
const VELOCITY_INCEMENT = 1.15;

const PADDLE_SPEED = 0.10;

export function init3DGame() {
	const canvas = document.querySelector(".canvas");
	const engine = new Engine(canvas, true);
	const scene = new Scene(engine);
	const camera = new FreeCamera("camera", CAMERA_POINT, scene);
	camera.setTarget(FOCAL_POINT);
	const light = new HemisphericLight("light", LIGHT_POINT, scene);
	light.intensity = 0.8;

	const boardMaterial = new StandardMaterial("board-material", scene);
	boardMaterial.diffuseColor = Color3.FromHexString(OPAQUE_WHITE);
	const board = MeshBuilder.CreateBox("board", { width: BOARD_WITDTH, height: BOARD_HEIGHT, depth: BOARD_DEPTH }, scene);
	board.material = boardMaterial;

	const lineMaterial = new StandardMaterial("line-material", scene);
	lineMaterial.diffuseColor = Color3.FromHexString(WHITE);
	const dashCount = BOARD_WITDTH / 2 / LINE_WIDTH;
	for (let i = 0; i < dashCount; i++) {
		const dash = MeshBuilder.CreateBox(`dash${i}`, { width: LINE_WIDTH, height: LINE_HEIGHT, depth: LINE_DEPTH }, scene);
		dash.position.x = -BOARD_WITDTH / 2 + i + LINE_SPACING;
		dash.position.y = BOARD_HEIGHT;
	}

	const wallMaterial = new StandardMaterial("wall-material", scene);
	wallMaterial.diffuseColor = Color3.FromHexString(RED);
	const leftWall = MeshBuilder.CreateBox("left-wall", { width: WALL_WIDTH, height: WALL_HEIGHT, depth: WALL_DEPTH }, scene);
	leftWall.material = wallMaterial;
	leftWall.position = LEFT_WALL_POS;
	const rightWall = leftWall.clone("right-wall");
	rightWall.position = RIGHT_WALL_POS;

	const paddleMaterial = new StandardMaterial("paddle-material", scene);
	paddleMaterial.diffuseColor = Color3.FromHexString(CYAN);
	const paddleOne = MeshBuilder.CreateBox("left-paddle", { width: PADDLE_WIDTH_3D, height: PADDLE_HEIGHT_3D, depth: PADDLE_DEPTH }, scene);
	paddleOne.material = paddleMaterial;
	paddleOne.position = PAD_ONE_POS;
	const paddleTwo = paddleOne.clone("right-paddle");
	paddleTwo.position = PAD_TWO_POS;

	const ballMaterial = new StandardMaterial("ball", scene);
	// ballMaterial.diffuseColor = Color3.FromHexString("#FFFF00");
	const ballTexture = new DynamicTexture("stripes", 512, scene, false)
	const ctx = ballTexture.getContext();
	ctx.fillStyle = "red";
	ctx.fillRect(0, 0, 512, 512);
	ctx.fillStyle = "black";
	for (let i = 0; i < 512; i += 50) {
		ctx.fillRect(i, 0, 20, 512);
	}
	ballTexture.update();
	ballMaterial.diffuseTexture = ballTexture;

	const ball = MeshBuilder.CreateSphere("ball", { diameter: BALL_DIAMETER, segments: 32 }, scene);
	ball.material = ballMaterial;
	ball.position = BALL_POS;

	const game = new Game(canvas, engine, scene, camera, light, paddleOne, paddleTwo, ball);
	return game;
}

class Game {
	canvas: HTMLCanvasElement;
	engine: Engine;
	scene: Scene;
	camera: Camera;
	light: Light;
	paddleOne: Mesh;
	paddleTwo: Mesh;
	ball: {
		mesh: Mesh;
		velocity: { x: number; y: number; z: number };
	}

	pressedKeys: {
		ArrowLeft: Boolean,
		ArrowRight: Boolean,
		a: Boolean,
		d: Boolean
	}

	scores: {
		closer: number;
		farther: number;
	};

	looping: boolean;

	constructor(canvas: HTMLCanvasElement, engine: Engine, scene: Scene, camera: Camera, light: Light, paddleOne: Mesh, paddleTwo: Mesh, ball: Mesh) {
		this.canvas = canvas;
		this.engine = engine;
		this.scene = scene;
		this.camera = camera;
		this.light = light;

		this.paddleOne = paddleOne;
		this.paddleTwo = paddleTwo;

		this.ball = {
			mesh: ball,
			velocity: { x: 0, y: 0, z: 0 }
		};
		this.randomizeBall();

		this.pressedKeys = {
			ArrowLeft: false,
			ArrowRight: false,
			a: false,
			d: false
		};

		this.scores = {
			closer: 0,
			farther: 0
		};

		this.looping = true;
	}

	randomizeBall() {
		this.ball.mesh.position = new Vector3(0, BALL_DIAMETER, 0);

		const dirX = (Math.random() - 0.5) * 2.5;
		const dirZ = Math.random() > 0.5 ? 1 : -1;

		const length = Math.sqrt(dirZ * dirZ + dirX * dirX);
		this.ball.velocity.x = dirX / length * INITIAL_VELOCITY;
		this.ball.velocity.z = dirZ / length * INITIAL_VELOCITY;
	}

	collidesWithPaddles(paddle: Mesh, side: string) {
		const halfWidth = PADDLE_WIDTH_3D / 2;
		const halfDepth = PADDLE_DEPTH / 2;

		const paddleCenterX = paddle.position.x;
		const paddleCenterZ = paddle.position.z;

		const dx = Math.abs(this.ball.mesh.position.x - paddleCenterX);
		const dz = Math.abs(this.ball.mesh.position.z - paddleCenterZ);

		if (dx <= halfWidth + BALL_RADIUS_3D && dz <= halfDepth + BALL_RADIUS_3D) {
			this.ball.velocity.z *= -1;
			if (Math.abs(this.ball.velocity.z) < MAX_VELOCITY)
				this.ball.velocity.z *= VELOCITY_INCEMENT;
			if (side === "back")
				this.ball.mesh.position.z = paddle.position.z - BALL_RADIUS_3D - halfDepth;
			else
				this.ball.mesh.position.z = paddle.position.z + BALL_RADIUS_3D + halfDepth;
		}
	}

	collidesWithSides() {
		if (this.ball.mesh.position.x > BOARD_WITDTH / 2 - BALL_RADIUS_3D) {
			this.ball.velocity.x *= -1;
			this.ball.mesh.position.x = BOARD_WITDTH / 2 - BALL_RADIUS_3D;
		} else if (this.ball.mesh.position.x < -BOARD_WITDTH / 2 + BALL_RADIUS_3D) {
			this.ball.velocity.x *= -1;
			this.ball.mesh.position.x = -BOARD_WITDTH / 2 + BALL_RADIUS_3D;
		}

		if (this.ball.mesh.position.z > BOARD_DEPTH / 2 + BALL_RADIUS_3D) {
			this.scores.farther++;
			this.randomizeBall();
		}
		else if (this.ball.mesh.position.z < -BOARD_DEPTH / 2 - BALL_RADIUS_3D) {
			this.scores.closer++;
			this.randomizeBall();
		}
		setScores(this.scores.farther, this.scores.closer, "P1", "P2");
		if (this.scores.closer == 2) {
			this.looping = false;
			gameOverView("P1", "P2");
		} else if (this.scores.farther == 2) {
			this.looping = false;
			gameOverView("P2", "P1");
		}
	}

	updateBall(dt: number) {
		this.ball.mesh.position.x += this.ball.velocity.x * dt;
		this.ball.mesh.position.z += this.ball.velocity.z * dt;

		this.ball.mesh.rotation.x += this.ball.velocity.z * dt / BALL_RADIUS_3D;
		this.ball.mesh.rotation.z += this.ball.velocity.x * dt / BALL_RADIUS_3D;

		this.collidesWithSides();
		this.collidesWithPaddles(this.paddleOne, "back");
		this.collidesWithPaddles(this.paddleTwo, "front");
	}

	updatePaddles() {
		if (this.pressedKeys["ArrowLeft"])
			this.paddleTwo.position.x += PADDLE_SPEED;
		if (this.pressedKeys["ArrowRight"])
			this.paddleTwo.position.x -= PADDLE_SPEED;

		if (this.pressedKeys["a"])
			this.paddleOne.position.x += PADDLE_SPEED;
		if (this.pressedKeys["d"])
			this.paddleOne.position.x -= PADDLE_SPEED;

		if (this.paddleOne.position.x < -BOARD_WITDTH / 2 + PADDLE_WIDTH_3D / 2)
			this.paddleOne.position.x = -BOARD_WITDTH / 2 + PADDLE_WIDTH_3D / 2;
		else if (this.paddleOne.position.x > BOARD_WITDTH / 2 - PADDLE_WIDTH_3D / 2)
			this.paddleOne.position.x = BOARD_WITDTH / 2 - PADDLE_WIDTH_3D / 2;

		if (this.paddleTwo.position.x < -BOARD_WITDTH / 2 + PADDLE_WIDTH_3D / 2)
			this.paddleTwo.position.x = -BOARD_WITDTH / 2 + PADDLE_WIDTH_3D / 2;
		else if (this.paddleTwo.position.x > BOARD_WITDTH / 2 - PADDLE_WIDTH_3D / 2)
			this.paddleTwo.position.x = BOARD_WITDTH / 2 - PADDLE_WIDTH_3D / 2;
	}

	update() {
		const dt = this.engine.getDeltaTime() / 1000;
		this.updateBall(dt);
		this.updatePaddles();
	}

	start() {
		this.engine.runRenderLoop(() => {
			if (this.looping) {
				this.update();
				this.scene.render();
			} else {
				this.engine.stopRenderLoop();
				window.gameManager.leaveActiveGame();
			}
		});
	}
}
