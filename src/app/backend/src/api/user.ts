import { TOURNAMENT_ID } from "../data access layer/user.ts";
import userRepository from "../repositories/UserRepository.ts";
import { server } from "../server.ts";

export default function userApi(): void {

    const requiredIdSchema = {
        params: {
            type: 'object',
            properties: {
                id: { type: 'integer' }
            },
            required: ['id']
        }
    };

    server.get("/api/users", { preHandler: server.mustHaveToken }, async (request, reply) => {
        const user = request.user;
        let users = await userRepository.getUsers(user.Id);
        reply.send(users);
    });

    server.get("/api/users/:id", { preHandler: server.mustHaveToken, schema: requiredIdSchema }, async (request, reply) => {
        const { id } = request.params;
        const me = request.user;
        
        const user = await userRepository.getUser(id);
        
        if (!user)
            return (reply.status(404).send({ error: "User not found" }));

        const didBlock = await userRepository.getDidBlock(me.Id, id);
        const imBlocked = await userRepository.getDidBlock(id, me.Id);

        reply.send(
            {
                id: user.id,
                username: user.username,
                avatar: user.avatar,
                blocked: didBlock,
                im_blocked: imBlocked
            }
        );
    });

    server.post("/api/users/:id/block", { preHandler: server.mustHaveToken, schema: requiredIdSchema }, async (request, reply) => {
        const user = request.user;
        const { id } = request.params;

        if (id == TOURNAMENT_ID)
            return (reply.status(400).send({ error: "You can't block this user!" }));

        if (id == user.Id)
            return (reply.status(400).send({ error: "You can't block yourself" }));

        if (!(await userRepository.getUser(id)))
            return (reply.status(400).send({ error: "User not found" }));

        reply.send(await userRepository.toggleUserBlock(user.Id, id));
    });

}
