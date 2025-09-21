import { green, red } from "../global.ts";
import { db } from "./database.ts";


const createConversationsTable = () => {
    db.run(`
	CREATE TABLE IF NOT EXISTS conversations (
	    id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT DEFAULT NULL,
        first_user_id INTEGER NOT NULL,
        second_user_id INTEGER NOT NULL,
        FOREIGN KEY (first_user_id) REFERENCES Users(Id) ON DELETE CASCADE,
        FOREIGN KEY (second_user_id) REFERENCES Users(Id) ON DELETE CASCADE
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
