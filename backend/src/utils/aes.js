import crypto from "crypto";
import { env } from "../config/env.js";

function getKey(secret = env.AES_SECRET) {
  return crypto.createHash("sha256").update(secret).digest();
}

// Encrypt text with AES-256-CBC
export function aesEncrypt(text, secret = env.AES_SECRET) {
  const key = getKey(secret);
  const iv = crypto.randomBytes(16); 

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");

  return {
    encrypted,
    iv: iv.toString("base64") 
  };
}

// Decrypt AES
export function aesDecrypt(encrypted, secret = env.AES_SECRET, ivBase64) {
  const key = getKey(secret);
  const iv = Buffer.from(ivBase64, "base64");

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encrypted, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}