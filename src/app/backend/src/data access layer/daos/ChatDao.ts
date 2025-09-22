import type Message from "../../entities/Message.ts";
import type User from "../../entities/User.ts";
import { db } from "../database.ts"

export default class ChatDao {

    static storeMessage = async (senderId: number, receiverId: number, message: string) => new Promise<number>((resolve, reject) => {
        let sql = `INSERT INTO messages (sender_id, receiver_id, content, content_type)
                    VALUES (?, ?, ?, ?)`;

        return db.run(sql, [senderId, receiverId, message, "test"], function (err) {
            if (err)
                return reject(err.message);
            return resolve(this.lastID);
        });
    });


    static getConversation = async (first: number, second: number) => new Promise<Message[]>((resolve, reject) => {
        let sql = `
            SELECT 
            messages.*,
            sender.Id AS sender_id,
            sender.AvatarPath AS sender_avatar,
            sender.Username AS sender_username,
            receiver.Id AS receiver_id,
            receiver.AvatarPath AS receiver_avatar,
            receiver.Username AS receiver_username
            FROM messages
            JOIN Users AS sender ON messages.sender_id = sender.Id
            JOIN Users AS receiver ON messages.receiver_id = receiver.Id
            WHERE (messages.sender_id = ? AND messages.receiver_id = ?) 
            OR (messages.sender_id = ? AND messages.receiver_id = ?)
            ORDER BY created_at DESC
        `;

        return db.all(sql, [first, second, second, first], function (err: { message: any; }, res: any[]) {
            if (err)
                return reject(err.message);
            return resolve(res.map((row: any) => ({
                id: row.id,
                message: row.content,
                createdAt: row.created_at,
                sender: {
                    id: row.sender_id,
                    username: row.sender_username,
                    avatar: row.sender_avatar
                },
                receiver: {
                    id: row.receiver_id,
                    username: row.receiver_username,
                    avatar: row.receiver_avatar
                }
            })));
        });
    });


    static getConversations = async (userId: number) => new Promise<Message[]>((resolve, reject) => {
        let sql = `
            SELECT 
            messages.*,
            sender.Id AS sender_id,
            sender.AvatarPath AS sender_avatar,
            sender.Username AS sender_username,
            receiver.Id AS receiver_id,
            receiver.AvatarPath AS receiver_avatar,
            receiver.Username AS receiver_username
            FROM messages
            JOIN Users AS sender ON messages.sender_id = sender.Id
            JOIN Users AS receiver ON messages.receiver_id = receiver.Id
            WHERE (messages.sender_id = ? OR messages.receiver_id = ?)
            AND messages.created_at = (
                SELECT MAX(created_at)
                FROM messages m2
                WHERE 
                  (m2.sender_id = messages.sender_id AND m2.receiver_id = messages.receiver_id)
                  OR (m2.sender_id = messages.receiver_id AND m2.receiver_id = messages.sender_id)
              )
            ORDER BY created_at DESC
        `;

        return db.all(sql, [userId, userId], function (err: { message: any; }, res: any[]) {
            if (err)
                return reject(err.message);
            return resolve(res.map((row: any) => ({
                id: row.id,
                message: row.content,
                createdAt: row.created_at,
                sender: {
                    id: row.sender_id,
                    username: row.sender_username,
                    avatar: row.sender_avatar
                },
                receiver: {
                    id: row.receiver_id,
                    username: row.receiver_username,
                    avatar: row.receiver_avatar
                }
            })));
        });
    });



    static getMessage = async (id: number) => new Promise<Message | null>((resolve, reject) => {
        let sql = `
            SELECT 
            messages.*,
            sender.Id AS sender_id,
            sender.AvatarPath AS sender_avatar,
            sender.Username AS sender_username,
            receiver.Id AS receiver_id,
            receiver.AvatarPath AS receiver_avatar,
            receiver.Username AS receiver_username
            FROM messages
            JOIN Users AS sender ON messages.sender_id = sender.Id
            JOIN Users AS receiver ON messages.receiver_id = receiver.Id
            WHERE messages.id = ? 
            LIMIT 1;
        `;

        return db.get(sql, [id], function (err, row) {
            if (err)
                return reject(err.message);
            if (!row)
                return resolve(null);
            return resolve(
                {
                    id: row.id,
                    message: row.content,
                    createdAt: row.created_at,
                    sender: {
                        id: row.sender_id,
                        username: row.sender_username,
                        avatar: row.sender_avatar
                    },
                    receiver: {
                        id: row.receiver_id,
                        username: row.receiver_username,
                        avatar: row.receiver_avatar
                    }
                }
            );
        });
    });

}