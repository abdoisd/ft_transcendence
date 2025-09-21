import userDao from "../data access layer/daos/UserDao.ts"

export default class ChatRepository {

    static getUsers = async (currentUserId: number) => {
        const users = await userDao.getAllUsers(currentUserId);
        return users
    }

    static getUser = async (id: number) => {
        return await userDao.getUser(id);
    }


    static getConversations = async (userId: number) => {
        const conversations = await userDao.getConversations(userId);
        return conversations
    }

    static getConversation = async (userId: number, otherId: number) => {
       return await userDao.getConversationId(userId, otherId);
    }

}