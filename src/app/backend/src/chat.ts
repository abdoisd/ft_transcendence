import { server, ws } from "./server.ts";
import { playingUsersId } from "./webSocket.ts";
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
        users[socket.userId] = socket.id;

        socket.on('disconnect', () => {
            console.log(`${socket.userId} disconnect`);

            delete users[socket.userId];
        });

        socket.on('server-accepted-game', (msg) => {

            try
            {
                const result = ChatRepository.acceptInviteChecker(msg, socket.userId);

                // if s or r in array
                if (playingUsersId.has(socket.userId) || playingUsersId.has(result.sender.id))
                {
                    return ;
                }

                emitMessageWithType(socket.userId, "yes", "");
                emitMessageWithType(result.sender.id, "yes", "");
                userIdUserId.set(socket.userId, result.sender.id);
                userIdUserId.set(result.sender.id, socket.userId);

            }
            catch (err)
            {
                
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

// new
export const emitMessageWithType = (userId: number, msgType: string, msg) => {
    const io = ws.of("/chat");

    if (!users[userId])
        return false;
    io.to(users[userId]).emit(msgType, msg);
    return true;
}
// new
