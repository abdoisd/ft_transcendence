const INITIAL_VELOCITY = 250;
const VELOCITY_INCREMENT = 1.05;
const BOARD_WIDTH = 800;
const BOARD_HEIGHT = 600;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 150;
const BALL_RADIUS = 9;
const MAX_VELOCITY = 1500;

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
	
	constructor(player1Id, player2Id, io, roomId) {
		this.io = io;
		this.roomId = roomId;

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
	}

	randomizeBall() {
		this.ball.x = BOARD_WIDTH / 2;
		this.ball.y = BOARD_HEIGHT / 2;

		const angle = (Math.random() - 0.5) * Math.PI / 2;
		this.ball.vx = Math.cos(angle) * INITIAL_VELOCITY * (Math.random() > 0.5 ? 1 : -1);
		this.ball.vy = Math.sin(angle) * INITIAL_VELOCITY;
	}

	score(scorer) {
		this.scores[scorer] += 1;
		this.io.to(this.roomId).emit("score-state", this.scores);
		if (this.scores[scorer] >= 1) // MAX SCORE
		{
			this.io.to(this.roomId).emit("new-winner", this.scores["left"] > this.scores["right"] ? "left" : "right");
			this.running = false;
			this.winnerId = this.scores["left"] > this.scores["right"] ? this.players[0]: this.players[1];
		} else {
			this.randomizeBall();
		}
	}

	collidesWithSides() {
		if (this.ball.y + BALL_RADIUS >= BOARD_HEIGHT
				|| this.ball.y - BALL_RADIUS < 0)
			this.ball.vy *= -1;

		if (this.ball.x - BALL_RADIUS < 0) {
			this.score("right");
		}
		if (this.ball.x + BALL_RADIUS > BOARD_WIDTH) {
			this.score("left");
		}
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
			if (ball.vx < MAX_VELOCITY)
				ball.vx *= -1 * VELOCITY_INCREMENT;

			if (side === "left") {
				ball.x = paddleCenterX + halfWidth + BALL_RADIUS;
			} else {
				ball.x = paddleCenterX - halfWidth - BALL_RADIUS;
			}
		}
	}

	update(delta) {
		if (!this.running)
			return;

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
			players: Object.keys(this.paddles)
		};
	}
}
