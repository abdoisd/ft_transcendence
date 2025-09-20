import chatRepository from "../repositories/ChatRepository.ts";
import { server } from "../server.ts";


export default function chatApi(): void {

    server.get("/api/users", { preHandler: server.mustHaveToken }, async (request, reply) => {
        let users = await chatRepository.getUsers();
        reply.send(users);
    });

}