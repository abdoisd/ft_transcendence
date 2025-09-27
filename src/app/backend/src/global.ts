export const red: string     = "\x1b[31m%s\x1b[0m";
export const green: string   = "\x1b[32m%s\x1b[0m";
export const yellow: string  = "\x1b[33m%s\x1b[0m";
export const blue: string    = "\x1b[34m%s\x1b[0m";
export const magenta: string = "\x1b[35m%s\x1b[0m";
export const cyan: string    = "\x1b[36m%s\x1b[0m";

export function guid()
{
	return crypto.randomUUID();
}

export const config = {
	WEBSITE_URL: process.env.WEBSITE_URL,
	PORT: process.env.PORT,
	HOST: process.env.HOST,
	SERVER_URL: process.env.SERVER_URL
};
