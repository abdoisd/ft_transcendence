import type Message from "../../entities/Message.ts";
import type User from "../../entities/User.ts";
import { db } from "../database.ts"

export default class ChatDao {

    static storeMessage = async (senderId: number, receiverId: number, message: string) => new Promise<number>((resolve, reject) => {
        let sql = `INSERT INTO messages (sender_id, reciever_id, content, content_type)
                    VALUES (?, ?, ?, ?)`;

        return db.run(sql, [senderId, receiverId, message, "test"], function (err) {
            if (err)
                return reject(err.message);
            return resolve(this.lastID);
        });
    });


    static getMessage = async (id: number) => new Promise<Message | null>((resolve, reject) => {
        let sql = `SELECT * FROM messages WHERE Id == ? LIMIT 1`;

        return db.get(sql, [id], function (err, row) {
            if (err)
                return reject(err.message);
            if (!row)
                return resolve(null);
            return resolve(
                {
                    id: row.id,
                    message: row.content,
                    createdAt: row.createdAt
                }
            );
        });
    });

}