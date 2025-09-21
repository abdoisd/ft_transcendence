import { green, red } from "../global.ts";
import { db } from "./database.ts";


const createMessagesTable = () => {
    db.run(`
	CREATE TABLE IF NOT EXISTS messages (
	    id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        reciever_id INTEGER NOT NULL,
        content TEXT,
        content_type TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (sender_id) REFERENCES Users(Id) ON DELETE CASCADE,
        FOREIGN KEY (reciever_id) REFERENCES Users(Id) ON DELETE CASCADE
	);
`, (err: any) => {
        if (err)
            console.error(red, 'Error creating table messages', err);
        else {
            console.log(green, 'Table messages ready');
        }
    });
}


export const createTables = () => {
    createMessagesTable()
}
