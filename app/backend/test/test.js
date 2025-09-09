import jwt from "jsonwebtoken";

const SECRET_KEY = "my-secret";

function createToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    SECRET_KEY,
    { expiresIn: "1h" }
  );
}

// Validate (verify) a JWT
function validateToken(token) {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return { valid: true, decoded };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

// Example usage
const user = { id: 1, role: "admin" };
const token = createToken(user);
console.log("Generated Token:", token);

const result = validateToken(token);
console.log("Validation Result:", result);

console.log("header.payload.signature(header + payload, secret)");

/** Base64 encoding: it’s meant for binary-to-text encoding
 * so that binary data can travel safely through text-based systems like JSON, URLs, email, etc
 * 
 * data signed
 * extract data
*/

/**
 * when I create a token, I must give it to the client, so that he use it for operations
 * do I save it on server?
 */
