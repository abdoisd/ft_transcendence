import chatDao from "../data access layer/daos/ChatDao.ts"
import type Message from "../entities/Message.ts";
import { emitMessage } from "../chat.ts";

export default class ChatRepository {

    static storeMessage = async (me: number, receiverId: number, message: string, type: string) => {
        const id = await chatDao.storeMessage(me, receiverId, message, type);
        if (!id)
            return null;
        const result = this.messageMapper(await chatDao.getMessage(id), me);
        emitMessage(receiverId, await this.getMessage(result.id, receiverId));
        return result;
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


    static acceptInviteChecker = async (msgId: number, meId: number) => {
        const msg = await chatDao.getMessage(msgId);
        if (!msg)
            throw new Error("NO_MSG_FOUND");
        const result = this.messageMapper(await chatDao.getMessage(msgId), meId);
        if (result.receiver.id != meId)
            throw new Error("FORBIDDEN");
        if (result.type != "INVITE")
            throw new Error("NOT VALID");
        return result;
    }


    static messageMapper = (message: Message | null, me: number) => {
        if (!message)
            return null;
        const meSender = message.sender.id === me;
        return {
            id: message.id,
            type: message.type,
            message: message.message,
            sender_is_me: meSender,
            sender_id: message.sender.id,
            created_at: message.createdAt,
            sender: message.sender,
            receiver: message.receiver
        };
    }
}