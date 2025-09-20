import userDao from "../data access layer/daos/UserDao.ts"


export default class ChatRepository {

    static getUsers = async () => {
        const users = await userDao.getAllUsers();
        return users
    }

}