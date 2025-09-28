const INITIAL_VELOCITY = 250;
const VELOCITY_INCREMENT = 1.15;
const BOARD_WIDTH = 1000;
const BOARD_HEIGHT = 800;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 150;
const BALL_RADIUS = 9;
const MAX_VELOCITY = 1000;
const MAX_SCORE = 3;

export class Game {
	io;
	roomId;
	aiGame;
	apiGame;
	player1Id;
	player2Id;
	paddles;
	scores;
	ball;
	keyStates;
	running;
	winnerId;
	targetY;
	apiState;
	p1;
	p2;

	constructor(player1Client, player2Client, io, roomId) {
		this.io = io;
		this.roomId = roomId;
		if (player2Client === "player2api") {
			this.apiGame = true;
			this.aiGame = false;
			this.player1Id = player1Client;
			this.player2Id = player2Client;
		} else if (player2Client === "AI") {
			this.aiGame = true;
			this.apiGame = false;
			this.player1Id = player1Client.userId;
			this.player2Id = player2Client;
		} else {
			this.player1Id = player1Client.userId;
			this.player2Id = player2Client.userId;
			this.apiGame = false;
			this.aiGame = false;
		}
		this.p1 = player1Client;
		this.p2 = player2Client;

		this.paddles = {
			[this.player1Id]: { 
					y: BOARD_HEIGHT / 2 - PADDLE_HEIGHT / 2
				},
			[this.player2Id]: { 
					y: BOARD_HEIGHT / 2 - PADDLE_HEIGHT / 2
				}
		};
		this.scores = {
			[this.player1Id]: 0,
			[this.player2Id]: 0
		};
		this.ball = { 
			x: BOARD_WIDTH / 2, 
			y: BOARD_HEIGHT / 2, 
			vx: INITIAL_VELOCITY, 
			vy: INITIAL_VELOCITY, 
		};

		this.keyStates = {
			[this.player1Id]: { up: false, down: false },
			[this.player2Id]: { up: false, down: false }
		};

		this.running = true;
		this.winnerId = null;
		this.targetY;
		this.apiState = "inited";
		this.randomizeBall();
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
		this.ball.vy = Math.sin(angle) * INITIAL_VELOCITY;

		if (this.aiGame)
			this.aiPlayer(true, this.ball, this.paddles[this.player2Id], this.keyStates[this.player2Id]);
	}

	score(scorerId) {
		this.scores[scorerId] += 1;
		if (!this.apiGame) {
			this.io.to(this.roomId).emit("score-state", this.scores);
		}
		if (this.scores[scorerId] >= MAX_SCORE) {
			this.running = false;
			if (!this.apiGame) {
				this.io.to(this.roomId).emit("new-winner", this.scores);
			}
			this.winnerId = scorerId;
			this.running = false;
		} else {
			this.randomizeBall();
		}
	}

	collidesWithSides() {
		if (this.ball.y - BALL_RADIUS <= 0) {
			this.ball.vy *= -1;
			this.ball.y = BALL_RADIUS;
		} else if (this.ball.y + BALL_RADIUS >= BOARD_HEIGHT) {
			this.ball.vy *= -1;
			this.ball.y = BOARD_HEIGHT - BALL_RADIUS;
		}

		if (this.ball.x - BALL_RADIUS < 0) {
			this.score(this.player2Id);
		}
		if (this.ball.x + BALL_RADIUS > BOARD_WIDTH) {
			this.score(this.player1Id);
		}
	}

	collidesWithPaddles(ball, paddle, side) {
		const halfWidth = PADDLE_WIDTH / 2;
		const halfHeight = PADDLE_HEIGHT / 2;

		const paddleCenterY = paddle.y + halfHeight;
		const paddleCenterX = (side === "left") ? 
			0 + PADDLE_WIDTH / 2 : BOARD_WIDTH - PADDLE_WIDTH / 2;

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
					this.aiPlayer(true, this.ball, this.paddles[this.player2Id], this.keyStates[this.player2Id]);
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

		const tolerance = 2;
		keyStates.down = false;
		keyStates.up = false;
		if (paddle.y + PADDLE_HEIGHT < this.targetY + tolerance)
			keyStates.down = true;
		else if (paddle.y > this.targetY - tolerance)
			keyStates.up = true;
	}

	update(delta) {
		if (!this.running)
			return;

		if (this.aiGame)
			this.aiPlayer(false, this.ball, this.paddles[this.player2Id], this.keyStates[this.player2Id]);

		const speed = INITIAL_VELOCITY * 1.5;
		const players = [this.player1Id, this.player2Id];
		for (const playerId of players) {
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

		this.collidesWithPaddles(this.ball, this.paddles[this.player1Id], "left");
		this.collidesWithPaddles(this.ball, this.paddles[this.player2Id], "right");
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
			ids: {left: this.player1Id, right: this.player2Id}
		};
	}

	getStateApi() {
		return {
			paddles: this.paddles,
			ball: this.ball,
			ids: {left: this.player1Id, right: this.player2Id},
			state: this.running,
			scores: this.scores
		}
	}

	startApiGame() {
		let lastTime = Date.now();
		const interval = setInterval(() => {
			const now = Date.now();
			const delta = (now - lastTime) / 1000;
			lastTime = now;
			this.update(delta);
			if (!this.running) {
				clearInterval(interval);
				this.apiState = "ended";
			}
		}, 16);
	}

	moveApiGame(player, move) {
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
}