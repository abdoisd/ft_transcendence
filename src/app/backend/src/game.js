"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
var INITIAL_VELOCITY = 250;
var VELOCITY_INCREMENT = 1.15;
var BOARD_WIDTH = 1000;
var BOARD_HEIGHT = 800;
var PADDLE_WIDTH = 10;
var PADDLE_HEIGHT = 150;
var BALL_RADIUS = 9;
var MAX_VELOCITY = 1000;
var MAX_SCORE = 3;
var Game = /** @class */ (function () {
    function Game(player1Client, player2Client, io, roomId) {
        var _a, _b, _c;
        this.io = io;
        this.roomId = roomId;
        if (player2Client === "player2api") {
            this.apiGame = true;
            this.aiGame = false;
            this.player1Id = player1Client;
            this.player2Id = player2Client;
        }
        else if (player2Client === "AI") {
            this.aiGame = true;
            this.apiGame = false;
            this.player1Id = player1Client.userId;
            this.player2Id = player2Client;
        }
        else {
            this.player1Id = player1Client.userId;
            this.player2Id = player2Client.userId;
            this.apiGame = false;
            this.aiGame = false;
        }
        this.paddles = (_a = {},
            _a[this.player1Id] = {
                y: BOARD_HEIGHT / 2 - PADDLE_HEIGHT / 2
            },
            _a[this.player2Id] = {
                y: BOARD_HEIGHT / 2 - PADDLE_HEIGHT / 2
            },
            _a);
        this.scores = (_b = {},
            _b[this.player1Id] = 0,
            _b[this.player2Id] = 0,
            _b);
        this.ball = {
            x: BOARD_WIDTH / 2,
            y: BOARD_HEIGHT / 2,
            vx: INITIAL_VELOCITY,
            vy: INITIAL_VELOCITY,
        };
        this.keyStates = (_c = {},
            _c[this.player1Id] = { up: false, down: false },
            _c[this.player2Id] = { up: false, down: false },
            _c);
        this.running = true;
        this.winnerId = null;
        this.targetY;
        this.apiState = "inited";
        this.randomizeBall();
    }
    Game.prototype.randomizeBall = function () {
        this.ball.x = BOARD_WIDTH / 2;
        this.ball.y = BOARD_HEIGHT / 2;
        var quandrant = Math.floor(Math.random() * 4) + 1;
        var angle;
        switch (quandrant) {
            case 1:
                angle = Math.random() * (Math.PI / 4 - Math.PI / 12) + Math.PI / 12;
                break;
            case 2:
                angle = Math.PI - (Math.random() * (Math.PI / 4 - Math.PI / 12) + Math.PI / 12);
                break;
            case 3:
                angle = -Math.PI + (Math.random() * (Math.PI / 4 - Math.PI / 12) + Math.PI / 12);
                break;
            case 4:
                angle = -(Math.random() * (Math.PI / 4 - Math.PI / 12) + Math.PI / 12);
                break;
        }
        this.ball.vx = Math.cos(angle) * INITIAL_VELOCITY;
        this.ball.vy = Math.sign(angle) * INITIAL_VELOCITY;
        if (this.aiGame)
            this.aiPlayer(true, this.ball, this.paddles[this.player2Id], this.keyStates[this.player2Id]);
    };
    Game.prototype.score = function (scorerId) {
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
        }
        else {
            this.randomizeBall();
        }
    };
    Game.prototype.collidesWithSides = function () {
        if (this.ball.y - BALL_RADIUS <= 0) {
            this.ball.vy *= -1;
            this.ball.y = BALL_RADIUS;
        }
        else if (this.ball.y + BALL_RADIUS >= BOARD_HEIGHT) {
            this.ball.vy *= -1;
            this.ball.y = BOARD_HEIGHT - BALL_RADIUS;
        }
        if (this.ball.x - BALL_RADIUS < 0) {
            this.score(this.player2Id);
        }
        if (this.ball.x + BALL_RADIUS > BOARD_WIDTH) {
            this.score(this.player1Id);
        }
    };
    Game.prototype.collidesWithPaddles = function (ball, paddle, side) {
        var halfWidth = PADDLE_WIDTH / 2;
        var halfHeight = PADDLE_HEIGHT / 2;
        var paddleCenterY = paddle.y + halfHeight;
        var paddleCenterX = (side === "left") ?
            0 + PADDLE_WIDTH / 2 : BOARD_WIDTH - PADDLE_WIDTH / 2;
        var dx = Math.abs(ball.x - paddleCenterX);
        var dy = Math.abs(ball.y - paddleCenterY);
        if (dx <= BALL_RADIUS + halfWidth && dy <= BALL_RADIUS + halfHeight) {
            if (ball.vx < 0) {
                ball.vx = Math.min(-ball.vx * VELOCITY_INCREMENT, MAX_VELOCITY);
                ball.x = paddleCenterX + halfWidth + BALL_RADIUS + 1;
            }
            else {
                ball.vx = Math.max(-ball.vx * VELOCITY_INCREMENT, -MAX_VELOCITY);
                ball.x = paddleCenterX - halfWidth - BALL_RADIUS - 1;
            }
            if (side === "left") {
                if (this.aiGame)
                    this.aiPlayer(true, this.ball, this.paddles[this.player2Id], this.keyStates[this.player2Id]);
            }
            else {
                this.targetY = BOARD_HEIGHT / 2;
            }
        }
    };
    Game.prototype.aiPlayer = function (updateAI, ball, paddle, keyStates) {
        if (updateAI && this.ball.vx > 0) {
            var slope = ball.vy / ball.vx;
            var paddleX = BOARD_WIDTH - PADDLE_WIDTH / 2;
            var rawY = ball.y + slope * (paddleX - ball.x);
            var n = Math.floor(rawY / BOARD_HEIGHT);
            var r = rawY - n * BOARD_HEIGHT;
            this.targetY = n % 2 === 0 ? r : BOARD_HEIGHT - r;
        }
        var tolerance = 2;
        keyStates.down = false;
        keyStates.up = false;
        if (paddle.y + PADDLE_HEIGHT < this.targetY + tolerance)
            keyStates.down = true;
        else if (paddle.y > this.targetY - BALL_RADIUS - tolerance)
            keyStates.up = true;
    };
    Game.prototype.update = function (delta) {
        if (!this.running)
            return;
        if (this.aiGame)
            this.aiPlayer(false, this.ball, this.paddles[this.player2Id], this.keyStates[this.player2Id]);
        var speed = INITIAL_VELOCITY * 1.5;
        var players = [this.player1Id, this.player2Id];
        for (var _i = 0, players_1 = players; _i < players_1.length; _i++) {
            var playerId = players_1[_i];
            var paddle = this.paddles[playerId];
            var keys = this.keyStates[playerId];
            if (keys.up)
                paddle.y -= speed * delta;
            if (keys.down)
                paddle.y += speed * delta;
            paddle.y = Math.max(0, Math.min(BOARD_HEIGHT - PADDLE_HEIGHT, paddle.y));
        }
        this.ball.x += this.ball.vx * delta;
        this.ball.y += this.ball.vy * delta;
        this.collidesWithPaddles(this.ball, this.paddles[this.player1Id], "left");
        this.collidesWithPaddles(this.ball, this.paddles[this.player2Id], "right");
        this.collidesWithSides();
    };
    Game.prototype.getState = function () {
        return {
            paddles: this.paddles,
            ball: this.ball,
        };
    };
    Game.prototype.getFullState = function () {
        return {
            paddles: this.paddles,
            ball: this.ball,
            ids: { left: this.player1Id, right: this.player2Id }
        };
    };
    Game.prototype.getStateApi = function () {
        return {
            paddles: this.paddles,
            ball: this.ball,
            ids: { left: this.player1Id, right: this.player2Id },
            state: this.running,
            scores: this.scores
        };
    };
    Game.prototype.startApiGame = function () {
        var _this = this;
        var lastTime = Date.now();
        var interval = setInterval(function () {
            var now = Date.now();
            var delta = (now - lastTime) / 1000;
            lastTime = now;
            _this.update(delta);
            if (!_this.running) {
                clearInterval(interval);
                _this.apiState = "ended";
                console.log("CLEARED AN INTERVAL");
            }
        }, 16);
    };
    Game.prototype.moveApiGame = function (player, move) {
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
    };
    return Game;
}());
exports.Game = Game;
