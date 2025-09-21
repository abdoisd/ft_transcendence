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
import { wrap } from "module";

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
	wsClientAI.emit("join-game", {userId: clsGlobal.LoggedInUser.Id})

	let game = null;
	wsClientAI.on("start-game", (initialState) => {		
		setScores(0, 0); // maybe unecessary because maybe game modes gives these elements 0 by default
		game = new ClientGame(canvas, ctx, initialState.ids.left, initialState.ids.right);
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
	wsClientAI.on("score-state", async (scores) => {
		const entries = Object.entries(scores);
		const leftUsername = (await UserDTO.getById(Number(entries[0][0]))).Username;
		setScores(entries[0][1], entries[1][1], leftUsername, "AI");
	})
	wsClientAI.on("new-winner", async (scores) => {
		const entries = Object.entries(scores) as [string, number][];
		const leftUsername = (await UserDTO.getById(Number(entries[0][0]))).Username;
		const winnerName = entries[0][1] > entries[1][1] ? leftUsername : "AI";
		const loserName = winnerName === "AI" ? leftUsername : "AI";
		gameOverView(winnerName, loserName);
		window.gameManager.leaveActiveGame();
	})

	function keyDown(event) {
		const validKeys = ["ArrowUp", "ArrowDown", "w", "s"];
		if (validKeys.includes(event.key)) {
			wsClientAI.emit("move-paddle", {key: event.key, pressedState: true});
		}
	}
	function keyUp(event) {
		const validKeys = ["ArrowUp", "ArrowDown", "w", "s"];
		if (validKeys.includes(event.key)) {
			wsClientAI.emit("move-paddle", {key: event.key, pressedState: false});
		}
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
	wsClientRemote.on("start-game", (initialState) => {
		game = new ClientGame(canvas, ctx, initialState.ids.left, initialState.ids.right);
		game.state = initialState;
		game.draw();
	});
	wsClientRemote.on("game-state", state => {
		if (game) {
			game.state = state;
			if (game.looping)
				game.draw();
		}
	});
	wsClientRemote.on("score-state", async (scores) => {
		const entries = Object.entries(scores) as [string, number][];
		const leftUsername = (await UserDTO.getById(Number(entries[0][0]))).Username;
		const rightUsername = (await UserDTO.getById(Number(entries[1][0]))).Username;
		setScores(entries[0][1], entries[1][1], leftUsername, rightUsername);
	});
	wsClientRemote.on("new-winner", async (scores) => {
		const entries = Object.entries(scores) as [string, number][];
		const leftUsername = (await UserDTO.getById(Number(entries[0][0]))).Username;
		const rightUsername = (await UserDTO.getById(Number(entries[1][0]))).Username;
		const winnerName = entries[0][1] > entries[1][1] ? leftUsername : rightUsername;
		const loserName = winnerName == leftUsername ? rightUsername : leftUsername;
		gameOverView(winnerName, loserName);
		window.gameManager.leaveActiveGame();
	});
	wsClientRemote.on("opponent-left", () => {
		game.looping = false;
		window.gameManager.leaveActiveGame();
		opponentLeftGame();
	});

	function keyDown(event) {
		const validKeys = ["ArrowUp", "ArrowDown", "w", "s"];
		if (validKeys.includes(event.key)) {
			wsClientRemote.emit("paddle-move", {key: event.key, pressedState: true});
		}
	}
	function keyUp(event) {
		const validKeys = ["ArrowUp", "ArrowDown", "w", "s"];
		if (validKeys.includes(event.key)) {
			wsClientRemote.emit("paddle-move", {key: event.key, pressedState: false});
		}
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
		game = new ClientGame(canvas, ctx, initialState.ids.left, initialState.ids.right);
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
	wsClientTournament.on("score-state", async (scores) => {
		const entries = Object.entries(scores) as [string, number][];
		const leftUsername = (await UserDTO.getById(Number(entries[0][0]))).Username;
		const rightUsername = (await UserDTO.getById(Number(entries[1][0]))).Username;
		setScores(entries[0][1], entries[1][1], leftUsername, rightUsername);
	});
	wsClientTournament.on("phase", async (data) => {
		const wrapper = {
			semi1: {
				one: (await UserDTO.getById(data.semi1.one)).Username,
				two: (await UserDTO.getById(data.semi1.two)).Username,
				winner: null
			},
			semi2: {
				one: (await UserDTO.getById(data.semi2.one)).Username,
				two: (await UserDTO.getById(data.semi2.two)).Username,
				winner: null
			},
			final: {
				one: null,
				two: null,
				winner: null
			}
		};
		wrapper.semi1.winner = data.semi1.winner ? (await UserDTO.getById(data.semi1.winner)).Username : "To be announced";
		wrapper.semi2.winner = data.semi2.winner ? (await UserDTO.getById(data.semi2.winner)).Username : "To be announced";
		
		wrapper.final.one = data.final.one ? (await UserDTO.getById(data.final.one)).Username : "To be announced";
		wrapper.final.two = data.final.two ? (await UserDTO.getById(data.final.two)).Username : "To be announced";
		wrapper.final.winner = data.final.winner ? (await UserDTO.getById(data.final.winner)).Username : "To be announced";
		tournamentOverview(data.status, wrapper, data.final.winner);
	});
	wsClientTournament.on("void", () => {
		game.looping = false;
		window.gameManager.leaveActiveGame();
		voidedTournament();
	});

	function keyDown(event) {
		const validKeys = ["ArrowUp", "ArrowDown", "w", "s"];
		if (validKeys.includes(event.key)) {
			wsClientTournament.emit("paddle-move", {key: event.key, pressedState: true});
		}
	}
	function keyUp(event) {
		const validKeys = ["ArrowUp", "ArrowDown", "w", "s"];
		if (validKeys.includes(event.key)) {
			wsClientTournament.emit("paddle-move", {key: event.key, pressedState: false});
		}
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
