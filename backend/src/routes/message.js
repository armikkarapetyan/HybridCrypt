import express from "express";
import { Message } from "../models/index.js";
import { fwht, ifwht, textToVec, vecToText, nextPow2 } from "../utils/fwht.js";
import { aesEncrypt, aesDecrypt } from "../utils/aes.js";
import { generateRSAKeys, rsaEncrypt, rsaDecrypt } from "../utils/rsa.js";
import { env } from "../config/env.js";

const router = express.Router();

// Generate RSA keys (for demo; in prod, save securely)
const { publicKey, privateKey } = generateRSAKeys();

// POST /encrypt
router.post("/", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text required" });

    // FWHT
    const L = text.length;
    const n = nextPow2(L);
    const vec = textToVec(text, n);
    const fwhtResult = fwht(vec);

    // AES
    const { encrypted: aesEncrypted, iv } = aesEncrypt(JSON.stringify(fwhtResult));

    // RSA (encrypt AES key)
    const aesKeyEncrypted = rsaEncrypt(env.AES_SECRET, publicKey);

    // Save in DB
    const newMessage = new Message({
      text,
      encrypted: aesEncrypted,
      iv,
      rsaKey: aesKeyEncrypted
    });
    await newMessage.save();

    res.status(201).json({ message: "Encrypted saved", aesEncrypted, iv, aesKeyEncrypted });
  } catch (err) {
    console.error("ENCRYPT error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /decrypt
router.post("/decrypt", async (req, res) => {
  try {
    const { aesEncrypted, iv, aesKeyEncrypted, length } = req.body;
    if (!aesEncrypted || !iv || !aesKeyEncrypted || !length) {
      return res.status(400).json({ error: "Missing data" });
    }

    // RSA decrypt AES key
    const aesKey = rsaDecrypt(aesKeyEncrypted, privateKey);

    // AES decrypt
    const fwhtJson = aesDecrypt(aesEncrypted, aesKey, iv);
    const fwhtArray = JSON.parse(fwhtJson);

    // Inverse FWHT
    const decryptedText = vecToText(ifwht(fwhtArray), length);

    res.json({ decryptedText });
  } catch (err) {
    console.error("DECRYPT error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;