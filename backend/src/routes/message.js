import express from "express";
import { Message } from "../models/index.js";
import { fwht, ifwht, textToVec, vecToText, nextPow2 } from "../utils/fwht.js";
import { aesEncrypt, aesDecrypt } from "../utils/aes.js";
import { generateRSAKeys, rsaEncrypt, rsaDecrypt } from "../utils/rsa.js";
import { env } from "../config/env.js";

const router = express.Router();

const { publicKey, privateKey } = generateRSAKeys();

router.post("/encrypt", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text required" });

    const L = text.length;
    const n = nextPow2(L);
    const vec = textToVec(text, n);
    const fwhtResult = fwht(vec);

    const { encrypted: aesEncrypted, iv } = aesEncrypt(JSON.stringify(fwhtResult));

    const aesKeyEncrypted = rsaEncrypt(env.AES_SECRET, publicKey);

    const finalPayload = { aesEncrypted, iv, aesKeyEncrypted };
    const finalEncrypted = Buffer.from(JSON.stringify(finalPayload)).toString("base64");

    const newMessage = new Message({
      text,
      encrypted: finalEncrypted
    });
    await newMessage.save();

    res.status(201).json({
      id: newMessage._id,
      encrypted: finalEncrypted
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/decrypt", async (req, res) => {
  try {
    let { id, encrypted } = req.body;

    if (id) {
      const msg = await Message.findById(id);
      if (!msg) return res.status(404).json({ error: "Message not found" });
      encrypted = msg.encrypted;
    }

    if (!encrypted) return res.status(400).json({ error: "Missing encrypted data" });

    const payload = JSON.parse(Buffer.from(encrypted, "base64").toString("utf8"));
    const { aesEncrypted, iv, aesKeyEncrypted } = payload;

    const aesKey = rsaDecrypt(aesKeyEncrypted, privateKey);

    const fwhtJson = aesDecrypt(aesEncrypted, aesKey, iv);
    const fwhtArray = JSON.parse(fwhtJson);

    const decryptedText = vecToText(ifwht(fwhtArray), fwhtArray.length);

    res.json({ decryptedText });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ error: "Message not found" });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Message.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Message not found" });
    res.json({ id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/", async (req, res) => {
  try {
    await Message.deleteMany({});
    res.json({ message: "All deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;