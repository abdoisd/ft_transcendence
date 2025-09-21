import userDao from "../data access layer/daos/UserDao.ts"
import chatDao from "../data access layer/daos/ChatDao.ts"
import type Message from "../entities/Message.ts";

export default class ChatRepository {

    static storeMessage = async (me: number, receiverId: number, message: string) => {
        const id = await chatDao.storeMessage(me, receiverId, message);
        if (!id)
            return null
        return this.messageMapper(await chatDao.getMessage(id), me);
    }

    static messageMapper = (message: Message | null, me: number) => {
        if (!message)
            return null;
        const meSender = message.sender.id === me;
        return {
            id: message.id,
            sender_is_me: meSender,
            other: meSender ? message.receiver : message.sender
        };
    }
}