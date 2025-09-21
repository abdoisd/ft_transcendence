import type Message from "./Message.ts";
import type User from "./User.ts";

export default interface Conversation {
    id: number,
    firstUser: User,
    secondUser: User,
    lastMessage: Message | null
}