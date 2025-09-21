import { emitMessage } from "../chat.ts";
import chatRepository from "../repositories/ChatRepository.ts";
import { server } from "../server.ts";


export default function chatApi(): void {

    server.post("/api/chats/:id", { preHandler: server.mustHaveToken }, async (request, reply) => {
        const { id } = request.params;
        const { message } = request.body;
        const user = request.user;
        if (!message || message === "")
            return (reply.code(422).send({ error: "Invalid message" }));
        const result = await chatRepository.storeMessage(user.Id, id, message);
        emitMessage(id, user.Id);
        reply.send(result);
    });


    server.get("/api/messages/:id", { preHandler: server.mustHaveToken }, async (request, reply) => {
        const { id } = request.params;
        const user = request.user;
        reply.send(await chatRepository.getConversation(user.Id, id));
    });

}