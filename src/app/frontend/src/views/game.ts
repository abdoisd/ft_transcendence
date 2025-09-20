import { UserDTO } from "../business layer/user";

import { tournamentGameViewStaticPart } from "./gameViews";
import { Three3DGameViewStaticPart } from "./gameViews";
import { remoteGameViewStaticPart } from "./gameViews";
import { gameModesViewStaticPart } from "./gameViews";
import { aiGameViewStaticPart } from "./gameViews";
import { apiGameStaticPart } from "./gameViews";
import { ClientGame } from "./gameViews";
import { init3DGame } from "./gameViews";
import { setScores } from "./gameViews"; 
import { io } from "socket.io-client";
import { gameOverViewStaticPart } from "./gameViews";
import { opponentLeftGame } from "./gameViews";
import { tournamentOverview } from "./gameViews";
import { voidedTournament } from "./gameViews";

export function GameModesView() {
	if (!window.gameManager)
		window.gameManager = new GameManager();
	document.getElementById("main-views")!.innerHTML = gameModesViewStaticPart;
}

export function gameOverView(winner, loser) {
	document.getElementById("main-views")!.innerHTML = gameOverViewStaticPart(winner, loser);
	const gameModesBtn = document.querySelector(".game-modes");
	gameModesBtn?.addEventListener("click", GameModesView);
}
window.gameOverView = gameOverView;

function aiView() {
	document.getElementById("main-views")!.innerHTML = aiGameViewStaticPart;
	const startAiGameBtn = document.querySelector(".start-ai-game");
	startAiGameBtn?.addEventListener("click", (event) => {
		event.target.style.display = "none";
		aiGame();
	});
}
window.aiView = aiView;

function aiGame() {
	const canvas = document.querySelector(".canvas");
	const ctx = canvas.getContext("2d");
	const board = document.querySelector(".board");
	const rect = board.getBoundingClientRect();
	canvas.width = rect.width;
	canvas.height = rect.height;

	const wsClientAI = io("/ai");

	let game = null;
	wsClientAI.on("start-game", (initialState) => {		
		setScores(0, 0);
		game = new ClientGame(canvas, ctx, initialState.players[0], initialState.players[1], wsClientAI);
		game.state = initialState;
		game.draw();
	});
	wsClientAI.on("game-state", state => {
		if (game) {
			game.state = state;
			if (game.looping)
				game.draw();
		}
	});
	wsClientAI.on("score-state", score => {
		setScores(score.left, score.right);
	})
	wsClientAI.on("new-winner", winner => {
		console.log("The winner: ", winner);
		window.removeEventListener("keydown", keyDown);
		window.removeEventListener("keyup", keyUp);
		gameOverView(winner, winner === "left"? "right" : "left");
	})

	function movePaddleAI(event, state) {
		const validKeys = ["ArrowUp", "ArrowDown", "w", "s"];
		if (validKeys.includes(event.key))
			wsClientAI.emit("paddle-move", {key: event.key, pressedState: state});
	}

	function keyDown(event) {
		movePaddleAI(event, true);
		console.log("TRIGGERED");
	}
	function keyUp(event) {
		movePaddleAI(event, false);
		console.log("TRIGGERED");
	}

	window.gameManager.setActiveGame("ai", wsClientAI, {keyDown, keyUp});
}

function three3DView() {
	document.getElementById("main-views")!.innerHTML = Three3DGameViewStaticPart;
	const start3DgameBtn = document.querySelector(".start-3d-game");
	start3DgameBtn?.addEventListener("click", (event) => {
		event.target.style.display = "none";
		const game = init3DGame();

		function keyDown(event) {
			if (event.key in game.pressedKeys)
				game.pressedKeys[event.key] = true;
		}
		function keyUp(event) {
			if (event.key in game.pressedKeys)
				game.pressedKeys[event.key] = false;
		}
		window.gameManager.setActiveGame("3d", null, {keyDown, keyUp}, game.engine);
		game.start();
	});
}
window.three3DView = three3DView;

function remoteView() {
	document.getElementById("main-views")!.innerHTML = remoteGameViewStaticPart;
	const startRemoteGameBtn = document.querySelector(".start-remote-game");
	startRemoteGameBtn?.addEventListener("click", (event) => {
		event.target.style.display = "none";
		remoteGame();
	});
}
window.remoteView = remoteView;

function remoteGame() {
	const canvas = document.querySelector(".canvas");
	const ctx = canvas.getContext("2d");
	const board = document.querySelector(".board");
	const rect = board.getBoundingClientRect();
	canvas.width = rect.width;
	canvas.height = rect.height;

	const wsClientRemote = io("/remote");
	wsClientRemote.emit("join-game", {userId: clsGlobal.LoggedInUser.Id});

	let game = null;
	wsClientRemote.on("start-game", async (initialState) => {

		const p1 = document.querySelector(".p1");
		const p2 = document.querySelector(".p2");

		console.log(initialState)

		p1.textContent = (await UserDTO.getById(initialState.leftId)).Username;
		p2.textContent = (await UserDTO.getById(initialState.rightId)).Username;

		setScores(0, 0);
		game = new ClientGame(canvas, ctx, initialState.players[0], initialState.players[1], wsClientRemote);
		game.state = initialState;
		game.draw();

		game.usernames = {_1: p1.textContent, _2: p2.textContent};
	});

	wsClientRemote.on("game-state", state => {
		if (game) {
			game.state = state;
			if (game.looping)
				game.draw();
		}
	});
	wsClientRemote.on("score-state", (score) => {
		setScores(score.left, score.right);
	})
	wsClientRemote.on("new-winner", async winnerId => {
		// gameOverView(winner, winner === "left"? "right" : "left");

		console.log("Winner ID: ", winnerId);
		const winner = (await UserDTO.getById(winnerId)).Username;

		console.log("The winner: ", winner);

		gameOverView(winner, (winner == game.usernames._1) ? game.usernames._2 : game.usernames._1);
		
		window.gameManager.leaveActiveGame();
	})
	wsClientRemote.on("opponent-left", () => {
		game.looping = false;
		window.gameManager.leaveActiveGame();

		opponentLeftGame();
	});

	function movePaddleAI(event, state) {
		const validKeys = ["ArrowUp", "ArrowDown", "w", "s"];
		if (validKeys.includes(event.key))
			wsClientRemote.emit("paddle-move", {key: event.key, pressedState: state});
	}
	function keyDown(event) {
		movePaddleAI(event, true);
	}
	function keyUp(event) {
		movePaddleAI(event, false);
	}

	window.gameManager.setActiveGame("remote", wsClientRemote, {keyDown, keyUp});
}

function apiView() {
	document.getElementById("main-views")!.innerHTML = apiGameStaticPart;
	const startApiGameBtn = document.querySelector(".start-api-game");
	startApiGameBtn?.addEventListener("click", (event) => {
		event.target.style.display = "none";
		apiGame();
	});
}
window.apiView = apiView;

async function apiGame() {
	let response = await fetch("/api-game/init")
	let data = await response.json();
	const gameId = data.gameId;

	response = await fetch(`/api-game/start/${gameId}`);
	data = await response.json();
	console.log(data.gameId);

	const canvas = document.querySelector(".canvas");
	const ctx = canvas.getContext("2d");
	const board = document.querySelector(".board");
	const rect = board.getBoundingClientRect();
	canvas.width = rect.width;
	canvas.height = rect.height;
	setScores(0, 0);

	let game = null;
	game = new ClientGame(canvas, ctx, data.gameState.players[0], data.gameState.players[1]);
	game.state = data.gameState;
	game.gameId = gameId;
	game.draw();

	function movePaddleApi(event, state) {
		const validKeys = ["ArrowUp", "ArrowDown", "w", "s"];
		if (!validKeys.includes(event.key))
			return;
		let player = ["ArrowUp", "ArrowDown"].includes(event.key) ? "right" : "left";
		let move = ["ArrowUp", "w"].includes(event.key) ? "up" : "down";
		move = state == "none" ? state : move;
		fetch(`/api-game/${gameId}/${player}/${move}`, {method: "POST"});
	}

	function keyDown(event) {
		movePaddleApi(event, "pressed");
	}
	function keyUp(event) {
		movePaddleApi(event, "none");
	}

	document.addEventListener("keydown", keyDown);
	document.addEventListener("keyup", keyUp);

	const interval = setInterval(async () => {
		const response = await fetch(`/api-game/state/${game.gameId}`);
		const data = await response.json();

		game.state = data.gameState;
		if (data.gameState.status) {
			game.draw();
			setScores(data.gameState.scores.left, data.gameState.scores.right)
		}
		else {
			console.log("GAME ENDED");
			clearInterval(interval);
		}
	}, 16);
}

function tournamentView() {
	document.getElementById("main-views")!.innerHTML = tournamentGameViewStaticPart;
	const startTournamentGameBtn = document.querySelector(".start-tournament-game");
	startTournamentGameBtn?.addEventListener("click", (event) => {
		event.target.style.display = "none";
		tournamentGame();
	});
}
window.tournamentView = tournamentView;

function tournamentGame() {
	const canvas = document.querySelector(".canvas");
	const ctx = canvas.getContext("2d");
	const board = document.querySelector(".board");
	const rect = board.getBoundingClientRect();
	canvas.width = rect.width;
	canvas.height = rect.height;

	const wsClientTournament = io("/tournament");
	wsClientTournament.emit("join-tournament", {userId: clsGlobal.LoggedInUser.Id});

	let game = null;
	wsClientTournament.on("start-game", (initialState) => {
		setScores(0, 0);
		game = new ClientGame(canvas, ctx, initialState.players[0], initialState.players[1]);
		game.state = initialState;
		game.draw();
	});
	wsClientTournament.on("game-state", state => {
		if (game) {
			game.state = state;
			if (game.looping)
				game.draw();
		}
	});
	wsClientTournament.on("score-state", (score) => {
		setScores(score.left, score.right);
	})
	wsClientTournament.on("winner", (data) => {
		tournamentOverview(data);
	})
	wsClientTournament.on("void", () => {
		game.looping = false;
		window.gameManager.leaveActiveGame();
		voidedTournament();
	});

	function movePaddleTournament(event, state) {
		const validKeys = ["ArrowUp", "ArrowDown", "w", "s"];
		if (validKeys.includes(event.key))
			wsClientTournament.emit("paddle-move", {key: event.key, pressedState: state});
	}
	function keyDown(event) {
		movePaddleTournament(event, true);
	}
	function keyUp(event) {
		movePaddleTournament(event, false);
	}

	window.gameManager.setActiveGame("tournament", wsClientTournament, {keyDown, keyUp});
}

class GameManager {
	activeGame: null | "ai" | "remote" | "tournament" | "3d" = null;
	activeSocket: null | any = null;
	keyListeners: {keyDown?: EventListener, keyUp?: EventListener} = {};
	engine: any | null;

	setActiveGame(game: "ai" | "remote" | "tournament" | "3d", socket: any, listeners: {keyDown: EventListener, keyUp: EventListener}, engine: any) {
		this.leaveActiveGame();

		this.activeGame = game;
		this.activeSocket = socket;
		this.keyListeners = listeners;

		if (listeners.keyDown)
			window.addEventListener("keydown", listeners.keyDown);
		if (listeners.keyUp)
			window.addEventListener("keyup", listeners.keyUp);

		this.engine = engine;
	}

	leaveActiveGame() {
		if (this.activeSocket) {
			this.activeSocket.disconnect();
			this.activeSocket = null;
			console.log("here we go AGAIN");
		}

		if (this.keyListeners.keyDown)
			window.removeEventListener("keydown", this.keyListeners.keyDown);
		if (this.keyListeners.keyUp)
			window.removeEventListener("keyup", this.keyListeners.keyUp);

		if (this.engine) {
			this.engine.stopRenderLoop();
		}

		this.keyListeners = {};
		this.activeGame = null;
	}
}
