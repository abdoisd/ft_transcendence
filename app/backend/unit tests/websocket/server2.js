import { WebSocketServer } from "ws";
const colors = {
	red:		"\x1b[31m%s\x1b[0m",
	green:		"\x1b[32m%s\x1b[0m",
	yellow:		"\x1b[33m%s\x1b[0m",
	blue:		"\x1b[34m%s\x1b[0m",
	magenta:	"\x1b[35m%s\x1b[0m",
	cyan: 		"\x1b[36m%s\x1b[0m"
};

// server
const wss = new WebSocketServer({ host: "0.0.0.0", port: 3000 });
console.log("WebSocket server running on ws://localhost:3000");

let clients = [];

// new client
wss.on("connection", (ws) => {

	if (clients.length == 2)
		return ;
	
	ws.id = clients.length;
	clients.push(ws);

	// msg of type buffer
	ws.on('message', msg => {
		console.info(colors.green, `Received message: ${msg} from client ${ws.id}`);

		clients.forEach((client) => {
			if (client.id != ws.id)
			{
				console.debug(colors.yellow, `sending it to client ${client.id}`);
				client.send(msg.toString());
				return ;
			}
		})
	})

	// console.debug(colors.cyan, "On connection event in the server");
	console.info(colors.green, `New client connected: ${ws.id}`);
	
	ws.on("close", () => {
		console.debug(colors.red, "On close event in the server");
	});

});
