import { UserDTO } from "./business layer/user.ts"

export class ClsGlobal {
	static greeting = "Hello, world!";
	static LoggedInUser: UserDTO | null = null;
	static userId: number; // for 2fa
	// static gameManager: ; // what game the user is in
		
}

// declare: for TS
// Tell TS that globalThis has this property
declare global {
	var clsGlobal: typeof ClsGlobal;
}

globalThis.clsGlobal = ClsGlobal;
