import userDao from "../data access layer/daos/UserDao.ts"

export default class ChatRepository {

    static getUsers = async (currentUserId: number) => {
        const users = await userDao.getAllUsers(currentUserId);
        return users
    }

    static getConversations = async (userId: number) => {
        const conversations = await userDao.getConversations(userId);
        return conversations
    }

}