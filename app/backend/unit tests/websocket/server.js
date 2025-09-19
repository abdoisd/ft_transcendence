const colors = {
	red: "\x1b[31m%s\x1b[0m",
	green: "\x1b[32m%s\x1b[0m",
	yellow: "\x1b[33m%s\x1b[0m",
	blue: "\x1b[34m%s\x1b[0m",
	magenta: "\x1b[35m%s\x1b[0m",
	cyan: "\x1b[36m%s\x1b[0m"
};

import { WebSocketServer } from "ws";
const wss = new WebSocketServer({ host: "0.0.0.0", port: 3000 });

// defines a handler for each client connection
// I have 2 clients, and I need to know them so I can send messages to them
wss.on("connection", (ws) => {

	console.debug(colors.cyan, "On connection event in the server");
	console.info(colors.green, `New client connected: ${ws.id}`);

	ws.on('message', msg => {
		console.debug(colors.cyan, "On message event in the server");
		console.info(colors.green, `Received message: ${msg}`);
	})

	ws.on("close", () => {
		console.debug(colors.red, "On close event in the server");
	});
});

console.log("WebSocket server running on ws://localhost:3000");
