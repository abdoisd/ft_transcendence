import userDao from "../data access layer/daos/UserDao.ts"
import type Conversation from "../entities/Conversation.ts";

export default class ChatRepository {

    static getUsers = async (currentUserId: number) => {
        const users = await userDao.getAllUsers(currentUserId);
        return users
    }

    static getUser = async (id: number) => {
        return await userDao.getUser(id);
    }


    static getConversations = async (userId: number) => {
        const conversations = await userDao.getConversationByUserId(userId);
        return conversations.map((c) => {
            return this.conversationMapper(c, userId);
        })
    }


    static getConversation = async (id: number, userId: number) => {
        const conversation = await userDao.getConversation(id);
        return this.conversationMapper(conversation, userId)
    }


    static conversationMapper = (c: Conversation, userId: number) => {
        return {
            id: c.id,
            user: c.firstUser.id === userId ? c.secondUser : c.firstUser
        };
    }


}