import type { FastifyInstance } from "fastify";
import sqlite3 from "sqlite3";

// Initialize database
const db = new sqlite3.Database('users.db');

// data access layer
function addUserToDatabase(user: { username: string; password: string }) // user object
{
	const { username, password } = user;

		if (!username || !password) {
			// backend error
			return;
		}
	
		const query = `INSERT INTO users (username, password) VALUES (?, ?)`; // values inserted auto

		db.run(query, [username, password], function(err) {
			if (err) {
				// backend error
				return;
			}
			// log inserted user
			// `this.lastID` is the ID of the inserted row
			// reply.send({ id: this.lastID, username, password });
		});
}

function findUserByUsername(username: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM users WHERE username = ?`;
        db.get(sql, [username], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row); // row is user
            }
        });
    });
}

// Function to register database routes
export function registerDatabaseRoutes(server: FastifyInstance) {

	// functionality:
	// args: json data in request.body
	// return: json data
	server.post('/api/login', (request, reply) => {

		// if new username
			// add to database
		// else
			// check password
			// if correct, load login
		
		const { username, password } = request.body as { username: string; password: string };
		
		// I have to know where they get user
		findUserByUsername(username).then(user => {
			if (!user) {
				console.log("New user, adding to database");
				addUserToDatabase({ username: username, password: password });
			} else {
				console.log("User exists, checking password");
				if (password == user.password)
				{
					console.log("Correct password");
					reply.send({ success: true });
				}
				else
				{
					console.log("Wrong password");
					reply.send({ success: false });
				}
			}
		});
	});
}
