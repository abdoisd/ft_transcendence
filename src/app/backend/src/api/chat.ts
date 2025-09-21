import chatRepository from "../repositories/ChatRepository.ts";
import { server } from "../server.ts";


export default function chatApi(): void {

    server.get("/api/users", { preHandler: server.mustHaveToken }, async (request, reply) => {
        const user = request.user;
        let users = await chatRepository.getUsers(user.Id);
        console.log(users)
        reply.send(users);
    });


    server.get("/api/conversations", { preHandler: server.mustHaveToken }, async (request, reply) => {
        const user = request.user;
        let conversations = await chatRepository.getConversations(user.Id);
        console.log(conversations)
        reply.send(conversations);
    });

}