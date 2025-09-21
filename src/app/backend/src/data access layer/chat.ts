import { green, red } from "../global.ts";
import { db } from "./database.ts";

const createConversationPartsTable = () => {
    db.run(`
	CREATE TABLE IF NOT EXISTS conversation_parts (
        user_id INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES Users(Id) ON DELETE CASCADE,
	);
`, (err: any) => {
        if (err)
            console.error(red, 'Error creating table conversation_parts', err);
        else
            console.log(green, 'Table conversation_parts ready');
    });
}


const createConversationsTable = () => {
    db.run(`
	CREATE TABLE IF NOT EXISTS conversations (
	    id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT DEFAULT NULL,
        conversation_id INTEGER NOT NULL,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
	);
`, (err: any) => {
        if (err)
            console.error(red, 'Error creating table conversations', err);
        else {
            console.log(green, 'Table conversations ready');
        }
    });
}


export const createTables = () => {
    createConversationsTable()
}
