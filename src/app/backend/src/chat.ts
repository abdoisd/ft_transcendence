import { server, ws } from "./server.ts";

let users = {};

export const chatWs = () => {
    const io = ws.of("/chat");

    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token)
            return next(new Error('Authentication error: No token provided'));
        try {
            const payload = server.jwt.verify(token);
            socket.userId = payload.Id;
            return next();
        } catch {
            return next(new Error('Authentication error: token invalid'));
        }
    });

    io.on("connection", (socket) => {
        console.log(`${socket.userId} connected`);
        users[socket.userId] = socket.id;

        socket.on('disconnect', () => {
            console.log(`${socket.userId} disconnect`);

            delete users[socket.userId];
        });
    });
}

export const emitMessage = (userId: number, msg) => {
    const io = ws.of("/chat");

    if (!users[userId])
        return ;
    io.to(users[userId]).emit("msg", msg);
}