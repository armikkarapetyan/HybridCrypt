import express from "express";
import { Message } from "../models/index.js";
import { fwht, textToVec, nextPow2, ifwht, vecToText, generateKeyFromText } from "../utils/fwht.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { text, keyText } = req.body;
    if (!text || !keyText) {
      return res.status(400).json({ error: "Text and keyText are required" });
    }

    const L = text.length;
    const n = nextPow2(L);
    const vec = textToVec(text, n);
    let encrypted = fwht(vec);

    // Use your key generator
    const key = generateKeyFromText(keyText, n).split("").map(c => c.charCodeAt(0));

    // Add key
    encrypted = encrypted.map((v, i) => v + key[i]);

    const newMessage = new Message({ text, encrypted });
    await newMessage.save();

    res.status(201).json({
      message: "Message encrypted and saved successfully",
      encrypted 
    });

  } catch (err) {
    console.error("POST error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/decrypt", async (req,res) => {
    try {
      const { encrypted, keyText, length } = req.body

      if (!encrypted || !keyText || !length) {
        return res.status(400).json({ error: "Missing data" });
      }

       const n = encrypted.length;
       // Generate same key
       const key = generateKeyFromText(keyText, n).split("").map(c => c.charCodeAt(0));
      // Subtract key
      const spectrum = encrypted.map((v, i) => v - key[i]);
      // Inverse FWHT
      const vec = ifwht(spectrum);
      const text = vecToText(vec, length);

     res.json({ decrypted: text });
 
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;