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

    static getMessage = async (id: number, userId: number) => {
        const msg = await chatDao.getMessage(id);
        return this.messageMapper(msg, userId);
    }

    static getConversation = async (first: number, second: number) => {
        const conversations = await chatDao.getConversation(first, second);
        return conversations.map((e) => {
            return this.messageMapper(e, first)
        });
    }


    static getConversations = async (userId: number) => {
        const conversations = await chatDao.getConversations(userId);
        return conversations.map((e) => {
            return this.messageMapper(e, userId)
        });
    }

    static messageMapper = (message: Message | null, me: number) => {
        if (!message)
            return null;
        const meSender = message.sender.id === me;
        return {
            id: message.id,
            message: message.message,
            sender_is_me: meSender,
            sender_id: message.sender.id,
            created_at: message.createdAt,
            sender: message.sender,
            receiver: message.receiver
        };
    }
}