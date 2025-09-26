import chatRepository from "../repositories/ChatRepository.ts";
import userRepository from "../repositories/UserRepository.ts";
import { server } from "../server.ts";


export default function chatApi(): void {

    server.post("/api/conversations/:id", { preHandler: server.mustHaveToken }, async (request, reply) => {
        const { id } = request.params;
        const body = request.body;

        if (!body || !id)
            return (reply.code(422).send({ error: "Invalid input" }));

        const { message, type } = body;
        const user = request.user;

        if ((type != "MSG" && type != "INVITE") || (type == "MSG" && (!message || message === "")))
            return (reply.code(422).send({ error: "Invalid message or type" }));

        if (!(await userRepository.getUser(id)) || !(await userRepository.canSendMessage(user.Id, id)))
            return (reply.code(400).send({ error: "You can't send messages to this user!" }));

        const result = await chatRepository.storeMessage(user.Id, id, message, type);

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
        if (!id)
            return reply.send([]);
        reply.send(await chatRepository.getConversation(user.Id, id));
    });

}