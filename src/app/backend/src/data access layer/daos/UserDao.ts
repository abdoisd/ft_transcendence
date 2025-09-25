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
        let sql = `SELECT * FROM Users WHERE Id = ? LIMIT 1`;

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
    

    static getBlockedUser = async (id1: number, id2: number) => new Promise((resolve, reject) => {
        let sql = `SELECT * FROM blocked_users WHERE id1 = ? AND id2 = ? LIMIT 1`;

        return db.get(sql, [id1, id2], function (err, row) {
            if (err)
                return reject(err.message);
            return resolve(row);
        });
    });

    static getBlockedOrBlockingUser = async (id1: number, id2: number) => new Promise((resolve, reject) => {
        let sql = `SELECT * FROM blocked_users WHERE (id1 = ? AND id2 = ?) OR (id1 = ? AND id2 = ?) LIMIT 1`;

        return db.get(sql, [id1, id2, id2, id1], function (err, row) {
            if (err)
                return reject(err.message);
            return resolve(row);
        });
    });


    static deleteBlockedUser = async (id: number) => new Promise<boolean>((resolve, reject) => {
        let sql = `DELETE FROM blocked_users WHERE id = ?`;

        return db.run(sql, [id], function (err) {
            if (err)
                return reject(err.message);
            return resolve(true);
        });
    });


    static insertBlockedUser = async (id1: number, id2: number) => new Promise((resolve, reject) => {
        let sql = `INSERT INTO blocked_users (id1, id2) VALUES (?, ?)`;

        return db.run(sql, [id1, id2], function (err) {
            if (err)
                {
            console.log(err.message);
                return reject(err.message);
                }
            return resolve(true);
        });
    });
}