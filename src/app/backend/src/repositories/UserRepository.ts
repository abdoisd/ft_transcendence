import userDao from "../data access layer/daos/UserDao.ts";



export default class UserRepository {

    static getUsers = async (currentUserId: number) => {
        return await userDao.getAllUsers(currentUserId);
    }


    static getUser = async (id: number) => {
        return await userDao.getUser(id);
    }
    
}