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


    static getConversationByUserId = async (userId: number) => new Promise<Conversation[]>((resolve, reject) => {
        let sql = `
            SELECT c.*, u1.Id as first_id, u1.Username as first_username, u1.AvatarPath as first_avatar,
            u2.Id as second_id, u2.Username as second_username, u2.AvatarPath as second_avatar
            FROM conversations c
            LEFT JOIN users u1 ON c.first_user_id = u1.id
            LEFT JOIN users u2 ON c.second_user_id = u2.id
            WHERE c.first_user_id = ? OR c.second_user_id = ?
        `;

        return db.all(sql, [userId, userId], function (err: { message: any; }, res: any[]) {
            if (err)
                return reject(err.message);
            const conversations: Conversation[] = res.map((row: any) => ({
                id: row.id,
                firstUser: {
                    id: row.first_id,
                    username: row.first_useranme,
                    avatar: row.first_avatar
                },
                secondUser: {
                    id: row.second_id,
                    username: row.second_useranme,
                    avatar: row.second_avatar
                },
                lastMessage: null
            }));
            return resolve(conversations);
        });
    });


    static getConversation = async (id: number) => new Promise<Conversation>((resolve, reject) => {
        let sql = `
            SELECT c.*, u1.Id as first_id, u1.Username as first_username, u1.AvatarPath as first_avatar,
            u2.Id as second_id, u2.Username as second_username, u2.AvatarPath as second_avatar
            FROM conversations c
            LEFT JOIN users u1 ON c.first_user_id = u1.id
            LEFT JOIN users u2 ON c.second_user_id = u2.id
            WHERE c.id = ? LIMIT 1
        `;
        return db.get(sql, [id], function (err, row) {
            if (err)
                return reject(err.message);
            return resolve(
                {
                    id: row.id,
                    firstUser: {
                        id: row.first_id,
                        username: row.first_useranme,
                        avatar: row.first_avatar
                    },
                    secondUser: {
                        id: row.second_id,
                        username: row.second_useranme,
                        avatar: row.second_avatar
                    },
                    lastMessage: null
                }
            );
        });
    });


}