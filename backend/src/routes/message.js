import express from "express";
import { Message } from "../models/index.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const newMessage = new Message({ text });

    await newMessage.save();

    res.status(201).json({
      message: "Message saved successfully",
      data: newMessage
    });

  } catch (err) {
    console.error("POST error:", err);
    res.status(500).json({ error: "Server error" });
  }
});
export default router;