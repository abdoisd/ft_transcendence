import userRepository from "../repositories/UserRepository.ts";
import { server } from "../server.ts";

export default function userApi(): void {

    server.get("/api/users", { preHandler: server.mustHaveToken }, async (request, reply) => {
        const user = request.user;
        let users = await userRepository.getUsers(user.Id);
        reply.send(users);
    });


    server.get("/api/users/:id", { preHandler: server.mustHaveToken }, async (request, reply) => {
        const { id } = request.params;
        const me = request.user;
        const user = await userRepository.getUser(id);
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

    server.post("/api/users/:id/block", { preHandler: server.mustHaveToken }, async (request, reply) => {
        const user = request.user;
        const { id } = request.params;

        reply.send(await userRepository.toggleUserBlock(user.Id, id));
    });

}