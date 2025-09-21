import userRepository from "../repositories/UserRepository.ts";
import { server } from "../server.ts";

export default function userApi(): void {

    server.get("/api/users", { preHandler: server.mustHaveToken }, async (request, reply) => {
        const user = request.user;
        let users = await userRepository.getUsers(user.Id);
        reply.send(users);
    });

}