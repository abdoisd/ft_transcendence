export class ClsGlobal {
	static greeting = "Hello, world!";
	static LoggedInUser: string | null = null;
}

// declare: for TS
// Tell TS that globalThis has this property
declare global {
	var clsGlobal: typeof ClsGlobal;
}

globalThis.clsGlobal = ClsGlobal;
