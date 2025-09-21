import type { User } from "../data access layer/user.ts";
import type Message from "./Message.ts";

export default interface Conversation {
    users: User[],
    lastMessage: Message | null
}