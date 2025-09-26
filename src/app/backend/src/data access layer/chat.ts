import { green, red } from "../global.ts";
import { db } from "./database.ts";


const createMessagesTable = () => {
    db.run(`
	CREATE TABLE IF NOT EXISTS messages (
	    id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        content TEXT,
        content_type TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES Users(Id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES Users(Id) ON DELETE CASCADE
	);

    CREATE INDEX IF NOT EXISTS created_at_idx ON messages (created_at);
    CREATE INDEX IF NOT EXISTS sender_id_idx ON messages (sender_id);
    CREATE INDEX IF NOT EXISTS receiver_id_idx ON messages (receiver_id);
`, (err: any) => {
        if (err)
            console.error(red, 'Error creating table messages', err);
        else {
            console.log(green, 'Table messages ready');
        }
    });
}

const createBlockedUsers = () => {
    db.run(`
	CREATE TABLE IF NOT EXISTS blocked_users (
	    id INTEGER PRIMARY KEY AUTOINCREMENT,
        id1 INTEGER NOT NULL,
        id2 INTEGER NOT NULL,
        FOREIGN KEY (id1) REFERENCES Users(Id) ON DELETE CASCADE,
        FOREIGN KEY (id2) REFERENCES Users(Id) ON DELETE CASCADE,
        UNIQUE (id1, id2)
	);

    CREATE INDEX IF NOT EXISTS id1_idx ON blocked_users (id1);
    CREATE INDEX IF NOT EXISTS id2_idx ON blocked_users (id2);
`, (err: any) => {
        if (err)
            console.error(red, 'Error creating table blocked_users', err);
        else {
            console.log(green, 'Table blocked_users ready');
        }
    });
}



export const createTables = () => {
    createMessagesTable()
    createBlockedUsers()
}
