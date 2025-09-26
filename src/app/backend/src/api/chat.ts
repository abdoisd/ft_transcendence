import chatRepository from "../repositories/ChatRepository.ts";
import userRepository from "../repositories/UserRepository.ts";
import { server } from "../server.ts";


export default function chatApi(): void {

    const postconversationSchema = {
        body: {
            type: "object",
            required: ["type", "message"],
            properties: {
                type: { type: "string", enum: ["MSG", "INVITE"] }
            }
        },
        params: {
            type: 'object',
            properties: {
                id: { type: 'integer' }
            },
            required: ['id']
        }
    };

    const getMessagesSchema = {
        params: {
            type: 'object',
            properties: {
                id: { type: 'integer' }
            },
            required: ['id']
        }
    };


    server.post("/api/conversations/:id", { preHandler: server.mustHaveToken, schema: postconversationSchema }, async (request, reply) => {
        const { id } = request.params;
        const { message, type } = request.body;

        const user = request.user;

        if (type == "MSG" && (!message || message === ""))
            return (reply.code(400).send({ error: "Invalid message" }));

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


    server.get("/api/messages/:id", { preHandler: server.mustHaveToken, schema: getMessagesSchema }, async (request, reply) => {
        const { id } = request.params;
        const user = request.user;

        reply.send(await chatRepository.getConversation(user.Id, id));
    });

}