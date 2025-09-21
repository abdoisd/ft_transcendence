import chatApi from "./chat.ts";
import userApi from "./user.ts";

export default function apiRoutes(): void {
    chatApi()
    userApi()
}