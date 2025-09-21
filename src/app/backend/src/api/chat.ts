import chatRepository from "../repositories/ChatRepository.ts";
import { server } from "../server.ts";


export default function chatApi(): void {

    server.get("/api/users/:id", { preHandler: server.mustHaveToken }, async (request, reply) => {
        const { id } = request.params;
        let users = await chatRepository.getUser(id);
        reply.send(users);
    });

    server.get("/api/users", { preHandler: server.mustHaveToken }, async (request, reply) => {
        const user = request.user;
        let users = await chatRepository.getUsers(user.Id);
        reply.send(users);
    });

    server.get("/api/conversations", { preHandler: server.mustHaveToken }, async (request, reply) => {
        const user = request.user;
        let conversations = await chatRepository.getConversations(user.Id);
        reply.send(conversations);
    });


    server.get("/api/conversations/:id", { preHandler: server.mustHaveToken }, async (request, reply) => {
        const { id } = request.params;
        const user = request.user;
        let conversation = await chatRepository.getConversation(id, user.Id);
        reply.send(conversation);
    });
}