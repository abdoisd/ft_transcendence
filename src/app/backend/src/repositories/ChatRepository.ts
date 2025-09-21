import userDao from "../data access layer/daos/UserDao.ts"
import chatDao from "../data access layer/daos/ChatDao.ts"

export default class ChatRepository {

    static storeMessage = async (senderId: number, receiverId: number, message: string) => {
        const id = await chatDao.storeMessage(senderId, receiverId, message);
        if (!id)
            return null
        return await chatDao.getMessage(id);
    }

}