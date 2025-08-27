import Fastify from 'fastify';
import querystring from 'querystring';

const CLIENT_ID = '339240449841-lh801he1b2spt5nakf92i4bd5clvuaje.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:8080/auth/google/callback';

export const fastify = Fastify({logger: true});

// 1️⃣ route for user to login with google
fastify.get('/auth/google', async (req, reply) => {

  const params = querystring.stringify({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
  });

  // redirect user to a google api, with data wanted by google in the url
  // redirect is used by a server so when a user request a page, it give them another page
  reply.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  // fastify request 'url' with status code 302
});

// 2️⃣ route for google, with the callback url
fastify.get('/auth/google/callback', async (req, reply) => {
  const code = req.query.code; // get code from query

  // after google redirect user to callback url
  // we send a request: post data that google wants
  // and await for response with tokens in body
  const googleResponseForToken = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: querystring.stringify({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code'
    })
  });

  console.log("Google response for tokens:", googleResponseForToken);

  const tokens = await googleResponseForToken.json(); // give us body as object literal

  console.log("Tokens:", tokens);

  // then we request info from google, with token in headers (encrypted with https)
  const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` }
  });

  const userInfo = await userRes.json(); // get object literal from fetch response

  //fastify.log.info("User info:", userInfo);
  console.log("User info:", userInfo);

  const queryString = new URLSearchParams(userInfo).toString();

  // sending info to spa
  // redirect to /, server will server /, and spa on load will get the data
  reply.redirect(
    `http://localhost:8080?name=${queryString}`
  );
});

const start = async () => {
  try {
    await fastify.listen({ port: 8080, host: '0.0.0.0' });
    fastify.log.info(`Server running on http://localhost:8080`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
