import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  encrypted: { type: String, required: true }, 
  iv: { type: String }, 
  rsaKey: { type: String }, 
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Message", messageSchema); 