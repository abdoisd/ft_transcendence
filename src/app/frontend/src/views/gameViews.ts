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

export function tournamentOverview(status, data, noFurtherUpdates) {
	document.getElementById("main-views")!.innerHTML = `
	<h1>Tournament has status: ${status}</h1>
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
<h1>Game Modes</h1>
<button onclick="aiView()">AI</button>
<button onclick="three3DView()">3D</button>
<button onclick="apiView()">API</button>
<button onclick="remoteView()">Remote</button>
<button onclick="tournamentView()">Tournament</button>
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
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
	const canvas = document.querySelector(".canvas") as HTMLCanvasElement;
	console.log(`client width: ${canvas.clientWidth}`)
	console.log(`client height: ${canvas.clientHeight}`);
	console.log(`canva width: ${canvas.width}`);
	console.log(`canvas height: ${canvas.height}`);
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
