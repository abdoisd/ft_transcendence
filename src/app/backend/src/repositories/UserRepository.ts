import userDao from "../data access layer/daos/UserDao.ts";


export default class UserRepository {

    static getUsers = async (currentUserId: number) => {
        return await userDao.getAllUsers(currentUserId);
    }

    static getUser = async (id: number) => {
        return await userDao.getUser(id);
    }

    static getDidBlock = async (id1: number, id2: number) => {
        const record = await userDao.getBlockedUser(id1, id2);
        return record != null;
    }

    static toggleUserBlock = async (id1: number, id2: number) => {
        const record = await userDao.getBlockedUser(id1, id2);
        if (record)
        {
            await userDao.deleteBlockedUser(record.id);
            return {
                is_blocked: false
            };
        }
        await userDao.insertBlockedUser(id1, id2);
        return {
            is_blocked: true
        };
    }
    
}