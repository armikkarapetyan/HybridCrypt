// backend/src/utils/rsa.js
import crypto from "crypto";

// Generate RSA key pair
export function generateRSAKeys() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
  });
  return { publicKey, privateKey };
}

// Encrypt with public key
export function rsaEncrypt(text, publicKey) {
  return crypto.publicEncrypt(publicKey, Buffer.from(text, "utf8")).toString("base64");
}

// Decrypt with private key
export function rsaDecrypt(encryptedBase64, privateKey) {
  const buffer = Buffer.from(encryptedBase64, "base64");
  return crypto.privateDecrypt(privateKey, buffer).toString("utf8");
}