import type Conversation from "../../entities/Conversation.ts";
import type User from "../../entities/User.ts";
import { db } from "../database.ts"

export default class UserDao {

    static getUser = async (id: number) => new Promise<User>((resolve, reject) => {
        let sql = `SELECT * FROM Users WHERE Id == ? LIMIT 1`;

        return db.get(sql, [id], function (err, row) {
            if (err)
                return reject(err.message);
            return resolve(
                {
                    id: row.Id,
                    username: row.Username,
                    avatar: row.AvatarPath,
                }
            );
        });
    });


    static getAllUsers = async (currentUserId: number) => new Promise<User[]>((resolve, reject) => {
        let sql = `SELECT * FROM Users WHERE Id != ?`;

        return db.all(sql, [currentUserId], function (err: { message: any; }, res: any[]) {
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


    static getConversations = async (userId: number) => new Promise<Conversation[]>((resolve, reject) => {
        // let sql = `SELECT * FROM conversations WHERE id = first_user_id = ? OR WHERE second_user_id = ?`;

        // return db.all(sql, [userId, userId], function (err: { message: any; }, res: any[]) {
        //     if (err)
        //         return reject(err.message);
        //     const users: User[] = res.map((row: any) => ({
        //         id: row.Id,
        //         username: row.Username,
        //         avatar: row.AvatarPath,
        //     }));
        //     return resolve(users);
        // });
    });


    static getConversationId = async (userId: number, otherId: number) => new Promise<number | null>((resolve, reject) => {
        let sql = `
            SELECT c.*, u1.*, u2.* FROM conversations c
            LEFT JOIN users u1 ON c.first_user_id = u1.id
            LEFT JOIN users u2 ON c.second_user_id = u2.id
            WHERE (first_user_id = ? AND second_user_id = ?) 
            OR (first_user_id = ? AND second_user_id = ?)
            LIMIT 1
        `;
        return db.get(sql, [userId, otherId, otherId, userId], function (err, res) {
            if (err) {
                console.log("=> " + err.message)
                return reject(err.message);

            }
            console.log("=> " + JSON.stringify(res))
            return resolve(res?.id);
        });
    });

}