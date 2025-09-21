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
                    createdAt: row.createdAt,
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