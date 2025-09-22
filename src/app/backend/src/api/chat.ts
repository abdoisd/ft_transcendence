import { emitMessage } from "../chat.ts";
import chatRepository from "../repositories/ChatRepository.ts";
import { server } from "../server.ts";


export default function chatApi(): void {

    server.post("/api/conversations/:id", { preHandler: server.mustHaveToken }, async (request, reply) => {
        const { id } = request.params;
        const { message, type } = request.body;
        const user = request.user;
        if ((type != "MSG" && type != "INVITE") || (type == "MSG" && (!message || message === "")))
            return (reply.code(422).send({ error: "Invalid message or type" }));
        const result = await chatRepository.storeMessage(user.Id, id, message, type);
        emitMessage(id, await chatRepository.getMessage(result.id, id));
        reply.send(result);
    });

    server.get("/api/conversations", { preHandler: server.mustHaveToken }, async (request, reply) => {
        const user = request.user;
        const result = await chatRepository.getConversations(user.Id);
        reply.send(result);
    });


    server.get("/api/messages/:id", { preHandler: server.mustHaveToken }, async (request, reply) => {
        const { id } = request.params;
        const user = request.user;
        reply.send(await chatRepository.getConversation(user.Id, id));
    });

}