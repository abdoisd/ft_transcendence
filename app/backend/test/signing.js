// signing is not about, asymmetric encryption, it's about: knowing a secret that only you know
// so if there is a message with that secret, it's yours

// note: when you sign, you can't see the secret in the signature, it's a hash of the message and the secret

import crypto from 'crypto';

// Generate RSA key pair
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

// console.log("\n", publicKey);
// console.log(privateKey);

// Sign data
const sign = crypto.createSign('SHA256');
sign.update('Hello, world!');
const signature = sign.sign(privateKey, 'hex'); // we sign data with some secret

// console.log('Signature:', signature, "\n");

// Verify signature
const verify = crypto.createVerify('SHA256');
verify.update('Hello, world!');
const isVerified = verify.verify(publicKey, signature, 'hex');

// console.log('Signature valid:', isVerified);
