import type User from "../../entities/User.ts";
import { db } from "../database.ts"
import { TOURNAMENT_ID } from "../user.ts";

export default class UserDao {


    static getAllUsers = async (currentUserId: number) => new Promise<User[]>((resolve, reject) => {
        let sql = `SELECT * FROM Users WHERE Id != ? AND Id != ?`;

        return db.all(sql, [currentUserId, TOURNAMENT_ID], function (err: { message: any; }, res: any[]) {
            if (err)
                return reject(err.message);
            const users: User[] = res.map((row: any) => ({
                id: row.Id,
                username: row.Username,
                avatar: row.AvatarPath,
            }));
            return resolve(users);
        });
    });


    static getUser = async (id: number) => new Promise<User | null>((resolve, reject) => {
        let sql = `SELECT * FROM Users WHERE Id == ? LIMIT 1`;

        return db.get(sql, [id], function (err, row) {
            if (err)
                return reject(err.message);
            if (!row)
                return resolve(null);
            return resolve(
                {
                    id: row.Id,
                    username: row.Username,
                    avatar: row.AvatarPath,
                }
            );
        });
    });


}