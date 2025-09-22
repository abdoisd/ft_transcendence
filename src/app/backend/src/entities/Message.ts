import type User from "./User.ts";

export default interface Message {
    id: number,
    sender: User,
    receiver: User,
    type: string,
    message: string | null,
    createdAt: number
}