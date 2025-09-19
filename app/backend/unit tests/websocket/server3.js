import { WebSocketServer } from "ws";

const colors = {
	red:		"\x1b[31m%s\x1b[0m",
	green:		"\x1b[32m%s\x1b[0m",
	yellow:		"\x1b[33m%s\x1b[0m",
	blue:		"\x1b[34m%s\x1b[0m",
	magenta:	"\x1b[35m%s\x1b[0m",
	cyan:		"\x1b[36m%s\x1b[0m"
};

// server
const wss = new WebSocketServer({ host: "0.0.0.0", port: 3000 });
console.log("WebSocket server running on ws://localhost:3000");

// clients connection
let client1;
let client2;
let counter = 0;

// on client connection
wss.on("connection", (ws) => {

	// connecting 2 clients
	if (counter == 0)
	{
		ws.id = 1;
		client1 = ws;
		counter++;
	}
	else if (counter == 1)
	{
		ws.id = 2;
		client2 = ws;
		console.info(colors.green, "Both clients connected");
		counter++;

		startGame();
	}
	else
	{
		console.debug(colors.red, "Only 2 clients are allowed");
		ws.close();
		return ;
	}
	const waitingForOther = setInterval(() => {
		if (counter < 2) {
			console.debug(colors.yellow, "Waiting for another client to connect");
		} else {
			clearInterval(waitingForOther);
		}
	}, 3000);
	
	// on message send to the other client
	ws.on('message', msg => {
		console.info(colors.green, `Received message: ${msg} from client ${ws.id}`);

		console.debug(colors.yellow, "Server Got: ", msg);
		console.debug(colors.yellow, "Server Got: ", msg.toString());

		if (ws.id == 1 && client2)
		{
			// msg from 1
			// handle it's paddle
			if (msg.toString() == "1")
				leftPaddle.dy = -speed;
			else if (msg.toString() == "0")
				leftPaddle.dy = speed;

			// ui
			client2.send(msg.toString());
		}
		else if (ws.id == 2 && client1)
		{
			// msg from 2
			// handle it's paddle
			if (msg.toString() == "1")
				rightPaddle.dy = -speed;
			else if (msg.toString() == "0")
				rightPaddle.dy = speed;

			// ui
			client1.send(msg.toString());
		}
	})

	// new connection and close events
	console.info(colors.green, `New client connected: ${ws.id}`);
	ws.on("close", () => {
		console.debug(colors.red, "One client disconnected");
		counter--;
	});
});

// POSITIONS ========================================================================================

const canvas = {
	width: 1000,
	height: 500
};

const scale = 1; // me

const paddleWidth = 15 * scale;
const paddleHeight = 150 * scale;
const ballSize = 15 * scale;

let leftPaddle = {
	x: 0, 
	y: canvas.height / 2 - paddleHeight / 2, 
	dy: 0 
};
let rightPaddle = { 
	x: canvas.width - paddleWidth, 
	y: canvas.height / 2 - paddleHeight / 2, 
	dy: 0
};
let ball = { 
	x: canvas.width / 2, 
	y: canvas.height / 2, 
	dx: 4,
	dy: 4
};

const speed = 5; // paddle dy

function movePaddles() {
	leftPaddle.y += leftPaddle.dy;
	rightPaddle.y += rightPaddle.dy;

	if (leftPaddle.y < 0) leftPaddle.y = 0;
	if (leftPaddle.y + paddleHeight > canvas.height) leftPaddle.y = canvas.height - paddleHeight;
	if (rightPaddle.y < 0) rightPaddle.y = 0;
	if (rightPaddle.y + paddleHeight > canvas.height) rightPaddle.y = canvas.height - paddleHeight;
}

function moveBall() {
	ball.x += ball.dx;
	ball.y += ball.dy;

	if (ball.y <= 0 || ball.y + ballSize >= canvas.height) {
		ball.dy = -ball.dy;
	}

	if (
		(ball.x <= leftPaddle.x + paddleWidth && ball.x >= leftPaddle.x &&
		ball.y + ballSize >= leftPaddle.y && ball.y <= leftPaddle.y + paddleHeight) ||
		(ball.x + ballSize >= rightPaddle.x && ball.x + ballSize <= rightPaddle.x + paddleWidth &&
		ball.y + ballSize >= rightPaddle.y && ball.y <= rightPaddle.y + paddleHeight)
	)
	{
		ball.dx = -ball.dx;
	}

	if (ball.x < 0 || ball.x > canvas.width) {

		// score
		if (ball.x < 0)
			console.log(colors.magenta, "1 point for right");
		else
			console.log(colors.magenta, "1 point for left");

		ball.x = canvas.width / 2;
		ball.y = canvas.height / 2;
		ball.dx = 4;
		ball.dy = 4;
	}
}

// UPDATE POSITIONS
async function update() {
	movePaddles();
	moveBall();
}

// // UPDATES NUMBER FOR THE LAST SECOND
// let initValue = 0;
// let	array = [];
// const loop = setInterval(() => {
// 	console.log(colors.cyan, `${statsCounter - initValue} updates per last second`);
// 	// array.push(statsCounter - initValue);
// 	// console.log(colors.cyan, `Average: ${array.reduce((a, b) => a + b, 0) / array.length} updates per second`);
// 	initValue = statsCounter;
// }, 1000);

let statsCounter = 1;
export const gameLoop = async () => {

	// console.debug(colors.yellow, `--- Game State ${statsCounter} ---`);
	// console.debug(colors.yellow, "Right Paddle: ", rightPaddle);
	// console.debug(colors.yellow, "Left Paddle: ", leftPaddle);

	await update();
	statsCounter++;
	setTimeout(gameLoop, (1 / 60) * 1000); // 60 updates per second
};

// start
function startGame() {
	let countdown = 3;
	const countdownInterval = setInterval(() => {
		console.log(colors.cyan, `Starting in ${countdown}...`);
		countdown--;

		if (countdown < 0) {
			clearInterval(countdownInterval);
			console.info(colors.green, "Game started!");

			client1.send("2");
			client2.send("2");
			
			gameLoop();
		}
	
	}, 1000);
}
