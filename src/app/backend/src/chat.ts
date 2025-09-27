import { server, ws } from "./server.ts";
import { userIdUserId } from "./webSocket.ts";
import ChatRepository from "./repositories/ChatRepository.ts"

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

        if (users[socket.userId])
        {
            io.sockets.get(users[socket.userId]).disconnect();
        }
        users[socket.userId] = socket.id;

        socket.on('disconnect', () => {
            console.log(`${socket.userId} disconnect`);

            delete users[socket.userId];
        });

        socket.on('check-invite', async (msgId) => {
            try {
                const result = await ChatRepository.acceptInviteChecker(msgId, socket.userId);
                emitMessageWithType(result.sender_id, "check-game", "");
                userIdUserId.set(socket.userId, result.sender_id);
                userIdUserId.set(result.sender_id, socket.userId);
            } catch (err) {
                console.log(err);
            }
        });

        socket.on("ready", (status) => {
            if (status) {
                emitMessageWithType(socket.userId, "start", "");
                emitMessageWithType(userIdUserId.get(socket.userId), "start", "");
            } else {
                userIdUserId.delete(userIdUserId.get(socket.userId));
                userIdUserId.delete(socket.userId);
            }
        });
    });
}

export const emitMessage = (userId: number, msg) => {
    const io = ws.of("/chat");

    if (!users[userId])
        return ;
    io.to(users[userId]).emit("msg", msg);
}

export const emitMessageWithType = (userId: number, msgType: string, msg) => {
    const io = ws.of("/chat");

    if (!users[userId])
        return false;
    io.to(users[userId]).emit(msgType, msg);
    return true;
}
