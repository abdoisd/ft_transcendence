import { guid } from "../global.ts";
import { server } from "../server.ts"

const apiGames = new Map();

const INITIAL_VELOCITY = 250;
const VELOCITY_INCREMENT = 1.15;
const BOARD_WIDTH = 1000;
const BOARD_HEIGHT = 800;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 150;
const BALL_RADIUS = 9;
const MAX_VELOCITY = 1500;
const MAX_SCORE = 5;

export class Game {

	io;
	roomId;
	players;
	paddles;
	scores;
	ball;
	keyStates;
	running;
	winnerId;
	targetY;
	aiGame;
	
	constructor(player1Id, player2Id) {
		this.players = [player1Id, player2Id];
		this.paddles = {
			[player1Id]: { 
					y: BOARD_HEIGHT / 2 - PADDLE_HEIGHT / 2
				},
			[player2Id]: { 
					y: BOARD_HEIGHT / 2 - PADDLE_HEIGHT / 2
				}
		};
		this.scores = {
			left: 0,
			right: 0
		};
		this.ball = { 
			x: BOARD_WIDTH / 2, 
			y: BOARD_HEIGHT / 2, 
			vx: INITIAL_VELOCITY, 
			vy: INITIAL_VELOCITY, 
		};

		this.keyStates = {
			[player1Id]: { up: false, down: false },
			[player2Id]: { up: false, down: false }
		};
		this.running = true;
		this.randomizeBall();
		this.winnerId = null;

		if (player2Id === "ai")
			this.aiGame = true;
		else
			this.aiGame = false;
		this.targetY = BOARD_HEIGHT / 2;
	}

	randomizeBall() {
		this.ball.x = BOARD_WIDTH / 2;
		this.ball.y = BOARD_HEIGHT / 2;
		const quandrant = Math.floor(Math.random() * 4) + 1;
		let angle;
		switch (quandrant) {
			case 1:
				angle = Math.random() * (Math.PI/4 - Math.PI/12) + Math.PI/12;
				break;
			case 2:
				angle = Math.PI - (Math.random() * (Math.PI/4 - Math.PI/12) + Math.PI/12);
				break;
			case 3:
				angle = -Math.PI + (Math.random() * (Math.PI/4 - Math.PI/12) + Math.PI/12);
				break;
			case 4:
				angle = -(Math.random() * (Math.PI/4 - Math.PI/12) + Math.PI/12);
				break;
		}

		this.ball.vx = Math.cos(angle) * INITIAL_VELOCITY;
		this.ball.vy = Math.sign(angle) * INITIAL_VELOCITY;

		if (this.aiGame)
			this.aiPlayer(true, this.ball, this.paddles[this.players[1]], this.keyStates[this.players[1]]);
	}

	score(scorer) {
		this.scores[scorer] += 1;
		if (this.scores[scorer] >= MAX_SCORE)
		{
			this.running = false;
			this.winnerId = this.scores["left"] > this.scores["right"] ? this.ids.id1: this.ids.id2;
		} else {
			this.randomizeBall();
		}
	}

	collidesWithSides() {
		if (this.ball.y + BALL_RADIUS >= BOARD_HEIGHT
				|| this.ball.y - BALL_RADIUS <= 0)
			this.ball.vy *= -1;

		if (this.ball.x - BALL_RADIUS < 0)
			this.score("right");
		if (this.ball.x + BALL_RADIUS > BOARD_WIDTH)
			this.score("left");
	}

	collidesWithPaddles(ball, paddle, side) {
		const halfWidth = PADDLE_WIDTH / 2;
		const halfHeight = PADDLE_HEIGHT / 2;

		const paddleCenterY = paddle.y + halfHeight;
		const paddleCenterX = (side === "left") 
			? 0 + PADDLE_WIDTH / 2
			: BOARD_WIDTH - PADDLE_WIDTH / 2;

		const dx = Math.abs(ball.x - paddleCenterX);
		const dy = Math.abs(ball.y - paddleCenterY);

		if (dx <= BALL_RADIUS + halfWidth && dy <= BALL_RADIUS + halfHeight) {
			if (ball.vx < 0) {
				ball.vx = Math.min(-ball.vx * VELOCITY_INCREMENT, MAX_VELOCITY);
				ball.x = paddleCenterX + halfWidth + BALL_RADIUS + 1;
			} else {
				ball.vx = Math.max(-ball.vx * VELOCITY_INCREMENT, -MAX_VELOCITY);
				ball.x = paddleCenterX - halfWidth - BALL_RADIUS - 1;
			}

			if (side === "left") {
				if (this.aiGame)
					this.aiPlayer(true, this.ball, this.paddles[this.players[1]], this.keyStates[this.players[1]]);
			} else {
				this.targetY = BOARD_HEIGHT / 2;
			}
		}
	}

	aiPlayer(updateAI, ball, paddle, keyStates) {
		if (updateAI && this.ball.vx > 0) {
			const slope = ball.vy / ball.vx;
			let paddleX = BOARD_WIDTH - PADDLE_WIDTH / 2;
			const rawY = ball.y + slope * (paddleX - ball.x);
			const n = Math.floor(rawY / BOARD_HEIGHT);
			const r = rawY - n * BOARD_HEIGHT;
			this.targetY = n % 2 === 0 ? r : BOARD_HEIGHT - r;
		}

		const tolerance = 2; // zero-tolerance requires precision
		keyStates.down = false;
		keyStates.up = false;
		if (paddle.y + PADDLE_HEIGHT < this.targetY + tolerance)
			keyStates.down = true;
		else if (paddle.y > this.targetY - BALL_RADIUS - tolerance)
			keyStates.up = true;
	}

	update(delta) {
		if (!this.running)
			return;

		if (this.aiGame)
			this.aiPlayer(false, this.ball, this.paddles[this.players[1]], this.keyStates[this.players[1]]);

		const speed = INITIAL_VELOCITY * 1.5;
		for (const playerId of this.players) {
			const paddle = this.paddles[playerId];
			const keys = this.keyStates[playerId]; 

			if (keys.up)
				paddle.y -= speed * delta;
			if (keys.down)
				paddle.y += speed * delta;

			paddle.y = Math.max(0, Math.min(BOARD_HEIGHT-PADDLE_HEIGHT, paddle.y));
		}

		this.ball.x += this.ball.vx * delta;
		this.ball.y += this.ball.vy * delta;

		this.collidesWithPaddles(this.ball, this.paddles[this.players[0]], "left");
		this.collidesWithPaddles(this.ball, this.paddles[this.players[1]], "right");
		this.collidesWithSides();
	}

	start() {
		let lastTime = Date.now();
		const interval = setInterval(() => {
			const now = Date.now();
			const delta = (now - lastTime) / 1000;
			lastTime = now;
			this.update(delta);
			if (!this.running)
				clearInterval(interval);
		}, 1000 / 60);
	}

	move(player, move) {
		if (move === "none") {
			this.keyStates[player].up = false;
			this.keyStates[player].down = false;
		}
		else if (move === "down") {
			this.keyStates[player].up = false;
			this.keyStates[player].down = true;
		}
		else if (move === "up") {
			this.keyStates[player].up = true;
			this.keyStates[player].down = false;
		}
	}

	getState() {
		return {
			paddles: this.paddles,
			ball: this.ball,
		};
	}

	getFullState() {
		return {
			paddles: this.paddles,
			ball: this.ball,
			players: Object.keys(this.paddles),
			scores: this.scores,
			status: this.running
		};
	}
}

export function gameRoutes()
{
	server.get("/api-game/init", (request, reply) => {
		const gameId = guid();
		const game = new Game("left", "right");
		apiGames.set(gameId, game);

		reply.send({
			gameId: gameId,
			message: "Game initialized"
		});
	});

	server.get("/api-game/start/:id", (request, reply) => {
		const game = apiGames.get(request.params.id);
		if (!game) {
			reply.code(404).send({error: "Game not found"});
			return;
		}

		game.start();

		reply.send({
			gameId: request.params.id,
			message: "Game started",
			gameState: game.getFullState()
		});
	});

	server.get("/api-game/state/:id", (request, reply) => {
		const game = apiGames.get(request.params.id);
		if (!game) {
			reply.code(404).send({error: "Game not found"});
			return;
		}

		reply.send({
			gameId: request.params.id,
			message: "Game state",
			gameState: game.getFullState()
		});
	});

	server.post("/api-game/:id/:player/:move", (request, reply) => {
		const game = apiGames.get(request.params.id);
		if (!game) {
			reply.code(404).send({error: "Game not found"});
			return;
		}

		const {player, move} = request.params;
		if ((player != "left" && player != "right") || (move != "none" && move != "down" && move != "up")) {
			reply.send({success: false});
			return;
		}

		game.move(player, move);
		reply.send({success: true});
	});

}
