import { UserDTO } from "./business layer/user.ts"

export class ClsGlobal {
	static greeting = "Hello, world!";
	static LoggedInUser: UserDTO | null = null;
	static userId: number; // for 2fa
		
}

declare global {
	var clsGlobal: typeof ClsGlobal;
}

globalThis.clsGlobal = ClsGlobal;
