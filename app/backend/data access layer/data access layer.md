the best thing:

```js
function getUserByGoogleId(googleId: number): Promise<User | null> {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM users WHERE GoogleId = ?", [googleId], (err, row) => {
            if (err) reject(err);
            else resolve(row || null);
        });
    });
}

server.get('/data/user/getByGoogleId', async (req, reply) => {
    const googleId = Number(req.query.GoogleId);
    const user = await getUserByGoogleId(googleId);
    reply.send(user);
});

// NOT THIS

server.get('/data/user/getByGoogleId', (request, reply) => {
	const GoogleId = (request.query as { GoogleId: number }).GoogleId; //the query string is a json object: url ? Id=${encodeURIComponent(Id)
	db.get("select * from users where GoogleId = ?", [GoogleId], (err, row)=> {
		if (err)
		{
			console.error('Error: get /data/user/getByGoogleId: ', err);
			reply.status(500).send();
		}
		else
		{
			if (!row) // user not found
			{
				console.log(red, 'get /data/user/getByGoogleId: User notfound: ', GoogleId);
				reply.status(404).send();
			}
			reply.send(row); // user object as in body as a stringified json
		}
	});
});

// SO I CAN USE getUserByGoogleId in the same server

```